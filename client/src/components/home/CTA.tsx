import { Link } from 'wouter';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';

const CTA = () => {
  const { t } = useLanguage();

  return (
    <section className="bg-primary-700 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-white mb-6">{t('cta.title')}</h2>
        <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">{t('cta.subtitle')}</p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Button 
            asChild
            size="lg"
            variant="default"
            className="bg-white text-primary-700 hover:bg-neutral-100 transition-colors"
          >
            <Link href="/auth/register?role=candidate">
              {t('cta.jobseeker')}
            </Link>
          </Button>
          <Button 
            asChild
            size="lg" 
            variant="secondary"
            className="bg-secondary-500 text-white hover:bg-secondary-600 transition-colors"
          >
            <Link href="/auth/register?role=recruiter">
              {t('cta.recruiter')}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTA;
