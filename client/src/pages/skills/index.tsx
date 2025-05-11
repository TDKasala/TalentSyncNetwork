import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle,
  BookOpen,
  Clock,
  Code,
  FileBadge,
  FileCheck,
  GraduationCap,
  Star,
  Trophy
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { SkillAssessment, SkillBadge } from '@shared/schema';

// Badge colors by skill level
const badgeColors: Record<string, string> = {
  beginner: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  intermediate: 'bg-green-100 text-green-800 hover:bg-green-100',
  advanced: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
  expert: 'bg-purple-100 text-purple-800 hover:bg-purple-100'
};

export default function SkillAssessmentsPage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('assessments');

  // Fetch active skill assessments
  const {
    data: assessments,
    isLoading: isLoadingAssessments,
    error: assessmentsError,
    refetch: refetchAssessments
  } = useQuery({
    queryKey: ['/api/skill-assessments'],
    enabled: activeTab === 'assessments'
  });

  // Fetch user's badges (if authenticated)
  const {
    data: badges,
    isLoading: isLoadingBadges,
    error: badgesError
  } = useQuery({
    queryKey: ['/api/user/skill-badges'],
    enabled: activeTab === 'badges',
    retry: (_, error) => {
      // Don't retry on 401 errors (user not authenticated)
      return (error as any)?.response?.status !== 401;
    }
  });
  
  // Fetch user's attempts (if authenticated)
  const {
    data: attempts,
    isLoading: isLoadingAttempts,
    error: attemptsError
  } = useQuery({
    queryKey: ['/api/user/assessment-attempts'],
    enabled: activeTab === 'attempts',
    retry: (_, error) => {
      // Don't retry on 401 errors (user not authenticated)
      return (error as any)?.response?.status !== 401;
    }
  });

  // Group assessments by skill
  const assessmentsBySkill = assessments?.reduce((acc: Record<string, SkillAssessment[]>, assessment: SkillAssessment) => {
    if (!acc[assessment.skill]) {
      acc[assessment.skill] = [];
    }
    acc[assessment.skill].push(assessment);
    return acc;
  }, {}) || {};

  // Helper to get icon for assessment type
  const getAssessmentTypeIcon = (type: string) => {
    switch (type) {
      case 'quiz':
        return <FileCheck className="h-4 w-4 mr-1" />;
      case 'coding':
        return <Code className="h-4 w-4 mr-1" />;
      default:
        return <BookOpen className="h-4 w-4 mr-1" />;
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Skills Assessment Center</h1>
      <p className="text-lg text-gray-600 mb-8">
        Validate your skills, earn verified badges, and showcase your expertise to potential employers.
      </p>

      <Tabs defaultValue="assessments" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="assessments">Available Assessments</TabsTrigger>
          <TabsTrigger value="badges">My Skill Badges</TabsTrigger>
          <TabsTrigger value="attempts">Assessment History</TabsTrigger>
        </TabsList>

        {/* Available Assessments Tab */}
        <TabsContent value="assessments" className="space-y-6">
          {isLoadingAssessments ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-8 w-1/3 mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-24 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : assessmentsError ? (
            <div className="text-center py-8">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <div className="flex flex-col items-center">
                  <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                  <h3 className="text-lg font-semibold text-red-700 mb-2">Failed to load skills assessments</h3>
                  <p className="text-sm text-gray-600 mb-4 text-center">
                    There was an error loading the available assessments. Please try again or contact support if the problem persists.
                  </p>
                  <div className="flex space-x-3">
                    <Button variant="outline" onClick={() => refetchAssessments()}>
                      Try Again
                    </Button>
                    <Button variant="default" onClick={() => window.location.reload()}>
                      Refresh Page
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : assessments?.length === 0 ? (
            <div className="text-center py-12 bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg border border-gray-200 shadow-sm">
              <div className="max-w-md mx-auto px-4">
                <div className="bg-white p-3 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-sm">
                  <GraduationCap className="h-10 w-10 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3">No assessments available yet</h3>
                <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                  Our team is working on creating skills assessments. Check back soon as we add assessments for various in-demand skills.
                </p>
                <div className="flex flex-wrap gap-3 justify-center mb-4">
                  <Badge variant="outline" className="py-1.5 px-3 text-sm">JavaScript</Badge>
                  <Badge variant="outline" className="py-1.5 px-3 text-sm">React</Badge>
                  <Badge variant="outline" className="py-1.5 px-3 text-sm">Python</Badge>
                  <Badge variant="outline" className="py-1.5 px-3 text-sm">Data Analysis</Badge>
                  <Badge variant="outline" className="py-1.5 px-3 text-sm">Marketing</Badge>
                </div>
              </div>
            </div>
          ) : (
            <>
              {Object.entries(assessmentsBySkill).map(([skill, skillAssessments]) => (
                <div key={skill} className="mb-8">
                  <h2 className="text-2xl font-bold mb-4 capitalize">{skill} Assessments</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {skillAssessments.map((assessment) => (
                      <Card key={assessment.id} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-center">
                            <CardTitle>{assessment.title}</CardTitle>
                            <Badge
                              className={badgeColors[assessment.difficulty] || ''}
                            >
                              {assessment.difficulty}
                            </Badge>
                          </div>
                          <CardDescription className="flex items-center text-sm">
                            {getAssessmentTypeIcon(assessment.type)} {assessment.type.charAt(0).toUpperCase() + assessment.type.slice(1)}
                            <span className="mx-2">•</span>
                            <Clock className="h-4 w-4 mr-1" />
                            {assessment.timeLimit ? `${assessment.timeLimit} min` : 'No time limit'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 line-clamp-3">{assessment.description}</p>
                        </CardContent>
                        <CardFooter className="bg-gray-50 border-t flex justify-between">
                          <div className="flex items-center text-sm text-gray-600">
                            <Trophy className="h-4 w-4 mr-1 text-amber-500" />
                            Pass score: {assessment.passingScore}%
                          </div>
                          <Button 
                            onClick={() => setLocation(`/skills/assessment/${assessment.id}`)}
                          >
                            Start Assessment
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </TabsContent>

        {/* My Skill Badges Tab */}
        <TabsContent value="badges">
          {isLoadingBadges ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-40 w-full" />
              ))}
            </div>
          ) : badgesError ? (
            <div className="text-center py-8">
              {(badgesError as any)?.response?.status === 401 ? (
                <>
                  <p className="text-gray-600 mb-4">Please sign in to view your skill badges</p>
                  <Button onClick={() => setLocation('/auth')}>
                    Sign In
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-red-500 mb-4">Failed to load skill badges</p>
                  <Button variant="outline" onClick={() => window.location.reload()}>
                    Try Again
                  </Button>
                </>
              )}
            </div>
          ) : badges?.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <FileBadge className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-medium mb-2">No badges earned yet</h3>
              <p className="text-gray-500 mb-4">
                Complete skill assessments to earn verified badges that showcase your expertise.
              </p>
              <Button onClick={() => setActiveTab('assessments')}>
                Browse Assessments
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {badges?.map((badge: SkillBadge) => (
                <Card key={badge.id} className="overflow-hidden border-2 border-amber-200">
                  <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-100">
                    <div className="flex justify-between items-start">
                      <CardTitle className="capitalize">{badge.skill}</CardTitle>
                      <Badge
                        className={badgeColors[badge.level] || ''}
                      >
                        {badge.level}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 pb-4 flex items-center justify-center">
                    <div className="flex flex-col items-center">
                      <div className="bg-amber-50 p-4 rounded-full mb-2 border border-amber-200">
                        <Star className="h-12 w-12 text-amber-500" />
                      </div>
                      <p className="text-center font-medium">{badge.skill} - {badge.level}</p>
                      <p className="text-xs text-gray-500">
                        Earned on {new Date(badge.earnedAt).toLocaleDateString()}
                      </p>
                      {badge.isVerified && (
                        <div className="flex items-center mt-2 text-green-600 text-sm">
                          <FileCheck className="h-4 w-4 mr-1" />
                          Verified
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Assessment History Tab */}
        <TabsContent value="attempts">
          {isLoadingAttempts ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : attemptsError ? (
            <div className="text-center py-8">
              {(attemptsError as any)?.response?.status === 401 ? (
                <>
                  <p className="text-gray-600 mb-4">Please sign in to view your assessment history</p>
                  <Button onClick={() => setLocation('/auth')}>
                    Sign In
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-red-500 mb-4">Failed to load assessment history</p>
                  <Button variant="outline" onClick={() => window.location.reload()}>
                    Try Again
                  </Button>
                </>
              )}
            </div>
          ) : attempts?.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-medium mb-2">No assessment attempts yet</h3>
              <p className="text-gray-500 mb-4">
                Take skill assessments to build your profile and earn badges.
              </p>
              <Button onClick={() => setActiveTab('assessments')}>
                Browse Assessments
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {attempts?.map((attempt: any) => {
                const assessment = assessments?.find(a => a.id === attempt.assessmentId);
                const startDate = new Date(attempt.startedAt);
                const completed = attempt.completedAt ? new Date(attempt.completedAt) : null;
                
                return (
                  <Card key={attempt.id} className="overflow-hidden">
                    <div className={`flex flex-col md:flex-row ${attempt.passed ? 'border-l-4 border-green-500' : completed ? 'border-l-4 border-red-500' : 'border-l-4 border-blue-500'}`}>
                      <div className="p-4 md:p-6 flex-grow">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                          <h3 className="font-semibold text-lg">{assessment?.title || 'Unknown Assessment'}</h3>
                          {attempt.score !== null ? (
                            <div className={`text-sm font-medium ${
                              attempt.passed ? 'text-green-600' : 'text-red-600'
                            }`}>
                              Score: {attempt.score}%
                            </div>
                          ) : (
                            <div className="text-sm font-medium text-blue-600">In Progress</div>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-2">
                          {assessment && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              {getAssessmentTypeIcon(assessment.type)}
                              {assessment.type}
                            </Badge>
                          )}
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {startDate.toLocaleDateString()}
                          </Badge>
                        </div>
                        
                        {attempt.timeSpent && (
                          <p className="text-sm text-gray-500">
                            Time spent: {Math.floor(attempt.timeSpent / 60)}m {attempt.timeSpent % 60}s
                          </p>
                        )}
                      </div>
                      
                      <div className="bg-gray-50 p-4 md:p-6 flex items-center justify-center md:w-48">
                        {!completed ? (
                          <Button onClick={() => setLocation(`/skills/assessment/${assessment?.id}/attempt/${attempt.id}`)}>
                            Continue
                          </Button>
                        ) : attempt.passed ? (
                          <div className="flex flex-col items-center text-center">
                            <Trophy className="h-8 w-8 text-amber-500 mb-1" />
                            <span className="text-sm font-medium text-green-600">Passed!</span>
                            {attempt.badgeAwarded && (
                              <span className="text-xs text-gray-500">Badge awarded</span>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setLocation(`/skills/assessment/${assessment?.id}`)}
                            >
                              Try Again
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}