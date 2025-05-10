import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Form validation schema
const companyProfileSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  industry: z.string().min(2, 'Industry is required'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  website: z.string().url('Must be a valid URL').or(z.string().length(0)).transform(val => val || null),
  companySize: z.string().min(1, 'Company size is required'),
  bbbeeLevel: z.string().min(1, 'B-BBEE level is required'),
});

type CompanyProfileFormValues = z.infer<typeof companyProfileSchema>;

interface CompanyProfileFormProps {
  initialData?: {
    companyName?: string;
    industry?: string | null;
    description?: string | null;
    website?: string | null;
    companySize?: string | null;
    bbbeeLevel?: string | null;
  };
  onSubmit: (data: CompanyProfileFormValues) => void;
  isLoading?: boolean;
}

const CompanyProfileForm = ({ initialData, onSubmit, isLoading = false }: CompanyProfileFormProps) => {
  // Form setup
  const form = useForm<CompanyProfileFormValues>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: {
      companyName: initialData?.companyName || '',
      industry: initialData?.industry || '',
      description: initialData?.description || '',
      website: initialData?.website || '',
      companySize: initialData?.companySize || '',
      bbbeeLevel: initialData?.bbbeeLevel || '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g. ABC Corporation" 
                  {...field} 
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="industry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Industry</FormLabel>
                <Select 
                  disabled={isLoading} 
                  onValueChange={field.onChange} 
                  defaultValue={field.value?.toString() || undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an industry" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="technology">Technology & IT</SelectItem>
                    <SelectItem value="finance">Finance & Banking</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="retail">Retail & E-commerce</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="construction">Construction</SelectItem>
                    <SelectItem value="hospitality">Hospitality & Tourism</SelectItem>
                    <SelectItem value="media">Media & Entertainment</SelectItem>
                    <SelectItem value="legal">Legal Services</SelectItem>
                    <SelectItem value="telecommunications">Telecommunications</SelectItem>
                    <SelectItem value="transportation">Transportation & Logistics</SelectItem>
                    <SelectItem value="energy">Energy & Utilities</SelectItem>
                    <SelectItem value="agriculture">Agriculture</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="companySize"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Size</FormLabel>
                <Select 
                  disabled={isLoading} 
                  onValueChange={field.onChange} 
                  defaultValue={field.value?.toString() || undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 employees</SelectItem>
                    <SelectItem value="11-50">11-50 employees</SelectItem>
                    <SelectItem value="51-200">51-200 employees</SelectItem>
                    <SelectItem value="201-500">201-500 employees</SelectItem>
                    <SelectItem value="501-1000">501-1000 employees</SelectItem>
                    <SelectItem value="1001-5000">1001-5000 employees</SelectItem>
                    <SelectItem value="5001+">5001+ employees</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe your company, mission, and culture" 
                  className="min-h-[120px]"
                  {...field} 
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                A brief description of your company (150-500 characters recommended)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Website</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://example.com" 
                  {...field}
                  value={field.value || ''}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                Your company's official website
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bbbeeLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>B-BBEE Level</FormLabel>
              <Select 
                disabled={isLoading} 
                onValueChange={field.onChange} 
                defaultValue={field.value?.toString() || undefined}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select B-BBEE level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1">Level 1</SelectItem>
                  <SelectItem value="2">Level 2</SelectItem>
                  <SelectItem value="3">Level 3</SelectItem>
                  <SelectItem value="4">Level 4</SelectItem>
                  <SelectItem value="5">Level 5</SelectItem>
                  <SelectItem value="6">Level 6</SelectItem>
                  <SelectItem value="7">Level 7</SelectItem>
                  <SelectItem value="8">Level 8</SelectItem>
                  <SelectItem value="non_compliant">Non-Compliant</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Your company's B-BBEE status level
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Company Profile'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CompanyProfileForm;
