import { useEffect, useState } from 'react';
import { useUser } from '@/hooks/useUser';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useLanguage } from '@/lib/i18n';
import { queryClient } from '@/lib/queryClient';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase, MapPin, Calendar, Lock, Check, AlertTriangle, Building, BarChart, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface Match {
  id: number;
  jobId: number;
  candidateId: number;
  recruiterId: number;
  status: string;
  score: number;
  unlockedByCandidate: boolean;
  unlockedByRecruiter: boolean;
  job: {
    id: number;
    title: string;
  };
  candidate: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

interface Job {
  id: number;
  title: string;
  description: string;
  location: string;
  type: string;
  salary: string | null;
  skills: string[];
  createdAt: string;
  active: boolean;
}

interface CompanyProfile {
  id: number;
  userId: number;
  companyName: string;
  industry: string | null;
  description: string | null;
  website: string | null;
  bbbeeLevel: string | null;
}

interface BBBEEAnalytics {
  totalCandidates: number;
  demographicBreakdown: {
    black: number;
    white: number;
    coloured: number;
    indian: number;
    asian: number;
    other: number;
    preferNotToSay: number;
  };
  genderBreakdown: {
    male: number;
    female: number;
    nonBinary: number;
    other: number;
    preferNotToSay: number;
  };
  disabilityPercentage: number;
}

// Form schema for job posting
const jobFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  location: z.string().min(2, "Location is required"),
  type: z.enum(["full-time", "part-time", "contract", "remote"]),
  salary: z.string().optional(),
  skills: z.string().transform(val => val.split(',').map(skill => skill.trim())),
  bbbeePreferred: z.boolean().default(false),
  remoteOk: z.boolean().default(false)
});

type JobFormValues = z.infer<typeof jobFormSchema>;

