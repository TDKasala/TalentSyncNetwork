import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useUser } from '@/hooks/useUser';
import { logoutUser } from '@/lib/auth';
import { useLanguage } from '@/lib/i18n';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { User, LogOut, Menu, X, Globe } from 'lucide-react';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user } = useUser();
  const [location, setLocation] = useLocation();
  const { t, language, setLanguage } = useLanguage();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle logout
  const handleLogout = () => {
    logoutUser();
    setLocation('/');
  };

  // Handle language change
  const handleLanguageChange = (lang: 'english' | 'afrikaans' | 'zulu') => {
    setLanguage(lang);
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-200 ${isScrolled ? 'bg-white shadow-sm' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center">
              <div className="h-8 w-8 bg-primary-600 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-lg">TS</span>
              </div>
              <span className="ml-2 text-xl font-heading font-bold text-primary-700">TalentSync<span className="text-secondary-500">ZA</span></span>
            </Link>
          </div>
          
          {/* Middle nav - Desktop only */}
          <nav className="hidden md:flex space-x-6 items-center">
            <Link href="/" className="text-neutral-700 hover:text-primary-600 px-3 py-2 text-sm font-medium rounded-md">
              {t('nav.home')}
            </Link>
            <Link href="/jobs" className="text-neutral-700 hover:text-primary-600 px-3 py-2 text-sm font-medium rounded-md">
              {t('nav.jobs')}
            </Link>
            <Link href="/#how-it-works" className="text-neutral-700 hover:text-primary-600 px-3 py-2 text-sm font-medium rounded-md">
              {t('nav.how-it-works')}
            </Link>
            <Link href="/#pricing" className="text-neutral-700 hover:text-primary-600 px-3 py-2 text-sm font-medium rounded-md">
              {t('nav.pricing')}
            </Link>
          </nav>
          
          {/* Right side menu */}
          <div className="flex items-center space-x-4">
            {/* Language selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center">
                  <Globe className="h-4 w-4 mr-1" />
                  <span className="text-sm">{language === 'english' ? 'English' : language === 'afrikaans' ? 'Afrikaans' : 'Zulu'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleLanguageChange('english')}>
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLanguageChange('afrikaans')}>
                  Afrikaans
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLanguageChange('zulu')}>
                  Zulu
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Login/Register buttons or User menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    <span className="text-sm">{user.firstName}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setLocation(`/dashboard/${user.role}`)}>
                    {t('nav.dashboard')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation(`/dashboard/${user.role}/profile`)}>
                    {t('nav.profile')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    {t('nav.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setLocation('/auth/login')}
                  className="text-primary-600 border-primary-600 hover:bg-primary-50"
                >
                  {t('nav.login')}
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={() => setLocation('/auth/register')}
                  className="bg-primary-600 text-white hover:bg-primary-700"
                >
                  {t('nav.register')}
                </Button>
              </div>
            )}
            
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-md">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link 
              href="/" 
              className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:text-primary-600 hover:bg-neutral-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.home')}
            </Link>
            <Link 
              href="/jobs" 
              className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:text-primary-600 hover:bg-neutral-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.jobs')}
            </Link>
            <Link 
              href="/#how-it-works" 
              className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:text-primary-600 hover:bg-neutral-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.how-it-works')}
            </Link>
            <Link 
              href="/#pricing" 
              className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:text-primary-600 hover:bg-neutral-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.pricing')}
            </Link>
            
            {user && (
              <>
                <Link 
                  href={`/dashboard/${user.role}`} 
                  className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:text-primary-600 hover:bg-neutral-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.dashboard')}
                </Link>
                <Link 
                  href={`/dashboard/${user.role}/profile`} 
                  className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:text-primary-600 hover:bg-neutral-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.profile')}
                </Link>
                <button
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:text-primary-600 hover:bg-neutral-50"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                >
                  {t('nav.logout')}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
