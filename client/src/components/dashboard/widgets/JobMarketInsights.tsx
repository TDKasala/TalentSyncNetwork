import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Badge } from '@/components/ui/badge';

interface TrendingSkill {
  name: string;
  growth: number;
  demand: 'high' | 'medium' | 'low';
}

interface JobMarketInsight {
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface JobMarketInsightsProps {
  trendingSkills: TrendingSkill[];
  insights: JobMarketInsight[];
}

export function JobMarketInsights({ trendingSkills, insights }: JobMarketInsightsProps) {
  // Get the badge variant based on demand
  const getDemandBadgeVariant = (demand: 'high' | 'medium' | 'low') => {
    switch (demand) {
      case 'high':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-neutral-100 text-neutral-700';
      default:
        return 'bg-neutral-100 text-neutral-700';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Job Market Insights</CardTitle>
        <CardDescription>Trends in your industry</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Trending Skills Section */}
          <div>
            <h4 className="text-sm font-medium mb-2">Trending Skills</h4>
            <div className="flex flex-wrap gap-2">
              {trendingSkills.map((skill, index) => (
                <div key={index} className="flex items-center space-x-1">
                  <Badge variant="outline" className={getDemandBadgeVariant(skill.demand)}>
                    {skill.name}
                  </Badge>
                  <span className={`text-xs ${skill.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {skill.growth > 0 ? '+' : ''}{skill.growth}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Market Insights Section */}
          <div className="pt-2">
            <h4 className="text-sm font-medium mb-2">Latest Insights</h4>
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <div key={index} className="flex items-start space-x-3 p-2 rounded-md hover:bg-neutral-50">
                  <div className="rounded-full p-1.5 bg-primary-100 text-primary-800">
                    {insight.icon}
                  </div>
                  <div>
                    <h5 className="text-sm font-medium">{insight.title}</h5>
                    <p className="text-xs text-neutral-600 mt-1">{insight.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 mt-2 border-t border-neutral-200">
            <Link href="/market-insights">
              <Button variant="outline" size="sm" className="w-full">
                View Full Market Report
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}