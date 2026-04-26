import { cn } from '../../lib/utils';
import { Status } from '../../types';

interface StatusPillProps {
  status?: Status;
  className?: string;
}

export function StatusPill({ status, className }: StatusPillProps) {
  if (!status) return null;

  const styles: Record<Status, string> = {
    ACTIVE: 'bg-krav-success/15 text-krav-success',
    PENDING: 'bg-krav-warning/15 text-krav-warning',
    SUSPENDED: 'bg-krav-muted/15 text-krav-muted',
    OVERDUE: 'bg-krav-danger/15 text-krav-danger',
  };

  const labels: Record<Status, string> = {
    ACTIVE: 'Ativo', PENDING: 'Pendente', SUSPENDED: 'Suspenso', OVERDUE: 'Em Atraso'
  };

  return (
    <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide', styles[status], className)}>
      {labels[status]}
    </span>
  );
}
