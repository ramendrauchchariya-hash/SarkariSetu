import { ToolCard } from './tool-card';
import { SectionHeading } from './section-heading';
import type { ExamTool } from '@/lib/types';

interface ToolsSectionProps {
  tools: ExamTool[];
}

export function ToolsSection({ tools }: ToolsSectionProps) {
  if (tools.length === 0) return null;

  return (
    <section className="border-y bg-muted/20 py-12 sm:py-14">
      <div className="container-page">
        <SectionHeading
          title="Useful Exam Tools"
          description="Smart calculators and utilities to help with your exam preparation"
          viewAllHref="/tools"
          viewAllLabel="View All Tools"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </div>
    </section>
  );
}
