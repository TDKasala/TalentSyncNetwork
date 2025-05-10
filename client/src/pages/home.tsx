import { useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';
import Jobs from '@/components/home/Jobs';
import Compliance from '@/components/home/Compliance';
import Pricing from '@/components/home/Pricing';
import CTA from '@/components/home/CTA';
import { useLanguage } from '@/lib/i18n';

const Home = () => {
  const { t } = useLanguage();

  // Update page title and meta description
  useEffect(() => {
    document.title = `${t('app.name')} - ${t('app.tagline')}`;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'AI-powered recruitment platform connecting job seekers and recruiters through skills-based matching in South Africa'
      );
    }
  }, [t]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Hero />
        <Features />
        <Jobs />
        <Compliance />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
