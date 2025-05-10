import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, X } from 'lucide-react';
import { useState } from 'react';

// Form validation schema
const profileSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  summary: z.string().min(20, 'Summary must be at least 20 characters'),
  skills: z.array(z.string()).min(1, 'Add at least one skill'),
  yearsOfExperience: z.number().nullable().optional(),
  education: z.string().nullable().optional(),
  portfolioLinks: z.array(z.string().url('Must be a valid URL')).nullable().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  initialData?: {
    title?: string;
    summary?: string;
    skills?: string[];
    yearsOfExperience?: number | null;
    education?: string | null;
    portfolioLinks?: string[] | null;
  };
  onSubmit: (data: ProfileFormValues) => void;
  isLoading?: boolean;
}

const ProfileForm = ({ initialData, onSubmit, isLoading = false }: ProfileFormProps) => {
  const [newSkill, setNewSkill] = useState('');
  const [newPortfolioLink, setNewPortfolioLink] = useState('');

  // Form setup
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      title: initialData?.title || '',
      summary: initialData?.summary || '',
      skills: initialData?.skills || [],
      yearsOfExperience: initialData?.yearsOfExperience || null,
      education: initialData?.education || '',
      portfolioLinks: initialData?.portfolioLinks || [],
    },
  });

  // Add a new skill
  const handleAddSkill = () => {
    if (newSkill.trim() === '') return;
    
    const currentSkills = form.getValues('skills') || [];
    if (!currentSkills.includes(newSkill.trim())) {
      form.setValue('skills', [...currentSkills, newSkill.trim()]);
    }
    setNewSkill('');
  };

  // Remove a skill
  const handleRemoveSkill = (skill: string) => {
    const currentSkills = form.getValues('skills') || [];
    form.setValue('skills', currentSkills.filter(s => s !== skill));
  };

  // Add a new portfolio link
  const handleAddPortfolioLink = () => {
    if (newPortfolioLink.trim() === '') return;
    
    try {
      // Validate URL
      new URL(newPortfolioLink);
      
      const currentLinks = form.getValues('portfolioLinks') || [];
      if (!currentLinks.includes(newPortfolioLink.trim())) {
        form.setValue('portfolioLinks', [...currentLinks, newPortfolioLink.trim()]);
      }
      setNewPortfolioLink('');
    } catch (e) {
      // Invalid URL, show error
      form.setError('portfolioLinks', {
        type: 'validate',
        message: 'Please enter a valid URL'
      });
    }
  };

  // Remove a portfolio link
  const handleRemovePortfolioLink = (link: string) => {
    const currentLinks = form.getValues('portfolioLinks') || [];
    form.setValue('portfolioLinks', currentLinks.filter(l => l !== link));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Professional Title</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g. Senior Software Engineer" 
                  {...field} 
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                Your job title or professional role
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="summary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Professional Summary</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Briefly describe your experience, skills, and career goals" 
                  className="min-h-[120px]"
                  {...field} 
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                A short summary of your professional background (150-300 characters recommended)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="skills"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Skills</FormLabel>
              <div className="flex mb-2">
                <FormControl>
                  <Input 
                    placeholder="e.g. JavaScript" 
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    disabled={isLoading}
                  />
                </FormControl>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="ml-2"
                  onClick={handleAddSkill}
                  disabled={isLoading}
                >
                  <PlusCircle className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {field.value?.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1 py-1.5">
                    {skill}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => handleRemoveSkill(skill)}
                      disabled={isLoading}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove {skill}</span>
                    </Button>
                  </Badge>
                ))}
              </div>
              <FormDescription>
                Add your technical and soft skills
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="yearsOfExperience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Years of Experience</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="e.g. 5"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === '' ? null : Number(value));
                    }}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="education"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Education</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g. Bachelor's Degree in Computer Science" 
                    {...field}
                    value={field.value || ''}
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
          name="portfolioLinks"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Portfolio Links (Optional)</FormLabel>
              <div className="flex mb-2">
                <FormControl>
                  <Input 
                    placeholder="https://example.com" 
                    value={newPortfolioLink}
                    onChange={(e) => setNewPortfolioLink(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddPortfolioLink();
                      }
                    }}
                    disabled={isLoading}
                  />
                </FormControl>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="ml-2"
                  onClick={handleAddPortfolioLink}
                  disabled={isLoading}
                >
                  <PlusCircle className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
              <div className="space-y-2 mt-2">
                {field.value?.map((link, index) => (
                  <div key={index} className="flex items-center justify-between bg-neutral-50 p-2 rounded-md">
                    <a 
                      href={link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary-600 hover:text-primary-700 truncate max-w-[80%]"
                    >
                      {link}
                    </a>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleRemovePortfolioLink(link)}
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove link</span>
                    </Button>
                  </div>
                ))}
              </div>
              <FormDescription>
                Add links to your portfolio, GitHub, LinkedIn, etc.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProfileForm;