const RecruiterDashboard = () => {
  const { t } = useLanguage();
  const { user } = useUser();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [jobDialogOpen, setJobDialogOpen] = useState(false);

  // Update page title
  useEffect(() => {
    document.title = `${t('dashboard.recruiter.title')} | ${t('app.name')}`;
  }, [t]);

  // Form setup for job posting
  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: '',
      description: '',
      location: '',
      type: 'full-time',
      salary: '',
      skills: '',
      bbbeePreferred: false,
      remoteOk: false
    },
  });

  // Fetch company profile
  const { data: profile, isLoading: isLoadingProfile } = useQuery<CompanyProfile>({
    queryKey: ['/api/profiles/company'],
    enabled: !!user,
  });

  // Fetch posted jobs
  const { data: jobs, isLoading: isLoadingJobs } = useQuery<Job[]>({
    queryKey: ['/api/recruiter/jobs'],
    enabled: !!user,
  });

  // Fetch matches
  const { data: matches, isLoading: isLoadingMatches } = useQuery<Match[]>({
    queryKey: ['/api/matches/recruiter'],
    enabled: !!user,
  });

  // Fetch B-BBEE analytics
  const { data: bbbeeAnalytics, isLoading: isLoadingAnalytics } = useQuery<BBBEEAnalytics>({
    queryKey: ['/api/analytics/bbbee'],
    enabled: !!user && !!profile,
  });

  // Mutation for posting a new job
  const postJobMutation = useMutation({
    mutationFn: async (data: JobFormValues) => {
      const response = await apiRequest('POST', '/api/jobs', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Job posted successfully.",
      });
      setJobDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/recruiter/jobs'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to post job. Please try again.",
        variant: "destructive",
      });
      console.error('Job posting error:', error);
    }
  });

  // Mutation for unlocking a match
  const unlockMatchMutation = useMutation({
    mutationFn: async (matchId: number) => {
      const response = await apiRequest('POST', `/api/matches/unlock/${matchId}`, null);
      return response.json();
    },
    onSuccess: (data) => {
      // Redirect to payment URL
      window.location.href = data.paymentUrl;
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
      console.error('Payment initiation error:', error);
    }
  });

  const handleUnlockMatch = (matchId: number) => {
    unlockMatchMutation.mutate(matchId);
  };

  const onSubmitJob = (data: JobFormValues) => {
    postJobMutation.mutate(data);
  };

  // Check if profile is complete
  useEffect(() => {
    if (user && !isLoadingProfile && !profile) {
      toast({
        title: "Profile Incomplete",
        description: "Please complete your company profile to post jobs",
        variant: "default",
      });
    }
  }, [user, profile, isLoadingProfile, toast]);

  // Create groups of matches by status
  const pendingMatches = matches?.filter(match => match.status === 'pending' || !match.unlockedByRecruiter) || [];
  const unlockedMatches = matches?.filter(match => match.unlockedByRecruiter) || [];

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-50">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You need to be logged in to view this page. Please <Button variant="link" onClick={() => setLocation("/auth/login")}>login</Button> to continue.
            </AlertDescription>
          </Alert>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      <main className="flex-grow py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-2xl font-heading font-bold text-neutral-900">{t('dashboard.recruiter.title')}</h1>
              <p className="text-neutral-600">{t('dashboard.welcome')}, {user.firstName}!</p>
            </div>
            
            {!profile ? (
              <Button 
                onClick={() => setLocation("/dashboard/recruiter/profile")}
                className="mt-4 md:mt-0"
              >
                Complete Company Profile
              </Button>
            ) : (
              <Dialog open={jobDialogOpen} onOpenChange={setJobDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="mt-4 md:mt-0">
                    <Plus className="h-4 w-4 mr-2" /> Post a New Job
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                  <DialogHeader>
                    <DialogTitle>Post a New Job</DialogTitle>
                    <DialogDescription>
                      Fill in the details below to post a new job opening.
                    </DialogDescription>
                  </DialogHeader>

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmitJob)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Job Title</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Senior Software Engineer" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Job Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe the job responsibilities, requirements, and benefits" 
                                className="min-h-[120px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Cape Town, South Africa" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Job Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select job type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="full-time">Full-time</SelectItem>
                                  <SelectItem value="part-time">Part-time</SelectItem>
                                  <SelectItem value="contract">Contract</SelectItem>
                                  <SelectItem value="remote">Remote</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="salary"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Salary Range (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. R20,000 - R30,000 per month" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="skills"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Required Skills</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. JavaScript, React, Node.js (comma separated)" {...field} />
                            </FormControl>
                            <FormDescription>
                              Enter skills separated by commas
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bbbeePreferred"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <input
                                type="checkbox"
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                                checked={field.value}
                                onChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>B-BBEE Preferred</FormLabel>
                              <FormDescription>
                                Prioritize candidates from designated groups
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="remoteOk"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <input
                                type="checkbox"
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                                checked={field.value}
                                onChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Remote Work Available</FormLabel>
                              <FormDescription>
                                This position can be performed remotely
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      <DialogFooter>
                        <Button type="submit" disabled={postJobMutation.isPending}>
                          {postJobMutation.isPending ? "Posting..." : "Post Job"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {!profile ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Building className="h-12 w-12 text-neutral-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Your company profile is incomplete</h3>
                  <p className="text-neutral-500 mb-4">Complete your profile to post jobs and access B-BBEE analytics</p>
                  <Button onClick={() => setLocation("/dashboard/recruiter/profile")}>
                    Complete Company Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="jobs">Jobs ({jobs?.length || 0})</TabsTrigger>
                <TabsTrigger value="matches">Matches ({matches?.length || 0})</TabsTrigger>
                <TabsTrigger value="analytics">B-BBEE Analytics</TabsTrigger>
              </TabsList>
              
              <TabsContent value="dashboard">
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Jobs Posted</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">{jobs?.length || 0}</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Potential Matches</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">{pendingMatches?.length || 0}</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Unlocked Matches</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">{unlockedMatches?.length || 0}</p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Jobs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoadingJobs ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                      ) : jobs?.length === 0 ? (
                        <div className="text-center py-8 text-neutral-500">
                          No jobs posted yet
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {jobs?.slice(0, 3).map(job => (
                            <div key={job.id} className="flex justify-between items-center">
                              <div>
                                <h3 className="font-medium">{job.title}</h3>
                                <p className="text-sm text-neutral-500">Posted {new Date(job.createdAt).toLocaleDateString()}</p>
                              </div>
                              <Badge className={job.type === 'full-time' ? 'bg-primary-100 text-primary-800' : 'bg-secondary-100 text-secondary-800'}>
                                {job.type}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Button variant="outline" size="sm" onClick={() => setActiveTab('jobs')}>
                        View All Jobs
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Matches</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoadingMatches ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                      ) : matches?.length === 0 ? (
                        <div className="text-center py-8 text-neutral-500">
                          No matches found yet
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {matches?.slice(0, 3).map(match => (
                            <div key={match.id} className="flex justify-between items-center">
                              <div>
                                <h3 className="font-medium">
                                  {match.unlockedByRecruiter 
                                    ? `${match.candidate.firstName} ${match.candidate.lastName}`
                                    : 'Anonymous Candidate'
                                  }
                                </h3>
                                <p className="text-sm text-neutral-500">
                                  For: {match.job.title}
                                </p>
                              </div>
                              <Badge variant="outline" className="bg-primary-100 text-primary-800">
                                {match.score}% Match
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Button variant="outline" size="sm" onClick={() => setActiveTab('matches')}>
                        View All Matches
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="jobs">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Posted Jobs</h2>
                  <Dialog open={jobDialogOpen} onOpenChange={setJobDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" /> Post a New Job
                      </Button>
                    </DialogTrigger>
                    {/* Job posting dialog - same content as above */}
                  </Dialog>
                </div>
                
                {isLoadingJobs ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : jobs?.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Briefcase className="h-12 w-12 text-neutral-400 mb-4" />
                        <h3 className="text-lg font-medium mb-2">No jobs posted yet</h3>
                        <p className="text-neutral-500 mb-4">Create your first job posting to start finding candidates</p>
                        <Button onClick={() => setJobDialogOpen(true)}>
                          Post Your First Job
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-6">
                    {jobs?.map(job => (
                      <Card key={job.id}>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-lg font-semibold text-neutral-900 mb-1">{job.title}</h3>
                              <div className="flex items-center text-sm text-neutral-500 mb-2">
                                <MapPin className="h-4 w-4 mr-1" />
                                {job.location}
                                <span className="mx-2">•</span>
                                <Calendar className="h-4 w-4 mr-1" />
                                Posted {new Date(job.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            <Badge className={job.type === 'full-time' ? 'bg-primary-100 text-primary-800' : 'bg-secondary-100 text-secondary-800'}>
                              {job.type}
                            </Badge>
                          </div>
                          
                          <div className="mt-4">
                            <p className="text-neutral-700 text-sm line-clamp-2">{job.description}</p>
                          </div>
                          
                          <div className="mt-4 flex flex-wrap gap-2">
                            {job.skills?.map((skill, index) => (
                              <Badge key={index} variant="outline" className="bg-neutral-100 text-neutral-800">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="mt-4 pt-4 border-t border-neutral-200 flex justify-between items-center">
                            <div className="flex items-center">
                              <Badge variant={job.active ? 'default' : 'secondary'} className="mr-2">
                                {job.active ? 'Active' : 'Inactive'}
                              </Badge>
                              {job.salary && (
                                <span className="text-sm text-neutral-600">
                                  {job.salary}
                                </span>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                              <Button variant="outline" size="sm" className={job.active ? 'text-red-600' : 'text-green-600'}>
                                {job.active ? 'Deactivate' : 'Activate'}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="matches">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold">Candidate Matches</h2>
                  <p className="text-neutral-500">Potential candidates for your job postings</p>
                </div>
                
                {isLoadingMatches ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : matches?.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <AlertTriangle className="h-12 w-12 text-neutral-400 mb-4" />
                        <h3 className="text-lg font-medium mb-2">No matches found yet</h3>
                        <p className="text-neutral-500 mb-4">Post more jobs or wait for the matching algorithm to find suitable candidates</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {pendingMatches.length > 0 && (
                      <Card className="mb-6">
                        <CardHeader>
                          <CardTitle>Potential Matches</CardTitle>
                          <CardDescription>Candidates that match your job requirements</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {pendingMatches.map(match => (
                              <Card key={match.id} className="overflow-hidden">
                                <CardContent className="p-4">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h3 className="text-lg font-semibold text-neutral-900 mb-1">Anonymous Candidate</h3>
                                      <p className="text-neutral-600 text-sm mb-2">For position: {match.job.title}</p>
                                    </div>
                                    <Badge variant="outline" className="bg-primary-100 text-primary-800">
                                      {match.score}% Match
                                    </Badge>
                                  </div>
                                  <div className="mt-4 pt-4 border-t border-neutral-200 flex justify-between items-center">
                                    <div>
                                      <p className="text-sm text-neutral-500">
                                        Unlock to view candidate details and contact information
                                      </p>
                                    </div>
                                    <Button 
                                      onClick={() => handleUnlockMatch(match.id)}
                                      disabled={unlockMatchMutation.isPending}
                                      size="sm"
                                    >
                                      <Lock className="h-3 w-3 mr-1" /> Unlock for R100
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    
                    {unlockedMatches.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Unlocked Matches</CardTitle>
                          <CardDescription>Candidates you've unlocked</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {unlockedMatches.map(match => (
                              <Card key={match.id} className="overflow-hidden">
                                <CardContent className="p-4">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                                        {match.candidate.firstName} {match.candidate.lastName}
                                      </h3>
                                      <p className="text-neutral-600 text-sm mb-2">For position: {match.job.title}</p>
                                    </div>
                                    <Badge variant="outline" className="bg-primary-100 text-primary-800">
                                      {match.score}% Match
                                    </Badge>
                                  </div>
                                  <div className="mt-4 pt-4 border-t border-neutral-200">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <h4 className="text-sm font-medium text-neutral-700 mb-1">Contact Information</h4>
                                        <p className="text-sm text-neutral-600">Email: candidate@example.com</p>
                                        <p className="text-sm text-neutral-600">Phone: +27 123 456 789</p>
                                      </div>
                                      <div>
                                        <Button size="sm" variant="outline">View Full Profile</Button>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </TabsContent>
              
              <TabsContent value="analytics">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart className="h-5 w-5 mr-2" /> B-BBEE Analytics Dashboard
                    </CardTitle>
                    <CardDescription>Diversity metrics for B-BBEE compliance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingAnalytics ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : !bbbeeAnalytics ? (
                      <div className="text-center py-8 text-neutral-500">
                        No analytics data available yet
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium text-neutral-500">Total Candidates</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-2xl font-bold">{bbbeeAnalytics.totalCandidates}</p>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium text-neutral-500">Black Representation</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-2xl font-bold">
                                {Math.round((bbbeeAnalytics.demographicBreakdown.black / bbbeeAnalytics.totalCandidates) * 100)}%
                              </p>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium text-neutral-500">Gender Diversity</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-2xl font-bold">
                                {Math.round((bbbeeAnalytics.genderBreakdown.female / bbbeeAnalytics.totalCandidates) * 100)}% Female
                              </p>
                            </CardContent>
                          </Card>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium text-neutral-500">Demographic Breakdown</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="h-64 bg-neutral-50 rounded-md flex items-center justify-center">
                                <p className="text-neutral-400">Chart visualization would appear here</p>
                              </div>
                              <div className="mt-4 grid grid-cols-2 gap-2">
                                <div className="flex justify-between">
                                  <span className="text-sm">Black</span>
                                  <span className="text-sm font-medium">{bbbeeAnalytics.demographicBreakdown.black}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm">White</span>
                                  <span className="text-sm font-medium">{bbbeeAnalytics.demographicBreakdown.white}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm">Coloured</span>
                                  <span className="text-sm font-medium">{bbbeeAnalytics.demographicBreakdown.coloured}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm">Indian</span>
                                  <span className="text-sm font-medium">{bbbeeAnalytics.demographicBreakdown.indian}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm">Asian</span>
                                  <span className="text-sm font-medium">{bbbeeAnalytics.demographicBreakdown.asian}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm">Other</span>
                                  <span className="text-sm font-medium">{bbbeeAnalytics.demographicBreakdown.other}</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium text-neutral-500">B-BBEE Compliance Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="h-8 bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 rounded-md relative">
                                <div className="absolute -bottom-5 right-1/4 transform translate-x-1/2">
                                  <div className="w-3 h-3 bg-neutral-900 rounded-full"></div>
                                </div>
                              </div>
                              <div className="flex justify-between mt-6 text-xs text-neutral-600">
                                <span>Non-Compliant</span>
                                <span>Level 8</span>
                                <span>Level 4</span>
                                <span>Level 1</span>
                              </div>
                              
                              <div className="mt-8">
                                <h4 className="text-sm font-medium mb-2">Current Status</h4>
                                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-md">
                                  <span>B-BBEE Level</span>
                                  <Badge className="bg-yellow-100 text-yellow-800">Level 4</Badge>
                                </div>
                              </div>
                              
                              <div className="mt-4">
                                <Button variant="outline" className="w-full">
                                  Export B-BBEE Report
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RecruiterDashboard;
