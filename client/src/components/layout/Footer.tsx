import { Link } from 'wouter';
import { useLanguage } from '@/lib/i18n';
import { Twitter, Linkedin, Facebook } from 'lucide-react';

const Footer = () => {
  const { t } = useLanguage();
  
  return (
    <footer className="bg-neutral-900 text-neutral-400">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-primary-600 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-lg">TS</span>
              </div>
              <span className="ml-2 text-xl font-heading font-bold text-white">TalentSync<span className="text-secondary-500">ZA</span></span>
            </div>
            <p className="mt-4 text-sm">
              AI-powered recruitment platform for South Africa, connecting job seekers and recruiters through skills-based matching.
            </p>
            <div className="mt-4 flex space-x-4">
              <a href="#" className="text-neutral-400 hover:text-white">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white">
                <span className="sr-only">LinkedIn</span>
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white">
                <span className="sr-only">Facebook</span>
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          {/* For Job Seekers */}
          <div className="col-span-1">
            <h3 className="text-white font-semibold text-base mb-4">{t('footer.jobseekers')}</h3>
            <ul className="space-y-2">
              <li><Link href="/auth/register?role=candidate" className="text-neutral-400 hover:text-white text-sm">Create Profile</Link></li>
              <li><Link href="/jobs" className="text-neutral-400 hover:text-white text-sm">Search Jobs</Link></li>
              <li><a href="#" className="text-neutral-400 hover:text-white text-sm">Career Resources</a></li>
              <li><a href="#" className="text-neutral-400 hover:text-white text-sm">Resume Tips</a></li>
            </ul>
          </div>
          
          {/* For Recruiters */}
          <div className="col-span-1">
            <h3 className="text-white font-semibold text-base mb-4">{t('footer.recruiters')}</h3>
            <ul className="space-y-2">
              <li><Link href="/auth/register?role=recruiter" className="text-neutral-400 hover:text-white text-sm">Post a Job</Link></li>
              <li><a href="#" className="text-neutral-400 hover:text-white text-sm">B-BBEE Analytics</a></li>
              <li><a href="#" className="text-neutral-400 hover:text-white text-sm">Hiring Solutions</a></li>
              <li><a href="#" className="text-neutral-400 hover:text-white text-sm">POPIA Compliance</a></li>
            </ul>
          </div>
          
          {/* Company */}
          <div className="col-span-1">
            <h3 className="text-white font-semibold text-base mb-4">{t('footer.company')}</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-neutral-400 hover:text-white text-sm">About Us</a></li>
              <li><a href="#" className="text-neutral-400 hover:text-white text-sm">Our Team</a></li>
              <li><a href="#" className="text-neutral-400 hover:text-white text-sm">Contact Us</a></li>
              <li><a href="#" className="text-neutral-400 hover:text-white text-sm">Privacy Policy</a></li>
              <li><a href="#" className="text-neutral-400 hover:text-white text-sm">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Footer */}
        <div className="mt-8 pt-8 border-t border-neutral-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-neutral-500">{t('footer.copyright')}</p>
          <div className="mt-4 md:mt-0 flex space-x-4">
            <a href="#" className="text-sm text-neutral-500 hover:text-neutral-400">{t('footer.privacy')}</a>
            <a href="#" className="text-sm text-neutral-500 hover:text-neutral-400">{t('footer.terms')}</a>
            <a href="#" className="text-sm text-neutral-500 hover:text-neutral-400">{t('footer.popia')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
