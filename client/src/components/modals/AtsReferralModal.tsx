import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Match } from '@shared/schema';
import { useLanguage } from '@/lib/i18n';

interface AtsReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: Match;
}

export function AtsReferralModal({ isOpen, onClose, match }: AtsReferralModalProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOptimize = async () => {
    setIsSubmitting(true);
    try {
      await apiRequest(`/api/ats-referrals`, {
        method: 'POST',
        data: {
          userId: match.candidateId,
          matchId: match.id,
          action: 'optimize',
        },
      });

      // Redirect to ATSBoost.co.za with user data
      window.location.href = `https://atsboost.co.za/?ref=talentsyncza&matchId=${match.id}`;
      
      // We don't need to close the modal since we're redirecting
    } catch (error) {
      console.error('Error creating ATS referral:', error);
      toast({
        title: t('Error'),
        description: t('Failed to record your selection. Please try again.'),
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    setIsSubmitting(true);
    try {
      await apiRequest(`/api/ats-referrals`, {
        method: 'POST',
        data: {
          userId: match.candidateId,
          matchId: match.id,
          action: 'skip',
        },
      });

      toast({
        title: t('Noted'),
        description: t('You can always optimize your CV later from your dashboard.'),
      });

      setIsSubmitting(false);
      onClose();
      
      // Invalidate any queries that might depend on the referral status
      queryClient.invalidateQueries({ queryKey: ['/api/matches'] });
    } catch (error) {
      console.error('Error creating ATS referral:', error);
      toast({
        title: t('Error'),
        description: t('Failed to record your selection. Please try again.'),
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {t('Boost Your Job Application Success!')}
          </DialogTitle>
          <DialogDescription className="pt-2 text-base">
            {t('Congratulations on your match! Did you know that over 75% of CVs get rejected by Applicant Tracking Systems (ATS) before a human ever sees them?')}
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 my-2 bg-slate-50 rounded-lg">
          <h3 className="font-semibold text-lg mb-2">{t('Optimize your CV for this job')}</h3>
          <p>{t('Our partner ATSBoost.co.za can analyze and optimize your CV to ensure it passes through ATS filters and reaches human recruiters.')}</p>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>{t('Increase your chances by up to 70%')}</li>
            <li>{t('One-time fee of ZAR 200')}</li>
            <li>{t('24-hour turnaround time')}</li>
          </ul>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleSkip}
            disabled={isSubmitting}
            className="sm:flex-1"
          >
            {t('Skip for now')}
          </Button>
          <Button 
            type="button"
            onClick={handleOptimize}
            disabled={isSubmitting}
            className="sm:flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
          >
            {t('Optimize my CV')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}