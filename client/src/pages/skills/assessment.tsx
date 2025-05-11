import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';

// Extend Window interface to support the timer
declare global {
  interface Window {
    timerInterval?: number;
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
      }
    };
  }, []);
  
  const startTimer = () => {
    if (window.timerInterval) {
      clearInterval(window.timerInterval);
    }
    
    window.timerInterval = setInterval(() => {
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
          <CardHeader>
            <Skeleton className="h-8 w-1/4 mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-40 w-full" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-1/4" />
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
        
        <Card className="text-center py-8">
          <CardContent>
            <AlertTriangle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-6">
              We couldn't load the assessment. Please try again or contact support.
            </p>
            <Button onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Display results
  if (showResults && results) {
    return (
      <div className="container py-8 max-w-3xl">
        <Card>
          <CardHeader className={results.passed ? 'bg-green-50' : 'bg-amber-50'}>
            <div className="flex justify-center mb-4">
              {results.passed ? (
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center">
                  <XCircle className="h-12 w-12 text-amber-600" />
                </div>
              )}
            </div>
            <CardTitle className="text-center text-2xl">
              {results.passed ? 'Congratulations!' : 'Assessment Completed'}
            </CardTitle>
            <CardDescription className="text-center text-lg">
              {results.passed 
                ? `You've earned the ${assessment.skill} ${assessment.difficulty} badge!` 
                : 'You can try again when you are ready.'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="py-6">
            <div className="flex flex-col items-center space-y-6">
              <div className="flex flex-col items-center">
                <p className="text-sm text-gray-500 mb-1">Your Score</p>
                <div className="text-4xl font-bold">{results.score}%</div>
                <p className="text-sm text-gray-500 mt-1">
                  Pass score: {assessment.passingScore}%
                </p>
              </div>
              
              <Separator />
              
              <div className="flex flex-col sm:flex-row w-full justify-between gap-4 sm:gap-8">
                <div className="flex flex-col items-center">
                  <p className="text-sm text-gray-500 mb-1">Assessment</p>
                  <p className="font-medium">{assessment.title}</p>
                </div>
                
                <div className="flex flex-col items-center">
                  <p className="text-sm text-gray-500 mb-1">Skill</p>
                  <p className="font-medium capitalize">{assessment.skill}</p>
                </div>
                
                <div className="flex flex-col items-center">
                  <p className="text-sm text-gray-500 mb-1">Time Spent</p>
                  <p className="font-medium">{Math.floor(results.attempt.timeSpent / 60)}m {results.attempt.timeSpent % 60}s</p>
                </div>
              </div>
              
              {results.badgeAwarded && (
                <div className="flex flex-col items-center mt-4">
                  <div className="bg-amber-50 p-4 rounded-full mb-2 border border-amber-200">
                    <Star className="h-12 w-12 text-amber-500" />
                  </div>
                  <p className="text-center font-medium">{assessment.skill} {assessment.difficulty} Badge</p>
                  <Button 
                    variant="outline" 
                    onClick={viewBadges}
                    className="mt-2"
                  >
                    <FileBadge className="h-4 w-4 mr-2" />
                    View My Badges
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-center space-x-4 bg-gray-50 py-4">
            {results.passed ? (
              <Button onClick={returnToSkills}>
                Return to Skills Assessment
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={returnToSkills}>
                  Back to Skills
                </Button>
                <Button onClick={tryAgain}>
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