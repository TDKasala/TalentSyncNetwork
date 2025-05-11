import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';

// Extend Window interface to support the timer
declare global {
  interface Window {
    timerInterval?: NodeJS.Timeout;
  }
}
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
  Code,
  FileCheck,
  FileBadge,
  Star,
  Trophy,
  XCircle
} from 'lucide-react';

// Badge colors by skill level
const badgeColors: Record<string, string> = {
  beginner: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  intermediate: 'bg-green-100 text-green-800 hover:bg-green-100',
  advanced: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
  expert: 'bg-purple-100 text-purple-800 hover:bg-purple-100'
};

interface AssessmentPageProps {
  id: string;
  attemptId?: string;
}

export default function AssessmentPage({ id, attemptId }: AssessmentPageProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeSpent, setTimeSpent] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any>(null);
  
  // Fetch assessment details
  const {
    data: assessment,
    isLoading: isLoadingAssessment,
    error: assessmentError
  } = useQuery({
    queryKey: [`/api/skill-assessments/${id}`]
  });
  
  // Fetch assessment questions
  const {
    data: questions,
    isLoading: isLoadingQuestions,
    error: questionsError
  } = useQuery({
    queryKey: [`/api/skill-assessments/${id}/questions`],
    enabled: !!assessment
  });
  
  // Fetch existing attempt if attemptId is provided
  const {
    data: existingAttempt,
    isLoading: isLoadingAttempt,
    error: attemptError
  } = useQuery({
    queryKey: [`/api/assessment-attempts/${attemptId}`],
    enabled: !!attemptId
  });
  
  // Create a new attempt
  const createAttemptMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(`/api/skill-assessments/${id}/attempt`, {
        method: 'POST'
      });
      return response;
    },
    onSuccess: (data) => {
      // Update the URL to include the attempt ID without navigating
      window.history.replaceState(
        null, 
        '', 
        `/skills/assessment/${id}/attempt/${data.id}`
      );
      setIsStarted(true);
      // Start the timer
      startTimer();
    },
    onError: () => {
      toast({
        title: 'Failed to start assessment',
        description: 'Please try again or contact support.',
        variant: 'destructive'
      });
    }
  });
  
  // Submit the assessment attempt
  const submitAttemptMutation = useMutation({
    mutationFn: async (submitData: { answers: any[], timeSpent: number }) => {
      if (!attemptId) throw new Error('No attempt ID');
      
      const response = await apiRequest(`/api/assessment-attempts/${attemptId}/submit`, {
        method: 'POST',
        data: submitData
      });
      return response;
    },
    onSuccess: (data) => {
      setResults(data);
      setShowResults(true);
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/user/assessment-attempts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/skill-badges'] });
    },
    onError: () => {
      toast({
        title: 'Failed to submit assessment',
        description: 'Please try again or contact support.',
        variant: 'destructive'
      });
    }
  });
  
  // Timer functionality
  useEffect(() => {
    return () => {
      if (window.timerInterval) {
        clearInterval(window.timerInterval);
        window.timerInterval = undefined;
      }
    };
  }, []);
  
  const startTimer = () => {
    if (window.timerInterval) {
      clearInterval(window.timerInterval);
      window.timerInterval = undefined;
    }
    
    window.timerInterval = window.setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
  };
  
  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Helper to get icon for assessment type
  const getAssessmentTypeIcon = (type: string) => {
    switch (type) {
      case 'quiz':
        return <FileCheck className="h-5 w-5 mr-2" />;
      case 'coding':
        return <Code className="h-5 w-5 mr-2" />;
      default:
        return <BookOpen className="h-5 w-5 mr-2" />;
    }
  };
  
  // Handle starting the assessment
  const handleStart = () => {
    if (attemptId) {
      // If we have an existing attempt, just start the timer
      setIsStarted(true);
      startTimer();
    } else {
      // Create a new attempt
      createAttemptMutation.mutate();
    }
  };
  
  // Handle answer selection
  const handleAnswerSelect = (questionId: number, answer: string) => {
    setAnswers({
      ...answers,
      [questionId]: answer
    });
  };
  
  // Navigate to next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowConfirmSubmit(true);
    }
  };
  
  // Navigate to previous question
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  // Submit the assessment
  const handleSubmit = () => {
    setShowConfirmSubmit(false);
    
    // Format answers for submission
    const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
      questionId: parseInt(questionId),
      answer
    }));
    
    // Submit the answers
    submitAttemptMutation.mutate({
      answers: formattedAnswers,
      timeSpent
    });
    
    // Stop the timer
    if (window.timerInterval) {
      clearInterval(window.timerInterval);
    }
    
    setIsFinished(true);
  };
  
  // Return to skills page
  const returnToSkills = () => {
    setLocation('/skills');
  };
  
  // Try again
  const tryAgain = () => {
    setLocation(`/skills/assessment/${id}`);
  };
  
  // View badges
  const viewBadges = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/user/skill-badges'] });
    setLocation('/skills?tab=badges');
  };
  
  // Determine if current question has been answered
  const isCurrentQuestionAnswered = () => {
    if (!questions || questions.length === 0) return false;
    const currentQuestion = questions[currentQuestionIndex];
    return answers[currentQuestion.id] !== undefined;
  };
  
  // Calculate progress percentage
  const calculateProgress = () => {
    if (!questions || questions.length === 0) return 0;
    const answeredCount = Object.keys(answers).length;
    return Math.round((answeredCount / questions.length) * 100);
  };
  
  if (isLoadingAssessment || isLoadingQuestions || (attemptId && isLoadingAttempt)) {
    return (
      <div className="container py-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" onClick={returnToSkills} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <Skeleton className="h-8 w-1/3" />
        </div>
        <Card>
          <CardHeader className="animate-pulse">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div className="space-y-3">
                <Skeleton className="h-8 w-64" />
                <div className="flex">
                  <Skeleton className="h-5 w-5 mr-2" />
                  <Skeleton className="h-5 w-32" />
                </div>
              </div>
              <Skeleton className="h-6 w-28" />
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div>
              <Skeleton className="h-6 w-24 mb-2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6 mt-2" />
              <Skeleton className="h-4 w-4/6 mt-2" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Skeleton className="h-5 w-5 mr-2" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <Skeleton className="h-4 w-32" />
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Skeleton className="h-5 w-5 mr-2" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <Skeleton className="h-4 w-44" />
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-center">
            <Skeleton className="h-10 w-32" />
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  if (assessmentError || questionsError || attemptError) {
    return (
      <div className="container py-8">
        <Button variant="ghost" onClick={returnToSkills} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Skills
        </Button>
        
        <Card className="border border-amber-200">
          <CardHeader className="bg-amber-50 border-b border-amber-100">
            <div className="flex items-center">
              <div className="bg-amber-100 p-2 rounded-full mr-4">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <CardTitle>Unable to Load Assessment</CardTitle>
                <CardDescription className="text-amber-700">
                  We encountered a problem while loading the assessment data
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6">
            <div className="space-y-4">
              <p className="text-gray-700">
                There was an error retrieving the assessment details or questions. This could be due to:
              </p>
              
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                <li>A temporary connection issue</li>
                <li>The assessment may have been removed or updated</li>
                <li>You may not have permission to access this assessment</li>
              </ul>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
                <h4 className="font-semibold mb-2">What can you do?</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Try the following steps to resolve the issue:
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={() => window.location.reload()} className="flex-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reload Page
                  </Button>
                  <Button variant="outline" onClick={returnToSkills} className="flex-1">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Return to Skills
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Display results
  if (showResults && results) {
    return (
      <div className="container py-8 max-w-3xl">
        <Card className={results.passed ? 'border-green-200' : 'border-amber-200'}>
          <CardHeader className={results.passed ? 'bg-green-50 border-b border-green-100' : 'bg-amber-50 border-b border-amber-100'}>
            <div className="flex flex-col items-center">
              <div className="mb-6 relative">
                {results.passed ? (
                  <>
                    <div className="absolute -inset-1 rounded-full bg-green-200 animate-pulse opacity-70"></div>
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center relative border-4 border-white shadow-md">
                      <CheckCircle2 className="h-12 w-12 text-green-600" />
                    </div>
                  </>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center border-4 border-white shadow-md">
                    <XCircle className="h-12 w-12 text-amber-600" />
                  </div>
                )}
              </div>
              
              <CardTitle className="text-center text-2xl mb-2">
                {results.passed ? 'Congratulations!' : 'Assessment Completed'}
              </CardTitle>
              
              <CardDescription className="text-center text-lg max-w-md">
                {results.passed 
                  ? `You've earned the ${assessment.skill} ${assessment.difficulty} badge!` 
                  : 'You can try again when you are ready to improve your score.'}
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="py-6">
            <div className="flex flex-col items-center space-y-8">
              <div className="w-full max-w-sm">
                <div className="mb-2 flex justify-between items-center">
                  <p className="text-sm font-medium text-gray-700">Your Score</p>
                  <p className="text-sm text-gray-500">Pass: {assessment.passingScore}%</p>
                </div>
                
                <div className="h-10 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full flex items-center justify-center ${
                      results.passed ? 'bg-green-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(100, results.score)}%` }}
                  >
                    <span className="text-white font-bold">{results.score}%</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 w-full gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="flex justify-center mb-2">
                    <FileCheck className="h-5 w-5 text-blue-500" />
                  </div>
                  <p className="text-sm text-gray-500 mb-1">Assessment</p>
                  <p className="font-medium text-sm">{assessment.title}</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="flex justify-center mb-2">
                    <Code className="h-5 w-5 text-indigo-500" />
                  </div>
                  <p className="text-sm text-gray-500 mb-1">Skill</p>
                  <p className="font-medium text-sm capitalize">{assessment.skill}</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="flex justify-center mb-2">
                    <Clock className="h-5 w-5 text-purple-500" />
                  </div>
                  <p className="text-sm text-gray-500 mb-1">Time Spent</p>
                  <p className="font-medium text-sm">{Math.floor(results.attempt.timeSpent / 60)}m {results.attempt.timeSpent % 60}s</p>
                </div>
              </div>
              
              {results.badgeAwarded && (
                <div className="flex flex-col items-center bg-amber-50 p-6 rounded-lg border border-amber-200 w-full">
                  <div className="relative mb-4">
                    <div className="absolute -inset-2 rounded-full bg-yellow-200 animate-pulse opacity-50"></div>
                    <div className="bg-gradient-to-br from-yellow-200 to-amber-300 p-4 rounded-full relative border-2 border-white shadow-lg">
                      <Star className="h-10 w-10 text-amber-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-amber-800 mb-2">Badge Earned!</h3>
                  <p className="text-center font-medium text-amber-700 mb-3">
                    {assessment.skill} {assessment.difficulty} Badge
                  </p>
                  <p className="text-sm text-amber-600 text-center mb-4 max-w-md">
                    This badge will appear on your profile and shows employers that you've verified your skills.
                  </p>
                  <Button 
                    variant="default" 
                    onClick={viewBadges}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    <FileBadge className="h-4 w-4 mr-2" />
                    View My Badges Collection
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter className={`flex flex-col sm:flex-row justify-center gap-4 ${results.passed ? 'bg-green-50' : 'bg-amber-50'} py-6 border-t ${results.passed ? 'border-green-100' : 'border-amber-100'}`}>
            {results.passed ? (
              <>
                <Button onClick={returnToSkills} className="w-full sm:w-auto">
                  Return to Skills Assessment
                </Button>
                <Button variant="outline" onClick={viewBadges} className="w-full sm:w-auto">
                  <FileBadge className="h-4 w-4 mr-2" />
                  View My Badges
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={returnToSkills} className="w-full sm:w-auto">
                  Back to Skills
                </Button>
                <Button onClick={tryAgain} className="w-full sm:w-auto">
                  Try Again
                </Button>
              </>
            )}
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Display assessment intro or questions
  return (
    <div className="container py-8">
      <Button variant="ghost" onClick={returnToSkills} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Skills
      </Button>
      
      {!isStarted ? (
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <CardTitle className="text-2xl">{assessment.title}</CardTitle>
                <CardDescription className="flex items-center mt-1">
                  {getAssessmentTypeIcon(assessment.type)}
                  {assessment.type.charAt(0).toUpperCase() + assessment.type.slice(1)} Assessment
                </CardDescription>
              </div>
              <Badge className={badgeColors[assessment.difficulty] || ''}>
                {assessment.difficulty.charAt(0).toUpperCase() + assessment.difficulty.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-600">{assessment.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-blue-500" />
                    Time Limit
                  </h3>
                  <p className="text-gray-600">
                    {assessment.timeLimit ? `${assessment.timeLimit} minutes` : 'No time limit'}
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center">
                    <Trophy className="h-5 w-5 mr-2 text-amber-500" />
                    Pass Score
                  </h3>
                  <p className="text-gray-600">{assessment.passingScore}% to earn the badge</p>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Assessment Details</h3>
                <ul className="list-disc pl-5 text-gray-600 space-y-2">
                  <li>This assessment contains {questions.length} questions</li>
                  <li>You can review and change your answers before submitting</li>
                  <li>A {assessment.skill} badge will be awarded upon successful completion</li>
                </ul>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-end bg-gray-50 border-t">
            <Button 
              size="lg"
              onClick={handleStart}
              disabled={createAttemptMutation.isPending}
            >
              {createAttemptMutation.isPending ? 'Starting...' : 'Start Assessment'}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div>
          {questions && questions.length > 0 && (
            <>
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">{assessment.title}</h1>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-blue-500" />
                  <span className="text-lg font-medium">{formatTime(timeSpent)}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <span className="text-sm text-gray-500">
                  Progress: {calculateProgress()}%
                </span>
              </div>
              
              <Progress value={calculateProgress()} className="mb-6" />
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">
                    {questions[currentQuestionIndex].questionText}
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <RadioGroup
                    value={answers[questions[currentQuestionIndex].id] || ''}
                    onValueChange={(value) => handleAnswerSelect(questions[currentQuestionIndex].id, value)}
                  >
                    {questions[currentQuestionIndex].options && 
                     Array.isArray(questions[currentQuestionIndex].options) ? 
                      questions[currentQuestionIndex].options.map((option, idx) => (
                        <div key={idx} className="flex items-center space-x-2 py-2">
                          <RadioGroupItem 
                            value={option} 
                            id={`option-${idx}`} 
                          />
                          <Label htmlFor={`option-${idx}`} className="cursor-pointer flex-grow">
                            {option}
                          </Label>
                        </div>
                      )) : 
                      <p className="text-red-500">Error loading question options</p>
                    }
                  </RadioGroup>
                </CardContent>
                
                <CardFooter className="flex justify-between border-t bg-gray-50">
                  <Button
                    variant="outline"
                    onClick={handlePrevQuestion}
                    disabled={currentQuestionIndex === 0}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  
                  <Button
                    onClick={handleNextQuestion}
                    disabled={!isCurrentQuestionAnswered()}
                  >
                    {currentQuestionIndex === questions.length - 1 ? (
                      <>
                        Finish
                        <Check className="h-4 w-4 ml-2" />
                      </>
                    ) : (
                      <>
                        Next
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
              
              <div className="flex flex-wrap gap-2 mt-6">
                {questions.map((question, idx) => (
                  <Button
                    key={idx}
                    variant={idx === currentQuestionIndex ? "default" : answers[question.id] ? "outline" : "ghost"}
                    size="sm"
                    className={`w-10 h-10 p-0 ${answers[question.id] ? "border-green-500" : ""}`}
                    onClick={() => setCurrentQuestionIndex(idx)}
                  >
                    {idx + 1}
                  </Button>
                ))}
              </div>
            </>
          )}
          
          {/* Confirmation Dialog */}
          <Dialog open={showConfirmSubmit} onOpenChange={setShowConfirmSubmit}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit Assessment</DialogTitle>
                <DialogDescription>
                  Are you sure you want to submit your assessment? You won't be able to change your answers after submission.
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4">
                <div className="flex items-center justify-between mb-4">
                  <span>Total questions:</span>
                  <span className="font-medium">{questions?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span>Answered questions:</span>
                  <span className="font-medium">{Object.keys(answers).length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Unanswered questions:</span>
                  <span className="font-medium">{(questions?.length || 0) - Object.keys(answers).length}</span>
                </div>
                
                {(questions?.length || 0) - Object.keys(answers).length > 0 && (
                  <div className="bg-amber-50 p-3 rounded mt-4 text-amber-800 text-sm">
                    <AlertTriangle className="h-4 w-4 inline mr-2" />
                    You have unanswered questions. You will receive 0 points for questions left unanswered.
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmSubmit(false)}
                >
                  Continue Assessment
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={submitAttemptMutation.isPending}
                >
                  {submitAttemptMutation.isPending ? 'Submitting...' : 'Submit Answers'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}