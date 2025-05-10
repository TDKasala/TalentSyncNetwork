import { useLanguage } from '@/lib/i18n';
import { Shield, BarChart2, Zap } from 'lucide-react';

const Compliance = () => {
  const { t } = useLanguage();

  return (
    <section className="py-12 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="md:w-1/2 md:pr-10">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-neutral-900 mb-6">
              {t('compliance.title')}
            </h2>
            <div className="space-y-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-md bg-primary-100 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-primary-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-neutral-900">{t('compliance.popia.title')}</h3>
                  <p className="mt-2 text-neutral-600">{t('compliance.popia.description')}</p>
                </div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-md bg-primary-100 flex items-center justify-center">
                    <BarChart2 className="h-6 w-6 text-primary-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-neutral-900">{t('compliance.bbbee.title')}</h3>
                  <p className="mt-2 text-neutral-600">{t('compliance.bbbee.description')}</p>
                </div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-md bg-primary-100 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-primary-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-neutral-900">{t('compliance.matching.title')}</h3>
                  <p className="mt-2 text-neutral-600">{t('compliance.matching.description')}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-10 md:mt-0 md:w-1/2 md:pl-10">
            {/* B-BBEE Analytics Dashboard Preview */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-neutral-200">
              <div className="p-6 bg-neutral-50 border-b border-neutral-200">
                <h3 className="text-lg font-semibold text-neutral-900">B-BBEE Analytics Dashboard</h3>
                <p className="text-sm text-neutral-600 mt-1">Recruiter view of diversity metrics</p>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-neutral-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-neutral-500 mb-2">Candidate Diversity</div>
                      <div className="h-32 bg-neutral-100 rounded-md flex items-center justify-center">
                        <svg viewBox="0 0 100 100" width="100" height="100" className="text-primary-500">
                          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="10" strokeDasharray="80 251.2" strokeDashoffset="0"></circle>
                          <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="10" strokeDasharray="171.2 251.2" strokeDashoffset="-80"></circle>
                        </svg>
                      </div>
                    </div>
                    <div className="bg-neutral-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-neutral-500 mb-2">Hiring by Level</div>
                      <div className="h-32 bg-neutral-100 rounded-md flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
                          <rect x="10" y="60" width="15" height="30" fill="#0284c7" />
                          <rect x="30" y="40" width="15" height="50" fill="#0ea5e9" />
                          <rect x="50" y="50" width="15" height="40" fill="#38bdf8" />
                          <rect x="70" y="30" width="15" height="60" fill="#7dd3fc" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="bg-neutral-50 p-4 rounded-lg">
                    <div className="text-sm font-medium text-neutral-500 mb-2">B-BBEE Compliance Status</div>
                    <div className="h-8 bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 rounded-md relative">
                      <div className="absolute top-0 right-0 bottom-0 h-full w-1/5 bg-white opacity-50 rounded-r-md"></div>
                      <div className="absolute -bottom-5 right-1/5 transform translate-x-1/2">
                        <div className="w-3 h-3 bg-neutral-900 rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex justify-between mt-6 text-xs text-neutral-600">
                      <span>Non-Compliant</span>
                      <span>Level 8</span>
                      <span>Level 4</span>
                      <span>Level 1</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Compliance;
