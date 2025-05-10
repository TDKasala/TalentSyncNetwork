import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useUser } from '@/hooks/useUser';
import LoginForm from '@/components/auth/LoginForm';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/lib/i18n';

const Login = () => {
  const [location, setLocation] = useLocation();
  const { user, isLoading } = useUser();
  const { t } = useLanguage();

  // Update page title
  useEffect(() => {
    document.title = `${t('auth.login.title')} | ${t('app.name')}`;
  }, [t]);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !isLoading) {
      const redirectTo = user.role === 'candidate' 
        ? '/dashboard/candidate' 
        : '/dashboard/recruiter';
      setLocation(redirectTo);
    }
  }, [user, isLoading, setLocation]);

  // Handle post-login redirect
  const handleLoginSuccess = (role: 'candidate' | 'recruiter') => {
    const redirectTo = role === 'candidate' 
      ? '/dashboard/candidate' 
      : '/dashboard/recruiter';
    setLocation(redirectTo);
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      <main className="flex-grow flex items-center justify-center py-12">
        <div className="w-full max-w-md mx-auto px-4">
          <LoginForm onLoginSuccess={handleLoginSuccess} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
