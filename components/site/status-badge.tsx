import { Badge } from '@/components/ui/badge';
import { statusConfig } from '@/lib/format';
import type { ListingStatus } from '@/lib/types';

interface StatusBadgeProps {
  status: ListingStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  // Older or unexpected database status values should not crash server rendering.
  const config = statusConfig[status] ?? statusConfig.upcoming;
  const label = status in statusConfig ? config.label : statusConfig.upcoming.label;

  return (
    <Badge variant={config.variant} className={className}>
      {label}
    </Badge>
  );
}
