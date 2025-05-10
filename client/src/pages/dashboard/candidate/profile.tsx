import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useUser } from '@/hooks/useUser';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import MainLayout from '@/components/layout/MainLayout';
import ProfileForm from '@/components/dashboard/ProfileForm';
import ResumeUpload from '@/components/dashboard/ResumeUpload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

interface CandidateProfile {
  id?: number;
  userId?: number;
  title: string;
  summary: string;
  skills: string[];
  yearsOfExperience: number | null;
  education: string | null;
  portfolioLinks: string[] | null;
  resumeUrl: string | null;
}

const CandidateProfilePage = () => {
  const [location, setLocation] = useLocation();
  const { user, isLoading: userLoading } = useUser();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('details');
  
  // Fetch existing profile if available
  const { data: profile, isLoading: isProfileLoading } = useQuery<CandidateProfile | null>({
    queryKey: ['/api/profiles/candidate'],
    enabled: !!user,
    onError: () => {
      // If profile doesn't exist, that's okay - we're creating a new one
    }
  });

  // Create/update profile mutation
  const profileMutation = useMutation({
    mutationFn: async (data: CandidateProfile) => {
      const method = profile?.id ? 'PUT' : 'POST';
      const response = await apiRequest(method, '/api/profiles/candidate', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: profile?.id 
          ? 'Your profile has been updated successfully' 
          : 'Your profile has been created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/profiles/candidate'] });
      
      // Navigate back to dashboard after successful creation/update
      setTimeout(() => {
        setLocation('/dashboard/candidate');
      }, 1500);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'There was a problem saving your profile',
        variant: 'destructive',
      });
    }
  });

  // Check if user is authenticated and is a candidate
  useEffect(() => {
    if (!userLoading && (!user || user.role !== 'candidate')) {
      setLocation('/auth/login');
    }
  }, [user, userLoading, setLocation]);

  const handleSubmit = (data: CandidateProfile) => {
    profileMutation.mutate(data);
  };

  // Handle resume upload success
  const handleResumeSuccess = (resumeData: { parsedData: any, profile: CandidateProfile }) => {
    toast({
      title: 'Resume Uploaded',
      description: 'Your resume has been successfully uploaded and parsed',
    });
    queryClient.invalidateQueries({ queryKey: ['/api/profiles/candidate'] });
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
            onClick={() => setLocation('/dashboard/candidate')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-heading font-bold text-neutral-900">
            {profile?.id ? 'Edit Your Profile' : 'Complete Your Profile'}
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Candidate Profile</CardTitle>
            <CardDescription>
              Complete your profile to increase your chances of getting matched with suitable jobs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="details">Profile Details</TabsTrigger>
                <TabsTrigger value="resume">Resume Upload</TabsTrigger>
              </TabsList>

              <TabsContent value="details">
                <ProfileForm 
                  initialData={profile || undefined} 
                  onSubmit={handleSubmit} 
                  isLoading={profileMutation.isPending}
                />
              </TabsContent>

              <TabsContent value="resume">
                <ResumeUpload 
                  onUploadSuccess={handleResumeSuccess}
                  existingResumeUrl={profile?.resumeUrl || undefined}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default CandidateProfilePage;
