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
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9">
          {[
            ...departments.map((department) => ({
              ...department,
              key: `department-${department.slug}`,
              href: `/jobs?department=${department.slug}`,
            })),
            ...organizations.map((organization) => ({
              ...organization,
              key: `organization-${organization.slug}`,
              href: `/jobs?q=${encodeURIComponent(organization.label)}`,
            })),
          ].map((item) => (
            <DepartmentCard
              key={item.key}
              department={item}
              href={item.href}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
