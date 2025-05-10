import { useLanguage } from '@/lib/i18n';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

const Pricing = () => {
  const { t } = useLanguage();

  return (
    <section className="py-12 bg-neutral-50" id="pricing">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-neutral-900">{t('pricing.title')}</h2>
          <p className="mt-4 text-lg text-neutral-600 max-w-2xl mx-auto">{t('pricing.subtitle')}</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Free Plan */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-neutral-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">{t('pricing.free.title')}</h3>
              <div className="mt-4 flex items-baseline text-neutral-900">
                <span className="text-3xl font-bold tracking-tight">{t('pricing.free.price')}</span>
                <span className="ml-1 text-neutral-500">/month</span>
              </div>
              <p className="mt-2 text-sm text-neutral-600">{t('pricing.free.description')}</p>
              
              <ul className="mt-6 space-y-4">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="ml-2 text-sm text-neutral-600">Create a profile</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="ml-2 text-sm text-neutral-600">Post jobs/skills</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="ml-2 text-sm text-neutral-600">View match notifications</span>
                </li>
                <li className="flex items-start">
                  <X className="h-5 w-5 text-neutral-400 shrink-0 mt-0.5" />
                  <span className="ml-2 text-sm text-neutral-500">Contact matched users</span>
                </li>
              </ul>
              
              <Button 
                variant="outline" 
                className="mt-8 w-full" 
                asChild
              >
                <Link href="/auth/register">Get Started</Link>
              </Button>
            </div>
          </div>
          
          {/* Pay-Per-Match - Candidate */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-neutral-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">{t('pricing.candidate.title')}</h3>
              <div className="mt-4 flex items-baseline text-neutral-900">
                <span className="text-3xl font-bold tracking-tight">{t('pricing.candidate.price')}</span>
                <span className="ml-1 text-neutral-500">/match</span>
              </div>
              <p className="mt-2 text-sm text-neutral-600">{t('pricing.candidate.description')}</p>
              
              <ul className="mt-6 space-y-4">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="ml-2 text-sm text-neutral-600">All Free features</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="ml-2 text-sm text-neutral-600">Unlock recruiter contact details</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="ml-2 text-sm text-neutral-600">Direct messaging</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="ml-2 text-sm text-neutral-600">WhatsApp notifications</span>
                </li>
              </ul>
              
              <Button 
                className="mt-8 w-full"
                asChild 
              >
                <Link href="/auth/register?role=candidate">Try It Now</Link>
              </Button>
            </div>
          </div>
          
          {/* Pay-Per-Match - Recruiter */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-neutral-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">{t('pricing.recruiter.title')}</h3>
              <div className="mt-4 flex items-baseline text-neutral-900">
                <span className="text-3xl font-bold tracking-tight">{t('pricing.recruiter.price')}</span>
                <span className="ml-1 text-neutral-500">/match</span>
              </div>
              <p className="mt-2 text-sm text-neutral-600">{t('pricing.recruiter.description')}</p>
              
              <ul className="mt-6 space-y-4">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="ml-2 text-sm text-neutral-600">All Free features</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="ml-2 text-sm text-neutral-600">Unlock candidate contact details</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="ml-2 text-sm text-neutral-600">B-BBEE basic reporting</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="ml-2 text-sm text-neutral-600">WhatsApp notifications</span>
                </li>
              </ul>
              
              <Button 
                className="mt-8 w-full"
                asChild 
              >
                <Link href="/auth/register?role=recruiter">Try It Now</Link>
              </Button>
            </div>
          </div>
          
          {/* Premium Recruiter */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-primary-600 ring-1 ring-primary-600">
            <div className="p-1 bg-primary-600">
              <p className="text-xs font-medium text-white text-center">Most Popular</p>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">{t('pricing.premium.title')}</h3>
              <div className="mt-4 flex items-baseline text-neutral-900">
                <span className="text-3xl font-bold tracking-tight">{t('pricing.premium.price')}</span>
                <span className="ml-1 text-neutral-500">/month</span>
              </div>
              <p className="mt-2 text-sm text-neutral-600">{t('pricing.premium.description')}</p>
              
              <ul className="mt-6 space-y-4">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="ml-2 text-sm text-neutral-600">Unlimited match unlocks</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="ml-2 text-sm text-neutral-600">Priority matching</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="ml-2 text-sm text-neutral-600">Advanced B-BBEE analytics</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="ml-2 text-sm text-neutral-600">CSV/PDF export of reports</span>
                </li>
              </ul>
              
              <Button 
                className="mt-8 w-full"
                asChild 
              >
                <Link href="/auth/register?role=recruiter">Get Premium</Link>
              </Button>
            </div>
          </div>
        </div>
        
        <div className="mt-10 bg-neutral-100 rounded-lg p-6">
          <div className="flex items-start md:items-center flex-col md:flex-row md:justify-between">
            <div className="mb-4 md:mb-0 md:mr-6">
              <h3 className="text-lg font-semibold text-neutral-900">{t('pricing.enterprise.title')}</h3>
              <p className="mt-1 text-neutral-600">{t('pricing.enterprise.description')}</p>
            </div>
            <Button 
              variant="outline" 
              className="bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50 flex-shrink-0"
            >
              {t('pricing.enterprise.contact')}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
