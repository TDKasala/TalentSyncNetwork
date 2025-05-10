import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/lib/i18n';
import { useUser } from '@/hooks/useUser';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AtsReferralModal } from '@/components/modals/AtsReferralModal';
import { Match } from '@shared/schema';
import { Loader2, CheckCircle } from 'lucide-react';
import Header from '@/components/layout/Header';

const PaymentSuccessPage = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user } = useUser();
  const [location, setLocation] = useLocation();
  const [showAtsModal, setShowAtsModal] = useState(false);
  const [matchId, setMatchId] = useState<number | null>(null);

  // Parse query params from URL
  useEffect(() => {
    // PayFast might return query parameters like m_payment_id, etc.
    const urlParams = new URLSearchParams(window.location.search);
    const paymentId = urlParams.get('m_payment_id');
    
    // Check if there's a matchId stored in sessionStorage from before the payment flow
    const storedMatchId = sessionStorage.getItem('lastUnlockedMatchId');
    if (storedMatchId) {
      setMatchId(parseInt(storedMatchId, 10));
    }

    // Update page title
    document.title = `${t('Payment Success')} | ${t('app.name')}`;
  }, [t]);

  // Fetch match details if we have a matchId
  const { data: match, isLoading } = useQuery<Match>({
    queryKey: ['/api/matches/details', matchId],
    queryFn: async () => {
      if (!matchId) throw new Error('No match ID provided');
      const response = await fetch(`/api/matches/${matchId}`, {
        headers: {
          'Authorization': localStorage.getItem('token') 
            ? `Bearer ${localStorage.getItem('token')}` 
            : '',
        }
      });
      if (!response.ok) throw new Error('Failed to fetch match details');
      return response.json();
    },
    enabled: !!matchId && !!user && user.role === 'candidate',
  });

  // Show ATS referral modal if the user is a candidate and we have match details
  useEffect(() => {
    if (match && user && user.role === 'candidate') {
      setShowAtsModal(true);
    }
  }, [match, user]);

  const handleCloseModal = () => {
    setShowAtsModal(false);
    // Clear the stored matchId
    sessionStorage.removeItem('lastUnlockedMatchId');
  };

  const handleGoToDashboard = () => {
    const dashboardPath = user?.role === 'candidate' 
      ? '/dashboard/candidate' 
      : '/dashboard/recruiter';
    setLocation(dashboardPath);
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      <main className="flex-grow flex items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 flex items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl">{t('Payment Successful')}</CardTitle>
            <CardDescription>
              {t('Your payment has been processed successfully')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-neutral-700">
              {user?.role === 'candidate'
                ? t('You can now view the recruiter details for this job match.')
                : t('You can now view the candidate details for this match.')}
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={handleGoToDashboard}>
              {t('Go to Dashboard')}
            </Button>
          </CardFooter>
        </Card>
      </main>
      
      {/* ATS Referral Modal for candidates */}
      {match && showAtsModal && (
        <AtsReferralModal 
          isOpen={showAtsModal} 
          onClose={handleCloseModal} 
          match={match}
        />
      )}
    </div>
  );
};

export default PaymentSuccessPage;