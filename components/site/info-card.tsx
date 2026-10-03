import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface InfoCardProps {
  children: React.ReactNode;
  className?: string;
}

export function InfoCard({ children, className }: InfoCardProps) {
  return (
    <Card className={cn('p-4 sm:p-5', className)}>{children}</Card>
  );
}
