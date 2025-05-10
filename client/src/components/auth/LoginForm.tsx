import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'wouter';
import { useLanguage } from '@/lib/i18n';
import { loginUser } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle } from 'lucide-react';

// Form validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onLoginSuccess: (role: 'candidate' | 'recruiter') => void;
}

const LoginForm = ({ onLoginSuccess }: LoginFormProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form setup
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  // Handle form submission
  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await loginUser({
        email: data.email,
        password: data.password,
      });

      if (result && result.user) {
        toast({
          title: 'Success',
          description: 'You have successfully logged in',
        });
        
        onLoginSuccess(result.user.role as 'candidate' | 'recruiter');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
      toast({
        title: 'Error',
        description: err.message || 'Login failed. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-2">
          <div className="h-10 w-10 bg-primary-600 rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-xl">TS</span>
          </div>
        </div>
        <CardTitle className="text-2xl font-heading">{t('auth.login.title')}</CardTitle>
        <CardDescription>Enter your email and password to sign in</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4 flex items-start">
            <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('auth.login.email')}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="name@example.com" 
                      type="email" 
                      autoComplete="email" 
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>{t('auth.login.password')}</FormLabel>
                    <Link href="/auth/forgot-password" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                      {t('auth.login.forgot')}
                    </Link>
                  </div>
                  <FormControl>
                    <Input 
                      placeholder="••••••••" 
                      type="password" 
                      autoComplete="current-password" 
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-medium text-neutral-700 cursor-pointer">
                    {t('auth.login.remember')}
                  </FormLabel>
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : t('auth.login.submit')}
            </Button>
          </form>
        </Form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-neutral-500">{t('auth.login.or')}</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button 
              type="button" 
              variant="outline" 
              disabled={isLoading}
              className="w-full"
            >
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
              </svg>
              Facebook
            </Button>

            <Button 
              type="button" 
              variant="outline"
              disabled={isLoading}
              className="w-full"
            >
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
              </svg>
              Google
            </Button>
          </div>
        </div>

        <div className="mt-6 text-center text-sm">
          <span className="text-neutral-600">{t('auth.login.no-account')}</span>{' '}
          <Link href="/auth/register" className="font-medium text-primary-600 hover:text-primary-500">
            {t('auth.login.signup')}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
