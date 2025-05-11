import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

interface QuickAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link';
}

interface QuickActionsProps {
  title: string;
  actions: QuickAction[];
}

export function QuickActions({ title, actions }: QuickActionsProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {actions.map((action, i) => (
            <Link key={i} href={action.href}>
              <div className="flex items-center cursor-pointer p-2 -mx-2 rounded-md hover:bg-neutral-100">
                <div className="flex items-center justify-center rounded-md w-8 h-8 bg-primary-100 text-primary-800 mr-3">
                  {action.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium">{action.title}</h3>
                  <p className="text-xs text-neutral-500">{action.description}</p>
                </div>
                <Button variant={action.variant || 'ghost'} size="sm" className="ml-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z" clipRule="evenodd" />
                  </svg>
                </Button>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}