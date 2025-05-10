import { useLanguage } from '@/lib/i18n';
import { User, Clipboard, Calendar } from 'lucide-react';

const Features = () => {
  const { t } = useLanguage();

  return (
    <section className="py-12 bg-white" id="how-it-works">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-neutral-900">
            {t('how-it-works.title')}
          </h2>
          <p className="mt-4 text-lg text-neutral-600 max-w-2xl mx-auto">
            {t('how-it-works.subtitle')}
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-neutral-50 rounded-xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <User className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-heading font-semibold mb-2 text-neutral-900">
              {t('how-it-works.step1.title')}
            </h3>
            <p className="text-neutral-600">
              {t('how-it-works.step1.description')}
            </p>
            <div className="mt-4 pt-4 border-t border-neutral-200">
              <div className="flex items-center text-sm text-neutral-500">
                <span className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center mr-2 font-medium">1</span>
                {t('how-it-works.step1.action')}
              </div>
            </div>
          </div>
          
          {/* Feature 2 */}
          <div className="bg-neutral-50 rounded-xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <Clipboard className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-heading font-semibold mb-2 text-neutral-900">
              {t('how-it-works.step2.title')}
            </h3>
            <p className="text-neutral-600">
              {t('how-it-works.step2.description')}
            </p>
            <div className="mt-4 pt-4 border-t border-neutral-200">
              <div className="flex items-center text-sm text-neutral-500">
                <span className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center mr-2 font-medium">2</span>
                {t('how-it-works.step2.action')}
              </div>
            </div>
          </div>
          
          {/* Feature 3 */}
          <div className="bg-neutral-50 rounded-xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-heading font-semibold mb-2 text-neutral-900">
              {t('how-it-works.step3.title')}
            </h3>
            <p className="text-neutral-600">
              {t('how-it-works.step3.description')}
            </p>
            <div className="mt-4 pt-4 border-t border-neutral-200">
              <div className="flex items-center text-sm text-neutral-500">
                <span className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center mr-2 font-medium">3</span>
                {t('how-it-works.step3.action')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
