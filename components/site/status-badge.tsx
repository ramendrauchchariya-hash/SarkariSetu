import { Badge } from '@/components/ui/badge';
import { statusConfig } from '@/lib/format';
import type { ListingStatus } from '@/lib/types';

interface StatusBadgeProps {
  status: ListingStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}
