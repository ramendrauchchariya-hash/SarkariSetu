import { CategoryCard } from './category-card';
import { SectionHeading } from './section-heading';
import type { Category } from '@/lib/types';

interface CategoriesSectionProps {
  categories: Category[];
}

export function CategoriesSection({ categories }: CategoriesSectionProps) {
  if (categories.length === 0) return null;

  return (
    <section className="py-12 sm:py-14">
      <div className="container-page">
        <SectionHeading
          title="Find Opportunities by Qualification"
          description="Filter jobs by your education level and find roles that match your profile"
          viewAllHref="/jobs"
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <CategoryCard key={category.slug} category={category} variant="detailed" />
          ))}
        </div>
      </div>
    </section>
  );
}
