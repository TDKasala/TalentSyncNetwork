export type Language = 'english' | 'afrikaans' | 'zulu';

// Translation files
const translations = {
  english: {
    // General
    'app.name': 'TalentSyncZA',
    'app.tagline': 'AI-Powered Recruitment for South Africa',
    
    // Navigation
    'nav.home': 'Home',
    'nav.jobs': 'Jobs',
    'nav.how-it-works': 'How It Works',
    'nav.pricing': 'Pricing',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.dashboard': 'Dashboard',
    'nav.profile': 'Profile',
    'nav.logout': 'Logout',
    
    // Home Page
    'home.hero.title': 'AI-Powered Recruitment Made for South Africa',
    'home.hero.subtitle': 'TalentSyncZA connects job seekers with recruiters through skills-based matching, POPIA compliance, and B-BBEE analytics. Find your perfect match today.',
    'home.hero.jobseeker': 'I\'m a Job Seeker',
    'home.hero.recruiter': 'I\'m a Recruiter',
    'home.hero.popia': 'POPIA Compliant',
    'home.hero.bbbee': 'B-BBEE Analytics',
    
    // How It Works
    'how-it-works.title': 'How TalentSyncZA Works',
    'how-it-works.subtitle': 'Our AI-powered platform makes recruitment simpler, faster and more effective for both candidates and recruiters.',
    'how-it-works.step1.title': 'Create Your Profile',
    'how-it-works.step1.description': 'Upload your resume and skills. Our AI analyzes your experience to match you with the perfect jobs.',
    'how-it-works.step1.action': 'Sign up and create your profile',
    'how-it-works.step2.title': 'Get Matched',
    'how-it-works.step2.description': 'Our AI algorithm matches candidates and job postings based on skills, experience and location preferences.',
    'how-it-works.step2.action': 'Receive anonymous match notifications',
    'how-it-works.step3.title': 'Connect & Hire',
    'how-it-works.step3.description': 'Unlock matches to view contact details and start the conversation. Pay only for the matches you\'re interested in.',
    'how-it-works.step3.action': 'Pay to unlock and communicate',
    
    // Jobs Section
    'jobs.title': 'Featured Jobs',
    'jobs.subtitle': 'Discover opportunities that match your skills and experience.',
    'jobs.viewall': 'View All Jobs',
    'jobs.location': 'Location',
    'jobs.posted': 'Posted',
    'jobs.view-details': 'View Details',
    
    // Auth
    'auth.login.title': 'Log in to your account',
    'auth.login.email': 'Email address',
    'auth.login.password': 'Password',
    'auth.login.remember': 'Remember me',
    'auth.login.forgot': 'Forgot your password?',
    'auth.login.submit': 'Log in',
    'auth.login.or': 'Or continue with',
    'auth.login.no-account': 'Don\'t have an account?',
    'auth.login.signup': 'Sign up',
    
    'auth.register.title': 'Create your account',
    'auth.register.jobseeker': 'Job Seeker',
    'auth.register.recruiter': 'Recruiter',
    'auth.register.firstname': 'First name',
    'auth.register.lastname': 'Last name',
    'auth.register.email': 'Email address',
    'auth.register.password': 'Password',
    'auth.register.confirm': 'Confirm password',
    'auth.register.company': 'Company Name',
    'auth.register.terms': 'I agree to the Terms of Service and Privacy Policy',
    'auth.register.popia': 'I consent to my personal information being processed in accordance with POPIA',
    'auth.register.submit': 'Sign up',
    'auth.register.have-account': 'Already have an account?',
    'auth.register.login': 'Log in',
    
    // Footer
    'footer.copyright': '© 2023 TalentSyncZA. All rights reserved.',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
    'footer.popia': 'POPIA Compliance',
    'footer.jobseekers': 'For Job Seekers',
    'footer.recruiters': 'For Recruiters',
    'footer.company': 'Company',
    
    // CTA
    'cta.title': 'Ready to Find Your Perfect Match?',
    'cta.subtitle': 'Join thousands of job seekers and recruiters on South Africa\'s most innovative AI-powered recruitment platform.',
    'cta.jobseeker': 'Sign Up as Job Seeker',
    'cta.recruiter': 'Sign Up as Recruiter',
    
    // Dashboard
    'dashboard.candidate.title': 'Candidate Dashboard',
    'dashboard.recruiter.title': 'Recruiter Dashboard',
    'dashboard.welcome': 'Welcome back',
    'dashboard.matches': 'Your Matches',
    'dashboard.jobs': 'Your Jobs',
    'dashboard.no-matches': 'No matches found yet',
    'dashboard.no-jobs': 'No jobs found yet',
    'dashboard.create-job': 'Post a New Job',
    'dashboard.view-details': 'View Details',
    'dashboard.unlock': 'Unlock Match',
    
    // Pricing
    'pricing.title': 'Simple, Transparent Pricing',
    'pricing.subtitle': 'Pay only for the matches you\'re interested in. No hidden fees or long-term commitments.',
    'pricing.free.title': 'Free',
    'pricing.free.price': 'R0',
    'pricing.free.description': 'Basic access for everyone.',
    'pricing.candidate.title': 'Pay-Per-Match (Candidate)',
    'pricing.candidate.price': 'R50',
    'pricing.candidate.description': 'For job seekers who want to connect with recruiters.',
    'pricing.recruiter.title': 'Pay-Per-Match (Recruiter)',
    'pricing.recruiter.price': 'R100',
    'pricing.recruiter.description': 'For recruiters who want to hire selectively.',
    'pricing.premium.title': 'Premium Recruiter',
    'pricing.premium.price': 'R500',
    'pricing.premium.description': 'For active recruiters who need unlimited matching.',
    'pricing.enterprise.title': 'Need a custom enterprise plan?',
    'pricing.enterprise.description': 'For organizations with large hiring needs or special requirements.',
    'pricing.enterprise.contact': 'Contact Sales',
    
    // Compliance
    'compliance.title': 'Compliant Recruitment for South Africa',
    'compliance.popia.title': 'POPIA Compliant',
    'compliance.popia.description': 'All data is securely stored and processed according to South Africa\'s Protection of Personal Information Act, giving users control over their personal information.',
    'compliance.bbbee.title': 'B-BBEE Analytics',
    'compliance.bbbee.description': 'Track and report on diversity metrics to ensure compliance with B-BBEE regulations. Our dashboard provides real-time insights for reporting.',
    'compliance.matching.title': 'Skills-Based Matching',
    'compliance.matching.description': 'Our AI focuses on skills and qualifications, rather than demographics, ensuring fair and unbiased recruitment processes.'
  },
  
  afrikaans: {
    // General
    'app.name': 'TalentSyncZA',
    'app.tagline': 'KI-aangedrewe Werwing vir Suid-Afrika',
    
    // Navigation
    'nav.home': 'Tuis',
    'nav.jobs': 'Werk',
    'nav.how-it-works': 'Hoe Dit Werk',
    'nav.pricing': 'Pryse',
    'nav.login': 'Teken In',
    'nav.register': 'Registreer',
    'nav.dashboard': 'Kontroleskerm',
    'nav.profile': 'Profiel',
    'nav.logout': 'Teken Uit',
    
    // Home Page
    'home.hero.title': 'KI-aangedrewe Werwing vir Suid-Afrika',
    'home.hero.subtitle': 'TalentSyncZA verbind werkzoekers met werwers deur vaardigheidsgebaseerde passing, POPIA-nakoming, en B-BBEE analise. Vind jou perfekte passing vandag.',
    'home.hero.jobseeker': 'Ek is \'n Werksoeker',
    'home.hero.recruiter': 'Ek is \'n Werwer',
    'home.hero.popia': 'POPIA-voldoening',
    'home.hero.bbbee': 'B-BBEE Analise',
    
    // Basic translations for now - more to be added
    'how-it-works.title': 'Hoe TalentSyncZA Werk',
    'jobs.title': 'Uitstaande Werk',
    'auth.login.title': 'Meld aan by jou rekening',
    'auth.register.title': 'Skep jou rekening',
    'footer.copyright': '© 2023 TalentSyncZA. Alle regte voorbehou.',
    'cta.title': 'Gereed om jou Perfekte Passing te vind?'
  },
  
  zulu: {
    // General
    'app.name': 'TalentSyncZA',
    'app.tagline': 'I-AI Recruitment Yase-South Africa',
    
    // Navigation
    'nav.home': 'Ekhaya',
    'nav.jobs': 'Imisebenzi',
    'nav.how-it-works': 'Kusebenza Kanjani',
    'nav.pricing': 'Amanani',
    'nav.login': 'Ngena',
    'nav.register': 'Bhalisa',
    'nav.dashboard': 'Idashbhodi',
    'nav.profile': 'Iphrofayela',
    'nav.logout': 'Phuma',
    
    // Home Page
    'home.hero.title': 'I-AI Recruitment Yenzelwe i-South Africa',
    'home.hero.subtitle': 'I-TalentSyncZA ixhumanisa abafuna umsebenzi nabaqashi ngokusebenzisa amakhono, i-POPIA, kanye ne-B-BBEE analytics. Thola umsebenzi ofanele namhlanje.',
    'home.hero.jobseeker': 'Ngifuna Umsebenzi',
    'home.hero.recruiter': 'Ngiyisiqashi',
    'home.hero.popia': 'I-POPIA Compliant',
    'home.hero.bbbee': 'I-B-BBEE Analytics',
    
    // Basic translations for now - more to be added
    'how-it-works.title': 'I-TalentSyncZA Isebenza Kanjani',
    'jobs.title': 'Imisebenzi Ebalulekile',
    'auth.login.title': 'Ngena ku-akhawunti yakho',
    'auth.register.title': 'Dala i-akhawunti yakho',
    'footer.copyright': '© 2023 TalentSyncZA. Wonke amalungelo agodliwe.',
    'cta.title': 'Usukulungele Ukuthola Umsebenzi Ofanele?'
  }
};

// Current language
let currentLanguage: Language = 'english';

// Get the current language
export const getLanguage = (): Language => {
  // Try to get from localStorage if in browser environment
  if (typeof window !== 'undefined' && window.localStorage) {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['english', 'afrikaans', 'zulu'].includes(savedLanguage)) {
      currentLanguage = savedLanguage;
    }
  }
  return currentLanguage;
};

// Set the current language
export const setLanguage = (lang: Language): void => {
  currentLanguage = lang;
  // Save to localStorage if in browser environment
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem('language', lang);
  }
};

// Translation function
export const t = (key: string): string => {
  const lang = getLanguage();
  const langData = translations[lang];
  return langData[key as keyof typeof langData] || translations.english[key as keyof typeof translations.english] || key;
};

// Hook for using language in functional components
export const useLanguage = (pageTitle?: string) => {
  const lang = getLanguage();
  
  // Update document title if provided
  if (pageTitle && typeof document !== 'undefined') {
    document.title = `${pageTitle} | TalentSyncZA`;
  }
  
  return {
    language: lang,
    setLanguage,
    t
  };
};
