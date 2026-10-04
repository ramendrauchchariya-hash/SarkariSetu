import { DepartmentCard } from './department-card';
import { SectionHeading } from './section-heading';
import type { Department } from '@/lib/types';

interface DepartmentsSectionProps {
  departments: Department[];
}

export function DepartmentsSection({ departments }: DepartmentsSectionProps) {
  if (departments.length === 0) return null;

  return (
    <section className="border-y bg-muted/20 py-12 sm:py-14">
      <div className="container-page">
        <SectionHeading
          title="Popular Government Departments"
          description="Browse opportunities by recruiting department or organization"
          viewAllHref="/jobs"
        />
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9">
          {departments.map((dept) => (
            <DepartmentCard key={dept.slug} department={dept} />
          ))}
        </div>
      </div>
    </section>
  );
}
