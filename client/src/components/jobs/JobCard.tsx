import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, MapPin, Calendar } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

interface Job {
  id: number;
  title: string;
  description: string;
  location: string;
  type: string;
  companyId?: number;
  skills: string[];
  createdAt: string;
  bbbeeLevel?: string;
  company?: {
    companyName: string;
  };
}

interface JobCardProps {
  job: Job;
  showViewButton?: boolean;
  showApplyButton?: boolean;
  showBBBEE?: boolean;
  className?: string;
}

const JobCard = ({ 
  job, 
  showViewButton = true, 
  showApplyButton = false, 
  showBBBEE = true,
  className = ''
}: JobCardProps) => {
  const { t } = useLanguage();
  
  // Format date as relative time (e.g. "2 days ago")
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Card className={`border border-neutral-200 shadow-sm overflow-hidden ${className}`}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-1">{job.title}</h3>
            <p className="text-neutral-600 text-sm mb-2">{job.company?.companyName || "Company"}</p>
          </div>
          <Badge className={job.type === 'full-time' ? 'bg-primary-100 text-primary-800' : 'bg-secondary-100 text-secondary-800'}>
            {job.type}
          </Badge>
        </div>
        
        <div className="mt-4">
          <div className="flex items-center text-sm text-neutral-500 mb-2">
            <MapPin className="h-4 w-4 mr-2" />
            {job.location}
          </div>
          <div className="flex items-center text-sm text-neutral-500">
            <Calendar className="h-4 w-4 mr-2" />
            {t('jobs.posted')} {getRelativeTime(job.createdAt)}
          </div>
        </div>
        
        <div className="mt-4 line-clamp-2 text-sm text-neutral-700">
          {job.description}
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2">
          {job.skills?.slice(0, 4).map((skill, index) => (
            <Badge key={index} variant="outline" className="bg-neutral-100 text-neutral-800">
              {skill}
            </Badge>
          ))}
          {job.skills?.length > 4 && (
            <Badge variant="outline" className="bg-neutral-100 text-neutral-800">
              +{job.skills.length - 4} more
            </Badge>
          )}
        </div>
        
        <div className="mt-6 flex items-center justify-between">
          {showBBBEE && job.bbbeeLevel && (
            <Badge variant="outline" className="text-xs font-medium text-neutral-600 bg-neutral-100 px-2 py-1 rounded">
              B-BBEE Level {job.bbbeeLevel}
            </Badge>
          )}

          <div className="flex space-x-2 ml-auto">
            {showViewButton && (
              <Button 
                variant="link" 
                size="sm" 
                className="text-primary-600 hover:text-primary-800 p-0" 
                asChild
              >
                <Link href={`/jobs/${job.id}`}>
                  {t('jobs.view-details')}
                </Link>
              </Button>
            )}
            
            {showApplyButton && (
              <Button 
                variant="default" 
                size="sm"
                className="bg-primary-600 hover:bg-primary-700"
              >
                Apply Now
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobCard;
