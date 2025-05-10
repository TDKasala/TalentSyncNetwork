import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'wouter';
import { useLanguage } from '@/lib/i18n';
import { registerUser } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle } from 'lucide-react';

// Form validation schema
const registerSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  role: z.enum(['candidate', 'recruiter']),
  whatsappNumber: z.string().optional(),
  location: z.string().optional(),
  companyName: z.string().optional(),
  language: z.enum(['english', 'afrikaans', 'zulu']).default('english'),
  consentGiven: z.boolean().refine(val => val === true, {
    message: 'You must agree to the processing of your information',
  }),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  initialRole?: 'candidate' | 'recruiter';
  onRegisterSuccess: (role: 'candidate' | 'recruiter') => void;
}

const RegisterForm = ({ initialRole = 'candidate', onRegisterSuccess }: RegisterFormProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<'candidate' | 'recruiter'>(initialRole);

  // Form setup
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: initialRole,
      whatsappNumber: '',
      location: '',
      companyName: '',
      language: 'english',
      consentGiven: false,
      termsAccepted: false,
    },
  });

  // Update role when tab changes
  const handleRoleChange = (value: string) => {
    setRole(value as 'candidate' | 'recruiter');
    form.setValue('role', value as 'candidate' | 'recruiter');
  };

  // Handle form submission
  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await registerUser({
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        whatsappNumber: data.whatsappNumber,
        location: data.location,
        language: data.language,
        consentGiven: data.consentGiven,
        companyName: data.role === 'recruiter' ? data.companyName : undefined,
      });

      if (result && result.user) {
        toast({
          title: 'Success',
          description: 'Your account has been created successfully',
        });
        
        onRegisterSuccess(result.user.role as 'candidate' | 'recruiter');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
      toast({
        title: 'Error',
        description: err.message || 'Registration failed. Please try again.',
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
        <CardTitle className="text-2xl font-heading">{t('auth.register.title')}</CardTitle>
        <CardDescription>Create an account to get started</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4 flex items-start">
            <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Tabs defaultValue={role} onValueChange={handleRoleChange} className="mb-6">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="candidate">{t('auth.register.jobseeker')}</TabsTrigger>
            <TabsTrigger value="recruiter">{t('auth.register.recruiter')}</TabsTrigger>
          </TabsList>
        </Tabs>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.register.firstname')}</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="John" 
                        autoComplete="given-name" 
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
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.register.lastname')}</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Doe" 
                        autoComplete="family-name" 
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('auth.register.email')}</FormLabel>
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
                  <FormLabel>{t('auth.register.password')}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="••••••••" 
                      type="password" 
                      autoComplete="new-password" 
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
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('auth.register.confirm')}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="••••••••" 
                      type="password" 
                      autoComplete="new-password" 
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
              name="whatsappNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WhatsApp Number (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="+27 123 456 789" 
                      type="tel" 
                      autoComplete="tel" 
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
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Johannesburg, South Africa" 
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {role === 'recruiter' && (
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.register.company')}</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="ABC Corporation" 
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="termsAccepted"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-medium text-neutral-700">
                      {t('auth.register.terms')}{' '}
                      <Link href="/terms" className="text-primary-600 hover:text-primary-500">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-primary-600 hover:text-primary-500">
                        Privacy Policy
                      </Link>
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="consentGiven"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-medium text-neutral-700">
                      {t('auth.register.popia')}
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : t('auth.register.submit')}
            </Button>
          </form>
        </Form>

        <div className="mt-6 text-center text-sm">
          <span className="text-neutral-600">{t('auth.register.have-account')}</span>{' '}
          <Link href="/auth/login" className="font-medium text-primary-600 hover:text-primary-500">
            {t('auth.register.login')}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default RegisterForm;
