import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  link?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  icon,
  description,
  trend,
  trendValue,
  link,
  className,
}: StatCardProps) {
  const content = (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-neutral-500">{title}</p>
            <h4 className="text-2xl font-bold mt-2">{value}</h4>
            {description && <p className="text-sm text-neutral-600 mt-1">{description}</p>}
            
            {trend && trendValue && (
              <div className="flex items-center mt-2">
                {trend === 'up' && (
                  <span className="text-green-600 text-xs font-medium flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1">
                      <path fillRule="evenodd" d="M10 17a.75.75 0 0 1-.75-.75V5.612L5.29 9.77a.75.75 0 0 1-1.08-1.04l5.25-5.5a.75.75 0 0 1 1.08 0l5.25 5.5a.75.75 0 1 1-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0 1 10 17Z" clipRule="evenodd" />
                    </svg>
                    {trendValue}
                  </span>
                )}
                {trend === 'down' && (
                  <span className="text-red-600 text-xs font-medium flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1">
                      <path fillRule="evenodd" d="M10 3a.75.75 0 0 1 .75.75v10.638l3.96-4.158a.75.75 0 1 1 1.08 1.04l-5.25 5.5a.75.75 0 0 1-1.08 0l-5.25-5.5a.75.75 0 1 1 1.08-1.04l3.96 4.158V3.75A.75.75 0 0 1 10 3Z" clipRule="evenodd" />
                    </svg>
                    {trendValue}
                  </span>
                )}
                {trend === 'neutral' && (
                  <span className="text-neutral-600 text-xs font-medium flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1">
                      <path d="M4 10a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H4.75A.75.75 0 0 1 4 10Z" />
                    </svg>
                    {trendValue}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="rounded-full p-2 bg-primary-100">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (link) {
    return (
      <Link href={link} className="block transition hover:shadow-md">
        {content}
      </Link>
    );
  }

  return content;
}