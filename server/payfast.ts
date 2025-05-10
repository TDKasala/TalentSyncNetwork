import crypto from 'crypto';
import querystring from 'querystring';
import { Transaction } from '@shared/schema';
import { storage } from './storage';

// Default PayFast configuration
const PAYFAST_MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID || '';
const PAYFAST_MERCHANT_KEY = process.env.PAYFAST_MERCHANT_KEY || '';
const PAYFAST_PASSPHRASE = process.env.PAYFAST_PASSPHRASE || '';
const PAYFAST_HOST = process.env.NODE_ENV === 'production'
  ? 'https://www.payfast.co.za'
  : 'https://sandbox.payfast.co.za';

interface PayfastPaymentData {
  merchant_id: string;
  merchant_key: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  m_payment_id: string;
  amount: string;
  item_name: string;
  item_description?: string;
  email_address: string;
  name_first?: string;
  name_last?: string;
  custom_str1?: string;
  custom_str2?: string;
  custom_str3?: string;
  custom_str4?: string;
  custom_str5?: string;
  custom_int1?: string;
  custom_int2?: string;
  custom_int3?: string;
  custom_int4?: string;
  custom_int5?: string;
  signature?: string;
}

// Generate a PayFast payment URL
export async function createPaymentUrl(
  userId: number,
  matchId: number | null,
  amount: number,
  itemName: string,
  itemDescription: string,
  email: string,
  firstName?: string,
  lastName?: string,
  returnUrl?: string,
  cancelUrl?: string,
  notifyUrl?: string
): Promise<{ paymentUrl: string; transactionId: number }> {
  // Generate a unique payment ID
  const paymentId = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  
  // Create a new transaction record
  const transaction = await storage.createTransaction({
    userId,
    matchId,
    amount,
    currency: 'ZAR',
    status: 'pending',
    paymentProvider: 'payfast',
    paymentId,
    metadata: {
      itemName,
      itemDescription
    }
  });

  // Prepare the payment data
  const data: PayfastPaymentData = {
    merchant_id: PAYFAST_MERCHANT_ID,
    merchant_key: PAYFAST_MERCHANT_KEY,
    return_url: returnUrl || `${process.env.APP_URL}/payment/success`,
    cancel_url: cancelUrl || `${process.env.APP_URL}/payment/cancel`,
    notify_url: notifyUrl || `${process.env.API_URL}/api/payments/notify`,
    m_payment_id: paymentId,
    amount: amount.toFixed(2),
    item_name: itemName,
    item_description: itemDescription,
    email_address: email,
    custom_int1: userId.toString(),
    custom_int2: transaction.id.toString()
  };

  if (firstName) {
    data.name_first = firstName;
  }

  if (lastName) {
    data.name_last = lastName;
  }

  if (matchId) {
    data.custom_int3 = matchId.toString();
  }

  // Generate signature
  data.signature = generateSignature(data);

  // Build the payment URL
  const paymentUrl = `${PAYFAST_HOST}/eng/process?${querystring.stringify(data)}`;

  return {
    paymentUrl,
    transactionId: transaction.id
  };
}

// Generate a signature for PayFast API
function generateSignature(data: Record<string, string>): string {
  // Create a sorted array of the data fields
  const pfData = Object.keys(data)
    .filter(key => key !== 'signature')
    .sort()
    .reduce((result: Record<string, string>, key) => {
      result[key] = data[key];
      return result;
    }, {});
  
  // Convert the data to a query string
  const pfParamString = querystring.stringify(pfData);
  
  // Add the passphrase if it exists
  const stringToHash = pfParamString + (PAYFAST_PASSPHRASE ? `&passphrase=${encodeURIComponent(PAYFAST_PASSPHRASE)}` : '');
  
  // Generate the MD5 hash
  return crypto.createHash('md5').update(stringToHash).digest('hex');
}

// Verify the payment notification from PayFast
export async function verifyPaymentNotification(
  pfData: Record<string, string>,
  pfParamString: string,
  pfHost: string = PAYFAST_HOST
): Promise<boolean> {
  const signature = generateSignature(pfData);
  
  // Verify signature
  if (pfData.signature !== signature) {
    return false;
  }
  
  // Verify source IP belongs to PayFast
  // Implementation omitted for brevity - would check IP against PayFast's known IPs
  
  // Update transaction status based on payment status
  const transactionId = parseInt(pfData.custom_int2, 10);
  const transaction = await updateTransactionStatus(transactionId, pfData.payment_status);
  
  // If match ID is provided, update match status
  if (pfData.custom_int3 && transaction) {
    const matchId = parseInt(pfData.custom_int3, 10);
    const userId = parseInt(pfData.custom_int1, 10);
    await processMatchUnlock(matchId, userId, transaction);
  }
  
  return true;
}

// Update the transaction status based on the payment status
async function updateTransactionStatus(
  transactionId: number,
  paymentStatus: string
): Promise<Transaction | undefined> {
  let status: string;
  
  switch (paymentStatus.toLowerCase()) {
    case 'complete':
      status = 'completed';
      break;
    case 'failed':
      status = 'failed';
      break;
    case 'pending':
      status = 'pending';
      break;
    case 'cancelled':
      status = 'cancelled';
      break;
    default:
      status = 'unknown';
  }
  
  return await storage.updateTransaction(transactionId, { status });
}

// Process match unlock after successful payment
async function processMatchUnlock(
  matchId: number,
  userId: number,
  transaction: Transaction
): Promise<void> {
  const match = await storage.getMatch(matchId);
  
  if (!match) {
    return;
  }
  
  // Check if the user is the candidate or recruiter
  if (match.candidateId === userId) {
    await storage.updateMatch(matchId, { unlockedByCandidate: true });
  } else if (match.recruiterId === userId) {
    await storage.updateMatch(matchId, { unlockedByRecruiter: true });
  }
  
  // If both parties have unlocked, update status to 'unlocked'
  const updatedMatch = await storage.getMatch(matchId);
  if (updatedMatch?.unlockedByCandidate && updatedMatch?.unlockedByRecruiter) {
    await storage.updateMatch(matchId, { status: 'unlocked' });
  }
}

// Get transaction status
export async function getTransactionStatus(transactionId: number): Promise<string | null> {
  const transaction = await storage.getTransactionsByUser(transactionId);
  
  if (!transaction) {
    return null;
  }
  
  return transaction[0].status;
}
