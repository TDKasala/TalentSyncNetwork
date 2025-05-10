import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Check, File, Upload, FileText, Trash2 } from 'lucide-react';

interface ResumeUploadProps {
  onUploadSuccess: (data: any) => void;
  existingResumeUrl?: string;
}

const ResumeUpload = ({ onUploadSuccess, existingResumeUrl }: ResumeUploadProps) => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Resume upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + Math.random() * 20;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 500);

      try {
        const response = await apiRequest('POST', '/api/resumes/upload', formData);
        // Set progress to 100% on success
        setUploadProgress(100);
        return response.json();
      } finally {
        clearInterval(progressInterval);
      }
    },
    onSuccess: (data) => {
      toast({
        title: 'Resume Uploaded',
        description: 'Your resume has been uploaded and skills have been extracted',
      });
      setFile(null);
      setUploadProgress(0);
      onUploadSuccess(data);
    },
    onError: (error: any) => {
      setUploadProgress(0);
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload resume. Please try again.',
        variant: 'destructive',
      });
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check if file is a PDF
      if (selectedFile.type !== 'application/pdf') {
        toast({
          title: 'Invalid File',
          description: 'Please upload a PDF file',
          variant: 'destructive',
        });
        return;
      }
      
      // Check file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'Please upload a file smaller than 5MB',
          variant: 'destructive',
        });
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleUpload = () => {
    if (!file) return;
    
    const formData = new FormData();
    formData.append('resume', file);
    
    uploadMutation.mutate(formData);
  };

  const handleDelete = async () => {
    // In a real app, we would call an API to delete the resume
    // For now, we'll just show a success message
    toast({
      title: 'Resume Deleted',
      description: 'Your resume has been deleted',
    });
  };

  return (
    <div className="space-y-6">
      {existingResumeUrl && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <File className="h-8 w-8 text-red-500 mr-3" />
                <div>
                  <h3 className="text-base font-medium">Current Resume</h3>
                  <p className="text-sm text-neutral-500">
                    Your resume is already uploaded and being used for matching
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="bg-neutral-50 border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center">
        <input
          type="file"
          id="resume-upload"
          className="hidden"
          accept=".pdf"
          onChange={handleFileChange}
          disabled={uploadMutation.isPending}
        />
        
        {!file ? (
          <label htmlFor="resume-upload" className="cursor-pointer block">
            <Upload className="h-10 w-10 text-neutral-400 mx-auto mb-3" />
            <p className="text-base font-medium mb-1">Upload your resume</p>
            <p className="text-sm text-neutral-500 mb-4">PDF file up to 5MB</p>
            <Button 
              type="button" 
              variant="outline" 
              disabled={uploadMutation.isPending}
            >
              Select PDF
            </Button>
          </label>
        ) : (
          <div>
            <FileText className="h-10 w-10 text-primary-600 mx-auto mb-3" />
            <p className="text-base font-medium mb-1">{file.name}</p>
            <p className="text-sm text-neutral-500 mb-4">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
            
            {uploadMutation.isPending ? (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="h-2 w-full" />
                <p className="text-sm text-neutral-600">
                  Uploading and analyzing your resume...
                </p>
              </div>
            ) : (
              <div className="flex justify-center space-x-3">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setFile(null)}
                >
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  onClick={handleUpload}
                >
                  Upload Resume
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-blue-800 mb-1">Why upload your resume?</h4>
            <p className="text-sm text-blue-700">
              Our AI will analyze your resume to extract skills and experience, improving your match accuracy. 
              Your resume is kept secure and private until you choose to share it with recruiters.
            </p>
          </div>
        </div>
      </div>

      {uploadMutation.isSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-green-800 mb-1">Resume successfully processed</h4>
              <p className="text-sm text-green-700">
                We've extracted your skills and information from your resume. Your profile has been updated.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;
