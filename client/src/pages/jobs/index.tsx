import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useLanguage } from '@/lib/i18n';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Briefcase, MapPin, Calendar, Search } from 'lucide-react';

interface Job {
  id: number;
  title: string;
  description: string;
  location: string;
  type: string;
  companyId: number;
  skills: string[];
  createdAt: string;
  company?: {
    companyName: string;
  };
}

const JobsPage = () => {
  const { t } = useLanguage();
  const [location, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Update page title
  useEffect(() => {
    document.title = `${t('jobs.title')} | ${t('app.name')}`;
  }, [t]);

  // Debounce search term to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch jobs with search
  const { data: jobs, isLoading } = useQuery<Job[]>({
    queryKey: ['/api/jobs', debouncedSearchTerm],
    queryFn: async () => {
      const url = debouncedSearchTerm
        ? `/api/jobs?search=${encodeURIComponent(debouncedSearchTerm)}`
        : '/api/jobs';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      return response.json();
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      <main className="flex-grow py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-neutral-900">{t('jobs.title')}</h1>
            <p className="mt-4 text-lg text-neutral-600 max-w-2xl mx-auto">{t('jobs.subtitle')}</p>
          </div>

          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search jobs by title, skills, or location..."
                className="pl-10 py-6"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : jobs?.length === 0 ? (
            <Card>
              <CardContent className="pt-6 flex flex-col items-center justify-center py-12 text-center">
                <Briefcase className="h-12 w-12 text-neutral-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No jobs found</h3>
                <p className="text-neutral-500 mb-4">Try adjusting your search terms</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {jobs?.map((job) => (
                <Card key={job.id} className="overflow-hidden border border-neutral-200 shadow-sm">
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
                        Posted {new Date(job.createdAt).toLocaleDateString()}
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
                      <Button variant="link" className="text-primary-600 hover:text-primary-800 p-0" onClick={() => setLocation(`/jobs/${job.id}`)}>
                        {t('jobs.view-details')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default JobsPage;
