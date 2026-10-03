import { cn } from '@/lib/utils';

interface DetailSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function DetailSection({
  title,
  description,
  children,
  className,
  id,
}: DetailSectionProps) {
  return (
    <section id={id} className={cn('space-y-3', className)}>
      <div>
        <h2 className="font-display text-lg font-bold tracking-tight sm:text-xl">
          {title}
        </h2>
        {description && (
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}
