import { useEffect, useState } from 'react';
import { useLocation, useSearch } from 'wouter';
import { useUser } from '@/hooks/useUser';
import RegisterForm from '@/components/auth/RegisterForm';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/lib/i18n';

const Register = () => {
  const [location, setLocation] = useLocation();
  const search = useSearch();
  const { user, isLoading } = useUser();
  const { t } = useLanguage();
  const [initialRole, setInitialRole] = useState<'candidate' | 'recruiter'>('candidate');

  // Update page title
  useEffect(() => {
    document.title = `${t('auth.register.title')} | ${t('app.name')}`;
  }, [t]);

  // Extract role from URL if present
  useEffect(() => {
    const params = new URLSearchParams(search);
    const roleParam = params.get('role');
    if (roleParam === 'candidate' || roleParam === 'recruiter') {
      setInitialRole(roleParam);
    }
  }, [search]);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !isLoading) {
      const redirectTo = user.role === 'candidate' 
        ? '/dashboard/candidate' 
        : '/dashboard/recruiter';
      setLocation(redirectTo);
    }
  }, [user, isLoading, setLocation]);

  // Handle post-registration redirect
  const handleRegisterSuccess = (role: 'candidate' | 'recruiter') => {
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
          <RegisterForm initialRole={initialRole} onRegisterSuccess={handleRegisterSuccess} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Register;
