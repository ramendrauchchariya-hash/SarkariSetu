import { DepartmentCard } from './department-card';
import { SectionHeading } from './section-heading';
import type { Department } from '@/lib/types';

interface DepartmentsSectionProps {
  departments: Department[];
  organizations: Department[];
}

export function DepartmentsSection({ departments, organizations }: DepartmentsSectionProps) {
  if (departments.length === 0 && organizations.length === 0) return null;

  return (
    <section className="border-y bg-muted/20 py-12 sm:py-14">
      <div className="container-page">
        <SectionHeading
          title="Browse Government Departments & Organizations"
          description="Explore live opportunities grouped by the departments and organizations currently recruiting."
          viewAllHref="/jobs"
        />
        {departments.length > 0 && (
          <>
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Departments</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9">
              {departments.map((dept) => (
                <DepartmentCard key={`department-${dept.slug}`} department={dept} />
              ))}
            </div>
          </>
        )}
        {organizations.length > 0 && (
          <>
            <h3 className="mb-3 mt-8 text-sm font-semibold text-muted-foreground">Organizations</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9">
              {organizations.map((organization) => (
                <DepartmentCard
                  key={`organization-${organization.slug}`}
                  department={organization}
                  href={`/jobs?q=${encodeURIComponent(organization.label)}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
