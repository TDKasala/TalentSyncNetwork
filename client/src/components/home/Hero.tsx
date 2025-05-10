import { Link } from 'wouter';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

const Hero = () => {
  const { t } = useLanguage();

  return (
    <section className="relative bg-primary-700 text-white py-12 md:py-24 overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        {/* A grid of abstract nodes and connections representing AI matching */}
        <svg 
          className="w-full h-full" 
          width="100%" 
          height="100%" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern 
              id="grid-pattern" 
              width="60" 
              height="60" 
              patternUnits="userSpaceOnUse"
            >
              <circle cx="15" cy="15" r="2" fill="none" stroke="#fff" strokeWidth="0.5" strokeOpacity="0.15" />
              <circle cx="45" cy="15" r="3" fill="none" stroke="#fff" strokeWidth="0.5" strokeOpacity="0.15" />
              <circle cx="30" cy="30" r="4" fill="none" stroke="#fff" strokeWidth="0.5" strokeOpacity="0.15" />
              <circle cx="15" cy="45" r="3" fill="none" stroke="#fff" strokeWidth="0.5" strokeOpacity="0.15" />
              <circle cx="45" cy="45" r="2" fill="none" stroke="#fff" strokeWidth="0.5" strokeOpacity="0.15" />
              <path d="M15 15L45 15M45 15L30 30M30 30L15 45M15 45L45 45M45 45L30 30M30 30L15 15" fill="none" stroke="#fff" strokeWidth="0.5" strokeOpacity="0.15" />
            </pattern>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#grid-pattern)" />
        </svg>
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="md:flex md:items-center md:justify-between">
          <div className="md:w-1/2 md:pr-10">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold leading-tight mb-6">
              {t('home.hero.title')} <span className="text-accent-500">{t('app.tagline')}</span>
            </h1>
            <p className="text-lg md:text-xl mb-8 text-neutral-100">
              {t('home.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Button
                asChild
                size="lg"
                variant="default"
                className="bg-white text-primary-700 hover:bg-neutral-100 shadow-md"
              >
                <Link href="/auth/register?role=candidate">
                  {t('home.hero.jobseeker')}
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="bg-secondary-500 hover:bg-secondary-600 text-white shadow-md"
              >
                <Link href="/auth/register?role=recruiter">
                  {t('home.hero.recruiter')}
                </Link>
              </Button>
            </div>
            <div className="mt-6 flex items-center flex-wrap">
              <div className="flex items-center mr-6 mb-2">
                <Check className="h-5 w-5 text-accent-500" />
                <span className="ml-2 text-sm text-neutral-100">{t('home.hero.popia')}</span>
              </div>
              <div className="flex items-center mb-2">
                <Check className="h-5 w-5 text-accent-500" />
                <span className="ml-2 text-sm text-neutral-100">{t('home.hero.bbbee')}</span>
              </div>
            </div>
          </div>
          <div className="hidden md:block md:w-1/2 md:pl-10 mt-8 md:mt-0">
            {/* A mobile phone mockup showing the TalentSyncZA app */}
            <div className="relative w-full max-w-md mx-auto">
              <div className="rounded-xl bg-white shadow-2xl overflow-hidden">
                <div className="h-12 bg-neutral-200 flex items-center justify-center rounded-t-xl">
                  <div className="w-20 h-6 bg-neutral-300 rounded-full"></div>
                </div>
                <div className="p-5 bg-primary-50">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary-100"></div>
                    <div className="ml-3">
                      <div className="h-4 w-24 bg-neutral-200 rounded"></div>
                      <div className="h-3 w-16 bg-neutral-200 rounded mt-1"></div>
                    </div>
                  </div>
                  <div className="h-20 bg-white rounded-lg mb-4 p-3">
                    <div className="h-3 w-3/4 bg-neutral-200 rounded mb-2"></div>
                    <div className="h-3 w-1/2 bg-neutral-200 rounded mb-2"></div>
                    <div className="h-3 w-2/3 bg-neutral-200 rounded"></div>
                  </div>
                  <div className="h-20 bg-white rounded-lg mb-4 p-3">
                    <div className="h-3 w-3/4 bg-neutral-200 rounded mb-2"></div>
                    <div className="h-3 w-1/2 bg-neutral-200 rounded mb-2"></div>
                    <div className="h-3 w-2/3 bg-neutral-200 rounded"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="h-8 w-20 bg-primary-500 rounded"></div>
                    <div className="h-8 w-20 bg-neutral-200 rounded"></div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-secondary-500 rounded-full flex items-center justify-center text-white text-lg font-bold">
                New!
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
