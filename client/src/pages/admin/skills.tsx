import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import {
  AlertCircle,
  Pencil,
  Plus,
  Trash2,
  BookOpen,
  Code,
  FileCheck,
  Eye,
  BookmarkPlus,
  Loader2
} from 'lucide-react';

// Define assessment creation schema
const assessmentFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  skill: z.string().min(1, 'Skill is required'),
  type: z.enum(['quiz', 'coding', 'text']),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  timeLimit: z.coerce.number().optional(),
  passingScore: z.coerce.number().min(1, 'Pass score is required').max(100, 'Pass score must be <= 100'),
  isActive: z.boolean().default(true)
});

// Define question creation schema
const questionFormSchema = z.object({
  questionText: z.string().min(1, 'Question text is required'),
  options: z.string().min(1, 'Options are required (comma-separated)'),
  correctAnswer: z.string().min(1, 'Correct answer is required'),
  explanation: z.string().optional(),
  points: z.coerce.number().min(1, 'Points are required'),
  order: z.coerce.number().min(0, 'Order is required')
});

type AssessmentFormValues = z.infer<typeof assessmentFormSchema>;
type QuestionFormValues = z.infer<typeof questionFormSchema>;

export default function AdminSkillsPage() {
  const [activeTab, setActiveTab] = useState('assessments');
  const [showAssessmentDialog, setShowAssessmentDialog] = useState(false);
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [currentAssessment, setCurrentAssessment] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch skill assessments
  const {
    data: assessments,
    isLoading: isLoadingAssessments,
    error: assessmentsError
  } = useQuery({
    queryKey: ['/api/skill-assessments'],
    staleTime: 10000
  });
  
  // Fetch assessment questions if an assessment is selected
  const {
    data: questions,
    isLoading: isLoadingQuestions,
    error: questionsError
  } = useQuery({
    queryKey: [`/api/skill-assessments/${currentAssessment?.id}/questions`],
    enabled: !!currentAssessment,
    staleTime: 10000
  });
  
  // Assessment form
  const assessmentForm = useForm<AssessmentFormValues>({
    resolver: zodResolver(assessmentFormSchema),
    defaultValues: {
      title: '',
      description: '',
      skill: '',
      type: 'quiz',
      difficulty: 'intermediate',
      timeLimit: 30,
      passingScore: 70,
      isActive: true
    }
  });
  
  // Question form
  const questionForm = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      questionText: '',
      options: '',
      correctAnswer: '',
      explanation: '',
      points: 10,
      order: 0
    }
  });
  
  // Create/update assessment mutation
  const assessmentMutation = useMutation({
    mutationFn: async (data: AssessmentFormValues) => {
      if (editMode && currentAssessment) {
        return apiRequest(`/api/skill-assessments/${currentAssessment.id}`, {
          method: 'PATCH',
          data
        });
      } else {
        return apiRequest('/api/skill-assessments', {
          method: 'POST',
          data
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/skill-assessments'] });
      setShowAssessmentDialog(false);
      assessmentForm.reset();
      toast({
        title: `Assessment ${editMode ? 'updated' : 'created'} successfully`,
        variant: 'default'
      });
    },
    onError: () => {
      toast({
        title: `Failed to ${editMode ? 'update' : 'create'} assessment`,
        description: 'Please try again or contact support.',
        variant: 'destructive'
      });
    }
  });
  
  // Create/update question mutation
  const questionMutation = useMutation({
    mutationFn: async (data: any) => {
      // Format options as JSON array
      const options = data.options.split(',').map((opt: string) => opt.trim());
      
      if (editMode && currentQuestion) {
        return apiRequest(`/api/assessment-questions/${currentQuestion.id}`, {
          method: 'PATCH',
          data: { ...data, options }
        });
      } else {
        return apiRequest(`/api/skill-assessments/${currentAssessment.id}/questions`, {
          method: 'POST',
          data: { ...data, options }
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [`/api/skill-assessments/${currentAssessment?.id}/questions`] 
      });
      setShowQuestionDialog(false);
      questionForm.reset();
      toast({
        title: `Question ${editMode ? 'updated' : 'created'} successfully`,
        variant: 'default'
      });
    },
    onError: () => {
      toast({
        title: `Failed to ${editMode ? 'update' : 'create'} question`,
        description: 'Please try again or contact support.',
        variant: 'destructive'
      });
    }
  });
  
  // Delete question mutation
  const deleteQuestionMutation = useMutation({
    mutationFn: async (questionId: number) => {
      return apiRequest(`/api/assessment-questions/${questionId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/skill-assessments/${currentAssessment?.id}/questions`]
      });
      toast({
        title: 'Question deleted successfully',
        variant: 'default'
      });
    },
    onError: () => {
      toast({
        title: 'Failed to delete question',
        description: 'Please try again or contact support.',
        variant: 'destructive'
      });
    }
  });
  
  // Handle assessment form submission
  const onAssessmentSubmit = (data: AssessmentFormValues) => {
    assessmentMutation.mutate(data);
  };
  
  // Handle question form submission
  const onQuestionSubmit = (data: QuestionFormValues) => {
    questionMutation.mutate(data);
  };
  
  // Handle editing assessment
  const handleEditAssessment = (assessment: any) => {
    setCurrentAssessment(assessment);
    setEditMode(true);
    
    assessmentForm.reset({
      title: assessment.title,
      description: assessment.description,
      skill: assessment.skill,
      type: assessment.type,
      difficulty: assessment.difficulty,
      timeLimit: assessment.timeLimit,
      passingScore: assessment.passingScore,
      isActive: assessment.isActive
    });
    
    setShowAssessmentDialog(true);
  };
  
  // Handle creating new assessment
  const handleNewAssessment = () => {
    setEditMode(false);
    assessmentForm.reset({
      title: '',
      description: '',
      skill: '',
      type: 'quiz',
      difficulty: 'intermediate',
      timeLimit: 30,
      passingScore: 70,
      isActive: true
    });
    setShowAssessmentDialog(true);
  };
  
  // Handle editing question
  const handleEditQuestion = (question: any) => {
    setCurrentQuestion(question);
    setEditMode(true);
    
    // Format options back to comma-separated string
    const optionsString = question.options.join(', ');
    
    questionForm.reset({
      questionText: question.questionText,
      options: optionsString,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || '',
      points: question.points,
      order: question.order
    });
    
    setShowQuestionDialog(true);
  };
  
  // Handle creating new question
  const handleNewQuestion = () => {
    if (!currentAssessment) {
      toast({
        title: 'Please select an assessment first',
        variant: 'destructive'
      });
      return;
    }
    
    setEditMode(false);
    questionForm.reset({
      questionText: '',
      options: '',
      correctAnswer: '',
      explanation: '',
      points: 10,
      order: questions?.length || 0
    });
    setShowQuestionDialog(true);
  };
  
  // Handle deleting question
  const handleDeleteQuestion = (questionId: number) => {
    if (confirm('Are you sure you want to delete this question?')) {
      deleteQuestionMutation.mutate(questionId);
    }
  };
  
  // Handle selecting assessment to view questions
  const handleViewAssessment = (assessment: any) => {
    setCurrentAssessment(assessment);
    setActiveTab('questions');
  };
  
  // Get assessment type icon
  const getAssessmentTypeIcon = (type: string) => {
    switch (type) {
      case 'quiz':
        return <FileCheck className="h-4 w-4" />;
      case 'coding':
        return <Code className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Admin - Skills Assessment Management</h1>
      <p className="text-gray-600 mb-6">Create and manage skill assessments and questions</p>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="questions" disabled={!currentAssessment}>
            Questions{currentAssessment ? ` (${currentAssessment.title})` : ''}
          </TabsTrigger>
        </TabsList>
        
        {/* Assessments Tab */}
        <TabsContent value="assessments">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Skill Assessments</h2>
            <Button onClick={handleNewAssessment}>
              <Plus className="h-4 w-4 mr-2" />
              New Assessment
            </Button>
          </div>
          
          {isLoadingAssessments ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : assessmentsError ? (
            <Card className="bg-red-50">
              <CardContent className="pt-6 flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <p>Error loading assessments. Please try again.</p>
              </CardContent>
            </Card>
          ) : assessments?.length === 0 ? (
            <Card className="bg-gray-50">
              <CardContent className="py-8 text-center">
                <p className="text-gray-500 mb-4">No assessments created yet</p>
                <Button onClick={handleNewAssessment}>Create Your First Assessment</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Skill</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assessments?.map((assessment: any) => (
                    <TableRow key={assessment.id}>
                      <TableCell className="font-medium">{assessment.title}</TableCell>
                      <TableCell className="capitalize">{assessment.skill}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getAssessmentTypeIcon(assessment.type)}
                          <span className="ml-2 capitalize">{assessment.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="capitalize">{assessment.difficulty}</Badge>
                      </TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>
                        <Badge variant={assessment.isActive ? "default" : "outline"}>
                          {assessment.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewAssessment(assessment)}
                            title="View Questions"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditAssessment(assessment)}
                            title="Edit Assessment"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
        
        {/* Questions Tab */}
        <TabsContent value="questions">
          {currentAssessment && (
            <>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-semibold">{currentAssessment.title} - Questions</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Skill: {currentAssessment.skill} | 
                    Difficulty: {currentAssessment.difficulty} | 
                    Pass Score: {currentAssessment.passingScore}%
                  </p>
                </div>
                <Button onClick={handleNewQuestion}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </div>
              
              {isLoadingQuestions ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : questionsError ? (
                <Card className="bg-red-50">
                  <CardContent className="pt-6 flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    <p>Error loading questions. Please try again.</p>
                  </CardContent>
                </Card>
              ) : questions?.length === 0 ? (
                <Card className="bg-gray-50">
                  <CardContent className="py-8 text-center">
                    <p className="text-gray-500 mb-4">No questions added to this assessment yet</p>
                    <Button onClick={handleNewQuestion}>Add Your First Question</Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {questions?.map((question: any, index: number) => (
                    <Card key={question.id}>
                      <CardHeader className="py-4">
                        <div className="flex justify-between">
                          <div className="flex items-center">
                            <Badge variant="outline" className="mr-3">
                              {index + 1}
                            </Badge>
                            <CardTitle className="text-base font-medium">{question.questionText}</CardTitle>
                          </div>
                          <Badge>{question.points} points</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="py-2">
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-sm font-semibold mb-1">Options:</h4>
                            <ul className="list-disc list-inside pl-2 text-sm">
                              {question.options?.map((option: string, i: number) => (
                                <li key={i} className={option === question.correctAnswer ? 'text-green-600 font-medium' : ''}>
                                  {option} {option === question.correctAnswer && '(Correct)'}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          {question.explanation && (
                            <div>
                              <h4 className="text-sm font-semibold mb-1">Explanation:</h4>
                              <p className="text-sm text-gray-600">{question.explanation}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="border-t bg-gray-50 py-3 flex justify-end space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditQuestion(question)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteQuestion(question.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Assessment Dialog */}
      <Dialog open={showAssessmentDialog} onOpenChange={setShowAssessmentDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editMode ? 'Edit Assessment' : 'Create New Assessment'}</DialogTitle>
            <DialogDescription>
              {editMode 
                ? 'Update the details of the skill assessment.' 
                : 'Fill in the details to create a new skill assessment.'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...assessmentForm}>
            <form onSubmit={assessmentForm.handleSubmit(onAssessmentSubmit)} className="space-y-6">
              <FormField
                control={assessmentForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. JavaScript Fundamentals" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={assessmentForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Detailed description of the assessment" 
                        {...field} 
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={assessmentForm.control}
                  name="skill"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skill</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. JavaScript" {...field} />
                      </FormControl>
                      <FormDescription>
                        The main skill being assessed
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={assessmentForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assessment Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select assessment type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="quiz">Quiz</SelectItem>
                          <SelectItem value="coding">Coding Challenge</SelectItem>
                          <SelectItem value="text">Text/Written</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={assessmentForm.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty Level</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={assessmentForm.control}
                  name="timeLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time Limit (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} min={0} />
                      </FormControl>
                      <FormDescription>
                        Leave empty for no time limit
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={assessmentForm.control}
                  name="passingScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Passing Score (%)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} min={1} max={100} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={assessmentForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between p-3 shadow-sm rounded-md border">
                      <div className="space-y-0.5">
                        <FormLabel>Active Status</FormLabel>
                        <FormDescription>
                          Show this assessment to users
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAssessmentDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={assessmentMutation.isPending}
                >
                  {assessmentMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>{editMode ? 'Update' : 'Create'} Assessment</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Question Dialog */}
      <Dialog open={showQuestionDialog} onOpenChange={setShowQuestionDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editMode ? 'Edit Question' : 'Create New Question'}</DialogTitle>
            <DialogDescription>
              {editMode 
                ? 'Update the details of the question.' 
                : 'Fill in the details to create a new question.'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...questionForm}>
            <form onSubmit={questionForm.handleSubmit(onQuestionSubmit)} className="space-y-6">
              <FormField
                control={questionForm.control}
                name="questionText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Text</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="e.g. What is the output of console.log(1 + '2')?" 
                        {...field} 
                        rows={2}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={questionForm.control}
                name="options"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Options</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="e.g. 3, '12', 12, undefined" 
                        {...field} 
                        rows={2}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter options separated by commas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={questionForm.control}
                name="correctAnswer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correct Answer</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. '12'" {...field} />
                    </FormControl>
                    <FormDescription>
                      Must match one of the options exactly
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={questionForm.control}
                name="explanation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Explanation (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Explain why the answer is correct" 
                        {...field} 
                        rows={2}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={questionForm.control}
                  name="points"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Points</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} min={1} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={questionForm.control}
                  name="order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Order</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} min={0} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowQuestionDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={questionMutation.isPending}
                >
                  {questionMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>{editMode ? 'Update' : 'Create'} Question</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}