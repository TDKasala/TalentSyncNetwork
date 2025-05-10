import { useEffect } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, ArrowRight } from 'lucide-react';

interface Job {
  id: number;
  title: string;
  description: string;
  location: string;
  type: string;
  skills: string[];
  createdAt: string;
  bbbeeLevel?: string;
  company?: {
    companyName: string;
  };
}

const Jobs = () => {
  const { t } = useLanguage();

  // Fetch featured jobs
  const { data: jobs, isLoading } = useQuery<Job[]>({
    queryKey: ['/api/jobs', 'featured'],
    queryFn: async () => {
      const response = await fetch('/api/jobs?limit=4');
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      return response.json();
    },
  });

  // Add placeholder data if no jobs are available yet
  const featuredJobs: Job[] = jobs || [
    {
      id: 1,
      title: 'Senior Software Engineer',
      description: 'TechCorp Solutions is looking for a senior software engineer with experience in React, Node.js, and PostgreSQL.',
      location: 'Johannesburg, South Africa',
      type: 'full-time',
      skills: ['React.js', 'Node.js', 'PostgreSQL', 'AWS'],
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      bbbeeLevel: '1',
      company: { companyName: 'TechCorp Solutions' }
    },
    {
      id: 2,
      title: 'Marketing Specialist',
      description: 'Brand Connect Africa is seeking a marketing specialist with digital marketing and SEO experience.',
      location: 'Cape Town, South Africa',
      type: 'contract',
      skills: ['Digital Marketing', 'SEO', 'Social Media'],
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      bbbeeLevel: '2',
      company: { companyName: 'Brand Connect Africa' }
    },
    {
      id: 3,
      title: 'Financial Analyst',
      description: 'Investment Partners SA needs a financial analyst with experience in financial modeling and analysis.',
      location: 'Pretoria, South Africa',
      type: 'full-time',
      skills: ['Financial Analysis', 'Excel', 'Investment'],
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      bbbeeLevel: '3',
      company: { companyName: 'Investment Partners SA' }
    },
    {
      id: 4,
      title: 'Product Designer',
      description: 'InnovateX Digital is hiring a product designer with UI/UX and Figma experience.',
      location: 'Remote (South Africa)',
      type: 'remote',
      skills: ['UI/UX', 'Figma', 'Product Design'],
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      bbbeeLevel: '1',
      company: { companyName: 'InnovateX Digital' }
    }
  ];

  return (
    <section className="py-12 bg-neutral-50" id="jobs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-neutral-900">{t('jobs.title')}</h2>
          <p className="mt-4 text-lg text-neutral-600 max-w-2xl mx-auto">{t('jobs.subtitle')}</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {featuredJobs.map(job => (
            <div key={job.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-neutral-200">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-1">{job.title}</h3>
                    <p className="text-neutral-600 text-sm mb-2">{job.company?.companyName}</p>
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
                    {t('jobs.posted')} {new Date(job.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap">
                  {job.skills.map((skill, index) => (
                    <Badge key={index} className="bg-neutral-100 text-neutral-800 mr-2 mb-2">
                      {skill}
                    </Badge>
                  ))}
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center">
                    <Badge variant="outline" className="text-xs font-medium text-neutral-600 bg-neutral-100 px-2 py-1 rounded">
                      B-BBEE Level {job.bbbeeLevel}
                    </Badge>
                  </div>
                  <Link href={`/jobs/${job.id}`} className="text-sm font-medium text-primary-600 hover:text-primary-800">
                    {t('jobs.view-details')}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-10 text-center">
          <Button
            asChild
            variant="outline"
            className="border-primary-600 text-primary-600 bg-white hover:bg-primary-50"
          >
            <Link href="/jobs" className="inline-flex items-center">
              {t('jobs.viewall')}
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Jobs;
