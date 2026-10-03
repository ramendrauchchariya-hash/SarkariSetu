import { ToolCard } from './tool-card';
import { SectionHeading } from './section-heading';
import { examTools } from '@/lib/mock-data';

export function ToolsSection() {
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
          {examTools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </div>
    </section>
  );
}
