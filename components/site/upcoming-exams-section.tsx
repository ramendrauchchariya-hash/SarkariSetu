import { ExamTimelineItem } from './exam-card';
import { SectionHeading } from './section-heading';
import type { ExamListing } from '@/lib/types';

interface UpcomingExamsSectionProps {
  exams: ExamListing[];
}

export function UpcomingExamsSection({ exams }: UpcomingExamsSectionProps) {
  if (exams.length === 0) return null;

  return (
    <section className="py-12 sm:py-14">
      <div className="container-page">
        <SectionHeading
          title="Upcoming Exams"
          description="Stay ahead with exam schedules, application deadlines and important dates"
          viewAllHref="/exams"
          viewAllLabel="View Exam Calendar"
        />
        <div className="space-y-3">
          {exams.map((exam) => (
            <ExamTimelineItem key={exam.id} exam={exam} />
          ))}
        </div>
      </div>
    </section>
  );
}
