import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/lib/auth';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import Header from '@/components/layout/Header';

const PaymentCancelPage = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user } = useUser();
  const [location, setLocation] = useLocation();

  // Update page title
  useEffect(() => {
    document.title = `${t('Payment Cancelled')} | ${t('app.name')}`;
    
    // Clean up any stored match IDs
    sessionStorage.removeItem('lastUnlockedMatchId');
  }, [t]);

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
            <div className="mx-auto mb-4 w-12 h-12 flex items-center justify-center rounded-full bg-amber-100">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
            <CardTitle className="text-2xl">{t('Payment Cancelled')}</CardTitle>
            <CardDescription>
              {t('Your payment has been cancelled')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-neutral-700">
              {t('You can try again later or contact our support team if you need assistance.')}
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={handleGoToDashboard}>
              {t('Return to Dashboard')}
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default PaymentCancelPage;