import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Link } from 'wouter';

interface Skill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  progress: number;
  verified?: boolean;
}

interface SkillsProgressProps {
  skills: Skill[];
  title?: string;
  showVerifyButtons?: boolean;
}

export function SkillsProgress({ skills, title = "Skills Progress", showVerifyButtons = true }: SkillsProgressProps) {
  // Function to get badge color based on skill level
  const getLevelBadgeClass = (level: Skill['level']) => {
    switch (level) {
      case 'beginner':
        return 'bg-blue-100 text-blue-800';
      case 'intermediate':
        return 'bg-green-100 text-green-800';
      case 'advanced':
        return 'bg-purple-100 text-purple-800';
      case 'expert':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  // Function to get progress color based on progress value
  const getProgressColor = (progress: number) => {
    if (progress < 25) return 'bg-red-600';
    if (progress < 50) return 'bg-yellow-600';
    if (progress < 75) return 'bg-blue-600';
    return 'bg-green-600';
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {skills.length === 0 ? (
          <div className="text-center py-6 text-neutral-500">
            No skills added yet
          </div>
        ) : (
          <div className="space-y-4">
            {skills.map((skill, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{skill.name}</span>
                    <Badge className={getLevelBadgeClass(skill.level)}>
                      {skill.level}
                    </Badge>
                    {skill.verified && (
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 20 20" 
                        fill="#10b981" 
                        className="w-4 h-4"
                      >
                        <path 
                          fillRule="evenodd" 
                          d="M16.403 12.652a3 3 0 0 0 0-5.304 3 3 0 0 0-3.75-3.751 3 3 0 0 0-5.305 0 3 3 0 0 0-3.751 3.75 3 3 0 0 0 0 5.305 3 3 0 0 0 3.75 3.751 3 3 0 0 0 5.305 0 3 3 0 0 0 3.751-3.75Zm-2.546-4.46a.75.75 0 0 0-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" 
                          clipRule="evenodd" 
                        />
                      </svg>
                    )}
                  </div>
                  {showVerifyButtons && !skill.verified && (
                    <Link href={`/skills/assessment?skill=${encodeURIComponent(skill.name)}`}>
                      <Button variant="outline" size="sm">
                        Verify
                      </Button>
                    </Link>
                  )}
                </div>
                <div className="space-y-1">
                  <Progress value={skill.progress} className={getProgressColor(skill.progress)} />
                  <div className="flex justify-between text-xs text-neutral-500">
                    <span>{skill.progress}% complete</span>
                    {!skill.verified && <span>Not verified</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 pt-2 border-t border-neutral-200">
          <Link href="/skills">
            <Button variant="outline" size="sm" className="w-full">
              Take Skills Assessment
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}