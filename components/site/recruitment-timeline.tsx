import { Check, Circle, Clock } from 'lucide-react';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';

export interface TimelineStep {
  label: string;
  date: string | null;
}

interface RecruitmentTimelineProps {
  steps: TimelineStep[];
  currentStepIndex: number;
  className?: string;
}

export function RecruitmentTimeline({
  steps,
  currentStepIndex,
  className,
}: RecruitmentTimelineProps) {
  return (
    <div className={cn('space-y-0', className)}>
      {steps.map((step, index) => {
        const isPast = index < currentStepIndex;
        const isCurrent = index === currentStepIndex;
        const isFuture = index > currentStepIndex;

        return (
          <div key={step.label} className="flex gap-3">
            {/* Icon + connecting line */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                  isPast && 'border-success bg-success text-success-foreground',
                  isCurrent && 'border-primary bg-primary text-primary-foreground',
                  isFuture && 'border-border bg-muted text-muted-foreground'
                )}
              >
                {isPast ? (
                  <Check className="h-4 w-4" />
                ) : isCurrent ? (
                  <Clock className="h-4 w-4" />
                ) : (
                  <Circle className="h-2 w-2 fill-current" />
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'w-0.5 flex-1',
                    isPast ? 'bg-success' : 'bg-border'
                  )}
                  style={{ minHeight: '28px' }}
                />
              )}
            </div>

            {/* Content */}
            <div className={cn('pb-5', index === steps.length - 1 && 'pb-0')}>
              <p
                className={cn(
                  'text-sm font-semibold leading-tight',
                  isFuture && 'text-muted-foreground',
                  isCurrent && 'text-primary',
                  isPast && 'text-foreground'
                )}
              >
                {step.label}
                {isCurrent && (
                  <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    Current Stage
                  </span>
                )}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {step.date ? formatDate(step.date) : 'Not announced yet'}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
