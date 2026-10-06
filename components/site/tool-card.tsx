import Link from 'next/link';
import * as Icons from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { ExamTool } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ToolCardProps {
  tool: ExamTool;
  className?: string;
}

export function ToolCard({ tool, className }: ToolCardProps) {
  const Icon = (Icons[tool.icon as keyof typeof Icons] ??
    Icons.Wrench) as Icons.LucideIcon;

  return (
    <Link href={tool.href ?? `/tools/${tool.slug}`} className="block" target={tool.href?.startsWith('http') ? '_blank' : undefined} rel={tool.href?.startsWith('http') ? 'noreferrer' : undefined}>
      <Card
        className={cn(
          'group h-full p-5 transition-all hover:-translate-y-0.5 hover:shadow-card-hover',
          className
        )}
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary/10 text-secondary transition-colors group-hover:bg-secondary group-hover:text-secondary-foreground">
          <Icon className="h-5 w-5" />
        </span>
        <h3 className="mt-3 font-semibold leading-tight group-hover:text-primary">
          {tool.title}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {tool.description}
        </p>
        <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-secondary">
          Open tool
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </Card>
    </Link>
  );
}
