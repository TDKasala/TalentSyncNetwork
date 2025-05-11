import { useEffect, useState } from 'react';
import { useUser } from '@/hooks/useUser';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useLanguage } from '@/lib/i18n';
import { queryClient } from '@/lib/queryClient';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, MapPin, Calendar, Lock, Check, AlertTriangle, User, 
  BarChart3, Zap, Award, BookOpen, Search
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { 
  StatCard, 
  QuickActions, 
  RecentActivity, 
  SkillsProgress,
  JobMarketInsights
} from '@/components/dashboard/widgets';

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
    description: string;
    location: string;
    type: string;
    company?: {
      companyName: string;
    };
    createdAt: string;
    skills: string[];
  };
}

interface Profile {
  id: number;
  userId: number;
  title: string;
  summary: string;
  skills: string[];
  yearsOfExperience: number | null;
  education: string | null;
  portfolioLinks: string[] | null;
  resumeUrl: string | null;
}

const CandidateDashboard = () => {
  const { t } = useLanguage();
  const { user } = useUser();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Update page title
  useEffect(() => {
    document.title = `${t('dashboard.candidate.title')} | ${t('app.name')}`;
  }, [t]);

  // Fetch candidate profile
  const { data: profile, isLoading: isLoadingProfile } = useQuery<Profile>({
    queryKey: ['/api/profiles/candidate'],
    enabled: !!user,
  });

  // Fetch matches
  const { data: matches, isLoading: isLoadingMatches } = useQuery<Match[]>({
    queryKey: ['/api/matches/candidate'],
    enabled: !!user,
  });

  // Mutation for unlocking a match
  const unlockMatchMutation = useMutation({
    mutationFn: async (matchId: number) => {
      const response = await apiRequest('POST', `/api/matches/unlock/${matchId}`, null);
      return response.json();
    },
    onSuccess: (data) => {
      // Store the match ID in sessionStorage for the payment success page
      sessionStorage.setItem('lastUnlockedMatchId', data.matchId.toString());
      
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

  // Check if profile is complete
  useEffect(() => {
    if (user && !isLoadingProfile && !profile) {
      toast({
        title: "Profile Incomplete",
        description: "Please complete your profile to get matched with jobs",
        variant: "default",
      });
    }
  }, [user, profile, isLoadingProfile, toast]);

  // Create groups of matches by status
  const pendingMatches = matches?.filter(match => match.status === 'pending' || !match.unlockedByCandidate) || [];
  const unlockedMatches = matches?.filter(match => match.unlockedByCandidate) || [];

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

  // Sample data for dashboard statistics
  const dashboardStats = [
    {
      title: "Job Matches",
      value: matches?.length || 0,
      icon: <Briefcase className="h-5 w-5 text-primary-700" />,
      link: "#matches"
    },
    {
      title: "Profile Completion",
      value: profile ? "100%" : "30%",
      icon: <User className="h-5 w-5 text-primary-700" />,
      link: "/dashboard/candidate/profile",
      description: profile ? "Fully completed" : "Complete your profile"
    },
    {
      title: "Skills Verified",
      value: "3/8",
      icon: <Award className="h-5 w-5 text-primary-700" />,
      link: "/skills",
      description: "Take skills assessments"
    },
    {
      title: "Views This Week",
      value: 12,
      icon: <BarChart3 className="h-5 w-5 text-primary-700" />,
      trend: "up" as const,
      trendValue: "30%"
    }
  ];

  // Quick actions for the dashboard
  const quickActions = [
    {
      title: "Update Profile",
      description: "Keep your information current",
      icon: <User className="h-4 w-4" />,
      href: "/dashboard/candidate/profile"
    },
    {
      title: "Verify Skills",
      description: "Take assessments to prove your abilities",
      icon: <Award className="h-4 w-4" />,
      href: "/skills"
    },
    {
      title: "Browse Jobs",
      description: "Explore available opportunities",
      icon: <Search className="h-4 w-4" />,
      href: "/jobs"
    },
    {
      title: "View Market Insights",
      description: "Stay updated on industry trends",
      icon: <BarChart3 className="h-4 w-4" />,
      href: "/market-insights"
    }
  ];

  // Sample recent activities
  const recentActivities = [
    {
      id: 1,
      title: "New match found",
      description: "You have a new match for Senior React Developer",
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      type: "match" as const,
      status: "pending" as const
    },
    {
      id: 2,
      title: "Profile viewed",
      description: "TechRecruit ZA viewed your profile",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      type: "view" as const
    },
    {
      id: 3,
      title: "Skills assessment completed",
      description: "You scored 85% on React Developer assessment",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      type: "assessment" as const,
      status: "success" as const
    }
  ];

  // Sample skills data
  const skillsData = [
    {
      name: "React",
      level: "advanced" as const,
      progress: 90,
      verified: true
    },
    {
      name: "Node.js",
      level: "intermediate" as const,
      progress: 75,
      verified: true
    },
    {
      name: "TypeScript",
      level: "intermediate" as const,
      progress: 65,
      verified: false
    },
    {
      name: "AWS",
      level: "beginner" as const,
      progress: 35,
      verified: false
    }
  ];

  // Sample market insights data
  const marketInsightsData = {
    trendingSkills: [
      { name: "React", growth: 15, demand: "high" as const },
      { name: "TypeScript", growth: 22, demand: "high" as const },
      { name: "AWS", growth: 18, demand: "high" as const },
      { name: "Docker", growth: 12, demand: "medium" as const },
      { name: "GraphQL", growth: 10, demand: "medium" as const }
    ],
    insights: [
      {
        title: "Tech Job Market in South Africa",
        description: "Demand for React developers increased by 20% in the last quarter.",
        icon: <BarChart3 className="h-4 w-4" />
      },
      {
        title: "Remote Work Trends",
        description: "70% of tech companies now offer permanent remote positions.",
        icon: <Briefcase className="h-4 w-4" />
      }
    ]
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      <main className="flex-grow py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-2xl font-heading font-bold text-neutral-900">{t('dashboard.candidate.title')}</h1>
              <p className="text-neutral-600">{t('dashboard.welcome')}, {user.firstName}!</p>
            </div>
            
            {!profile && (
              <Button 
                onClick={() => setLocation("/dashboard/candidate/profile")}
                className="mt-4 md:mt-0"
              >
                Complete Your Profile
              </Button>
            )}
          </div>

          {!profile ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <User className="h-12 w-12 text-neutral-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Your profile is incomplete</h3>
                  <p className="text-neutral-500 mb-4">Complete your profile to get matched with relevant jobs</p>
                  <Button onClick={() => setLocation("/dashboard/candidate/profile")}>
                    Complete Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Dashboard Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {dashboardStats.map((stat, index) => (
                  <StatCard key={index} {...stat} />
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content - 2/3 width on large screens */}
                <div className="lg:col-span-2 space-y-6">
                  <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-6">
                      <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                      <TabsTrigger value="matches">Matches ({matches?.length || 0})</TabsTrigger>
                      <TabsTrigger value="profile">My Profile</TabsTrigger>
                    </TabsList>
                    
                    {/* Dashboard Tab */}
                    <TabsContent value="dashboard">
                      <div className="space-y-6">
                        {/* Recently Activity Widget */}
                        <RecentActivity 
                          activities={recentActivities}
                          viewAllLink="/dashboard/candidate/activity"
                        />
                        
                        {/* Matches Preview Widget */}
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                              <CardTitle>Recent Matches</CardTitle>
                              <CardDescription>Your latest job matches</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setActiveTab("matches")}>
                              View all
                            </Button>
                          </CardHeader>
                          <CardContent>
                            {isLoadingMatches ? (
                              <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                              </div>
                            ) : matches && matches.length > 0 ? (
                              <div className="space-y-4">
                                {matches.slice(0, 3).map(match => (
                                  <div key={match.id} className="flex items-start space-x-4 p-3 rounded-lg border border-neutral-200 hover:bg-neutral-50">
                                    <div className="rounded-full p-2 bg-primary-100 text-primary-800">
                                      <Briefcase className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex justify-between">
                                        <h3 className="font-medium">{match.job.title}</h3>
                                        <Badge className="bg-primary-100 text-primary-800 flex items-center h-6">
                                          <Check className="h-3 w-3 mr-1" /> {match.score}%
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-neutral-600 mt-1">{match.job.company?.companyName || "Company"}</p>
                                      <div className="flex items-center text-xs text-neutral-500 mt-2">
                                        <MapPin className="h-3 w-3 mr-1" /> {match.job.location}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-8 text-neutral-500">
                                No matches found
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>
                    
                    {/* Matches Tab (Original Content) */}
                    <TabsContent value="matches">
                      <div className="space-y-6">
                        <Card>
                          <CardHeader>
                            <CardTitle>New Matches</CardTitle>
                            <CardDescription>Jobs that match your profile</CardDescription>
                          </CardHeader>
                          <CardContent>
                            {isLoadingMatches ? (
                              <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                              </div>
                            ) : pendingMatches.length === 0 ? (
                              <div className="text-center py-8 text-neutral-500">
                                No new matches found
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {pendingMatches.map(match => (
                                  <Card key={match.id} className="overflow-hidden">
                                    <CardContent className="p-4">
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <h3 className="text-lg font-semibold text-neutral-900 mb-1">{match.job.title}</h3>
                                          <p className="text-neutral-600 text-sm mb-2">{match.job.company?.companyName || "Company"}</p>
                                        </div>
                                        <Badge className={match.job.type === 'full-time' ? 'bg-primary-100 text-primary-800' : 'bg-secondary-100 text-secondary-800'}>
                                          {match.job.type}
                                        </Badge>
                                      </div>
                                      <div className="mt-4">
                                        <div className="flex items-center text-sm text-neutral-500 mb-2">
                                          <MapPin className="h-4 w-4 mr-2" />
                                          {match.job.location}
                                        </div>
                                        <div className="flex items-center text-sm text-neutral-500">
                                          <Calendar className="h-4 w-4 mr-2" />
                                          Posted {new Date(match.job.createdAt).toLocaleDateString()}
                                        </div>
                                      </div>
                                      <div className="mt-4 flex flex-wrap gap-2">
                                        {match.job.skills?.slice(0, 4).map((skill, index) => (
                                          <Badge key={index} variant="outline" className="bg-neutral-100 text-neutral-800">
                                            {skill}
                                          </Badge>
                                        ))}
                                        {match.job.skills?.length > 4 && (
                                          <Badge variant="outline" className="bg-neutral-100 text-neutral-800">
                                            +{match.job.skills.length - 4} more
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="mt-4 pt-4 border-t border-neutral-200 flex justify-between items-center">
                                        <div className="flex items-center">
                                          <Badge variant="outline" className="bg-primary-100 text-primary-800 flex items-center">
                                            <Check className="h-3 w-3 mr-1" /> {match.score}% Match
                                          </Badge>
                                        </div>
                                        <Button 
                                          onClick={() => handleUnlockMatch(match.id)}
                                          disabled={unlockMatchMutation.isPending}
                                          size="sm"
                                        >
                                          <Lock className="h-3 w-3 mr-1" /> Unlock for R50
                                        </Button>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        {unlockedMatches.length > 0 && (
                          <Card>
                            <CardHeader>
                              <CardTitle>Unlocked Matches</CardTitle>
                              <CardDescription>Jobs you've unlocked</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                {unlockedMatches.map(match => (
                                  <Card key={match.id} className="overflow-hidden">
                                    <CardContent className="p-4">
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <h3 className="text-lg font-semibold text-neutral-900 mb-1">{match.job.title}</h3>
                                          <p className="text-neutral-600 text-sm mb-2">{match.job.company?.companyName || "Company"}</p>
                                        </div>
                                        <Badge className={match.job.type === 'full-time' ? 'bg-primary-100 text-primary-800' : 'bg-secondary-100 text-secondary-800'}>
                                          {match.job.type}
                                        </Badge>
                                      </div>
                                      <div className="mt-4">
                                        <div className="flex items-center text-sm text-neutral-500 mb-2">
                                          <MapPin className="h-4 w-4 mr-2" />
                                          {match.job.location}
                                        </div>
                                        <div className="flex items-center text-sm text-neutral-500">
                                          <Calendar className="h-4 w-4 mr-2" />
                                          Posted {new Date(match.job.createdAt).toLocaleDateString()}
                                        </div>
                                      </div>
                                      <div className="mt-4 flex flex-wrap gap-2">
                                        {match.job.skills?.slice(0, 4).map((skill, index) => (
                                          <Badge key={index} variant="outline" className="bg-neutral-100 text-neutral-800">
                                            {skill}
                                          </Badge>
                                        ))}
                                      </div>
                                      <div className="mt-4 pt-4 border-t border-neutral-200">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div>
                                            <h4 className="text-sm font-medium text-neutral-700 mb-1">Contact Information</h4>
                                            <p className="text-sm text-neutral-600">Email: employer@example.com</p>
                                            <p className="text-sm text-neutral-600">Phone: +27 123 456 789</p>
                                          </div>
                                          <div>
                                            <h4 className="text-sm font-medium text-neutral-700 mb-1">Application Instructions</h4>
                                            <p className="text-sm text-neutral-600">
                                              Apply directly via email with your CV and cover letter.
                                            </p>
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
                      </div>
                    </TabsContent>
                    
                    {/* Profile Tab (Original Content) */}
                    <TabsContent value="profile">
                      {isLoadingProfile ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                      ) : (
                        <Card>
                          <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>Your professional profile</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div>
                                <h3 className="font-medium text-neutral-900">{profile?.title}</h3>
                                <p className="text-neutral-600 mt-1">{profile?.summary}</p>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                <div>
                                  <h4 className="text-sm font-medium text-neutral-500 mb-2">Skills</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {profile?.skills?.map((skill, index) => (
                                      <Badge key={index} variant="outline" className="bg-neutral-100 text-neutral-800">
                                        {skill}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="text-sm font-medium text-neutral-500 mb-2">Experience & Education</h4>
                                  <p className="text-sm">
                                    {profile?.yearsOfExperience} years of experience
                                  </p>
                                  <p className="text-sm mt-1">
                                    {profile?.education}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="pt-4">
                                <Button 
                                  onClick={() => setLocation("/dashboard/candidate/profile")}
                                  variant="outline"
                                >
                                  Edit Profile
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
                
                {/* Sidebar - 1/3 width on large screens */}
                <div className="space-y-6">
                  {/* Quick Actions Widget */}
                  <QuickActions 
                    title="Quick Actions"
                    actions={quickActions}
                  />
                  
                  {/* Skills Progress Widget */}
                  <SkillsProgress 
                    skills={skillsData}
                    title="Skills Progress"
                  />
                  
                  {/* Job Market Insights Widget */}
                  <JobMarketInsights 
                    trendingSkills={marketInsightsData.trendingSkills}
                    insights={marketInsightsData.insights}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CandidateDashboard;
