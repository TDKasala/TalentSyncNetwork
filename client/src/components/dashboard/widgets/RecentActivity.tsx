import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

interface Activity {
  id: string | number;
  title: string;
  description: string;
  timestamp: Date | string;
  type: 'match' | 'application' | 'view' | 'assessment' | 'message';
  status?: 'success' | 'pending' | 'info' | 'warning' | 'error';
  link?: string;
}

interface RecentActivityProps {
  activities: Activity[];
  viewAllLink?: string;
}

export function RecentActivity({ activities, viewAllLink }: RecentActivityProps) {
  // Function to format the relative time
  const formatRelativeTime = (date: Date | string) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - activityDate.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    }
    
    return activityDate.toLocaleDateString();
  };

  // Get icon for activity type
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'match':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="m4.555 5.168 1.414 1.414a4 4 0 0 1 1.172 2.834v1.089l1.242.484-.232 2.787a3.5 3.5 0 0 0 5.045 2.991.75.75 0 0 1 .88 1.214 5 5 0 0 1-7.405-3.897l.186-2.237-3.056-1.179a.75.75 0 0 1-.494-.731v-1.089a5.5 5.5 0 0 0-1.615-3.899l-1.414-1.414a.75.75 0 0 1 1.06-1.06l1.414 1.414a4 4 0 0 1 1.172 2.834v.639l.165-.063a.75.75 0 0 1 .496 0l2.165.832a.75.75 0 0 1 .492.727v.32a.75.75 0 0 1-.492.727l-2.165.832a.75.75 0 0 1-.496 0l-.165-.064v.639a4 4 0 0 1-1.172 2.834l-1.414 1.414a.75.75 0 1 1-1.06-1.06l1.414-1.414a2.5 2.5 0 0 0 .732-1.767v-.581l-.857.33a.75.75 0 0 1-1.069-.853l.799-1.997a.75.75 0 1 1 1.385.577l-.389.973.24-.093Zm14.132-1.527a.75.75 0 0 0-1.06-1.06l-1.414 1.414a4 4 0 0 0-1.172 2.834v.639l-.165-.063a.75.75 0 0 0-.496 0l-2.165.832a.75.75 0 0 0-.492.727v.32a.75.75 0 0 0 .492.727l2.165.832a.75.75 0 0 0 .496 0l.165-.063v.639a4 4 0 0 0 1.172 2.834l1.414 1.414a.75.75 0 0 0 1.06-1.06l-1.414-1.414a2.5 2.5 0 0 1-.732-1.767v-.581l.857.33a.75.75 0 0 0 1.069-.853l-.799-1.997a.75.75 0 1 0-1.385.577l.389.973-.24-.093v-1.43a5.5 5.5 0 0 1 1.615-3.9l1.414-1.414Z" />
          </svg>
        );
      case 'application':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.219a.75.75 0 0 0-1.06 0l-1.91 1.909.47.47a.75.75 0 1 1-1.06 1.06L6.53 8.091a.75.75 0 0 0-1.06 0l-2.97 2.97ZM12 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clipRule="evenodd" />
          </svg>
        );
      case 'view':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
            <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clipRule="evenodd" />
          </svg>
        );
      case 'assessment':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M9.664 1.319a.75.75 0 0 1 .672 0 41.059 41.059 0 0 1 8.198 5.424.75.75 0 0 1-.254 1.285 23.266 23.266 0 0 1-2.815.8 25.055 25.055 0 0 1 2.834 1.396.75.75 0 0 1 .216.664l-.528 2.643a.75.75 0 0 1-.282.421 24.993 24.993 0 0 1-3.736 2.241 24.949 24.949 0 0 1-3.235 1.34.75.75 0 0 1-.575 0 25.346 25.346 0 0 1-3.235-1.34 24.993 24.993 0 0 1-3.736-2.241.75.75 0 0 1-.282-.421l-.528-2.643a.75.75 0 0 1 .216-.664 25.055 25.055 0 0 1 2.834-1.396 23.279 23.279 0 0 1-2.815-.8.75.75 0 0 1-.254-1.285 41.059 41.059 0 0 1 8.198-5.424ZM7.512 2.513l.164.089a34.61 34.61 0 0 0 4.648 0l.164-.089a.75.75 0 0 1 .71.99 21.86 21.86 0 0 1-1.462 3.825c-.329.723-.723 1.496-1.192 2.218.518.099 1.026.223 1.52.374a23.539 23.539 0 0 1 1.655-.773 23.376 23.376 0 0 1 3.599-1.223.75.75 0 0 1 .449.398c.689.162 1.355.362 1.992.595a23.812 23.812 0 0 0-2.068-.98A.75.75 0 0 1 18.223 9.4l.113.563a.75.75 0 0 1-.23.67 23.512 23.512 0 0 1-3.395 2.03 23.563 23.563 0 0 1-2.932 1.218.75.75 0 0 1-.556 0 23.563 23.563 0 0 1-2.932-1.218 23.512 23.512 0 0 1-3.395-2.03.75.75 0 0 1-.23-.67l.113-.564a.75.75 0 0 1 .655-.56 23.812 23.812 0 0 0 1.992-.596.75.75 0 0 1 .448-.397 23.376 23.376 0 0 1 3.599 1.223 23.538 23.538 0 0 1 1.655.773c.494-.151 1.002-.275 1.52-.374-.469-.722-.863-1.495-1.191-2.218a21.86 21.86 0 0 1-1.463-3.825.75.75 0 0 1 .71-.991ZM5.37 10.5a34.096 34.096 0 0 0 3.324 2.25c.774.39 1.59.707 2.438.918a.75.75 0 0 1 .572.72v4.88a.75.75 0 0 1-.929.727 41.055 41.055 0 0 1-7.436-3.286.75.75 0 0 1-.387-.656v-4.78a.75.75 0 0 1 .418-.672ZM14.046 10.542a34.103 34.103 0 0 0 3.035-2.292.75.75 0 0 1 .418.672v4.78a.75.75 0 0 1-.387.657 41.033 41.033 0 0 1-7.436 3.286.75.75 0 0 1-.929-.727v-4.88a.75.75 0 0 1 .572-.72c.848-.21 1.664-.528 2.438-.918.569-.29 1.12-.603 1.654-.936l.635-.37Z" clipRule="evenodd" />
          </svg>
        );
      case 'message':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902 1.168.188 2.352.327 3.55.414.28.02.521.18.642.413l1.713 3.293a.75.75 0 0 0 1.33 0l1.713-3.293a.783.783 0 0 1 .642-.413 41.102 41.102 0 0 0 3.55-.414c1.437-.231 2.43-1.49 2.43-2.902V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0 0 10 2ZM6.75 6a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 2.5a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5h-3.5Z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  // Get badge variant based on status
  const getBadgeVariant = (status?: Activity['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'warning':
        return 'bg-orange-100 text-orange-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'info':
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Recent Activity</CardTitle>
        {viewAllLink && (
          <Link href={viewAllLink}>
            <Button variant="ghost" size="sm" className="text-sm">View all</Button>
          </Link>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-6 text-neutral-500">
              No recent activity
            </div>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4">
                <div className="flex-shrink-0 rounded-full p-1.5 bg-neutral-100 text-neutral-800">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-neutral-900">{activity.title}</p>
                    <span className="text-xs text-neutral-500">
                      {formatRelativeTime(activity.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600 mt-1">{activity.description}</p>
                  {activity.status && (
                    <div className="mt-2">
                      <Badge className={getBadgeVariant(activity.status)}>
                        {activity.status}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}