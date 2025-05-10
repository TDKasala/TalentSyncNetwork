import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/lib/i18n';
import { useUser } from '@/hooks/useUser';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle } from 'lucide-react';
import Header from '@/components/layout/Header';

const PaymentCancelPage = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user } = useUser();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // Clear any stored match ID since payment was cancelled
    sessionStorage.removeItem('lastUnlockedMatchId');
    
    // Show toast notification
    toast({
      title: t('Payment Cancelled'),
      description: t('Your payment process was cancelled.'),
      variant: 'destructive',
    });
    
    // Update page title
    document.title = `${t('Payment Cancelled')} | ${t('app.name')}`;
  }, [t, toast]);

  const handleGoToDashboard = () => {
    const dashboardPath = user?.role === 'candidate' 
      ? '/dashboard/candidate' 
      : '/dashboard/recruiter';
    setLocation(dashboardPath);
  };

  const handleTryAgain = () => {
    // Go back to previous page
    window.history.back();
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      <main className="flex-grow flex items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 flex items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl">{t('Payment Cancelled')}</CardTitle>
            <CardDescription>
              {t('Your payment process has been cancelled')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-neutral-700">
              {t('You can try again or return to your dashboard.')}
            </p>
          </CardContent>
          <CardFooter className="flex justify-center gap-4">
            <Button variant="outline" onClick={handleTryAgain}>
              {t('Try Again')}
            </Button>
            <Button onClick={handleGoToDashboard}>
              {t('Go to Dashboard')}
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default PaymentCancelPage;