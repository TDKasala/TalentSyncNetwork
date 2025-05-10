import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useUser } from '@/hooks/useUser';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import MainLayout from '@/components/layout/MainLayout';
import CompanyProfileForm from '@/components/dashboard/CompanyProfileForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface CompanyProfile {
  id?: number;
  userId?: number;
  companyName: string;
  industry: string | null;
  description: string | null;
  website: string | null;
  logo?: string | null;
  bbbeeLevel: string | null;
  companySize: string | null;
}

const RecruiterProfilePage = () => {
  const [location, setLocation] = useLocation();
  const { user, isLoading: userLoading } = useUser();
  const { toast } = useToast();
  
  // Fetch existing profile if available
  const { data: profile, isLoading: isProfileLoading } = useQuery<CompanyProfile | null>({
    queryKey: ['/api/profiles/company'],
    enabled: !!user,
    onError: () => {
      // If profile doesn't exist, that's okay - we're creating a new one
    }
  });

  // Create/update profile mutation
  const profileMutation = useMutation({
    mutationFn: async (data: CompanyProfile) => {
      const method = profile?.id ? 'PUT' : 'POST';
      const response = await apiRequest(method, '/api/profiles/company', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: profile?.id 
          ? 'Your company profile has been updated successfully' 
          : 'Your company profile has been created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/profiles/company'] });
      
      // Navigate back to dashboard after successful creation/update
      setTimeout(() => {
        setLocation('/dashboard/recruiter');
      }, 1500);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'There was a problem saving your company profile',
        variant: 'destructive',
      });
    }
  });

  // Check if user is authenticated and is a recruiter
  useEffect(() => {
    if (!userLoading && (!user || user.role !== 'recruiter')) {
      setLocation('/auth/login');
    }
  }, [user, userLoading, setLocation]);

  const handleSubmit = (data: CompanyProfile) => {
    profileMutation.mutate(data);
  };

  if (userLoading || isProfileLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setLocation('/dashboard/recruiter')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-heading font-bold text-neutral-900">
            {profile?.id ? 'Edit Company Profile' : 'Complete Company Profile'}
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Company Profile</CardTitle>
            <CardDescription>
              Complete your company profile to start posting jobs and finding suitable candidates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CompanyProfileForm
              initialData={profile || undefined}
              onSubmit={handleSubmit}
              isLoading={profileMutation.isPending}
            />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default RecruiterProfilePage;
