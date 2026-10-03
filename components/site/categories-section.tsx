import { CategoryCard } from './category-card';
import { SectionHeading } from './section-heading';
import { qualificationCategories } from '@/lib/mock-data';

export function CategoriesSection() {
  return (
    <section className="py-12 sm:py-14">
      <div className="container-page">
        <SectionHeading
          title="Find Opportunities by Qualification"
          description="Filter jobs by your education level and find roles that match your profile"
          viewAllHref="/jobs"
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {qualificationCategories.map((category) => (
            <CategoryCard key={category.slug} category={category} variant="detailed" />
          ))}
        </div>
      </div>
    </section>
  );
}
