import { cn } from '../../lib/utils';
import { Belt } from '../../types';

interface BeltBadgeProps {
  belt?: Belt;
  className?: string;
}

export function BeltBadge({ belt, className }: BeltBadgeProps) {
  if (!belt) return null;

  const beltStyles: Record<Belt, string> = {
    WHITE: 'bg-krav-card text-gray-800 border-gray-300',
    YELLOW: 'bg-[#ffdf00] text-gray-900 border-[#d4b900]',
    ORANGE: 'bg-[#ff8c00] text-white border-[#cc7000]',
    GREEN: 'bg-[#008000] text-white border-[#005900]',
    BLUE: 'bg-[#00008e] text-white border-[#000066]',
    BROWN: 'bg-[#654321] text-white border-[#4a3118]',
    BLACK: 'bg-black text-white border-gray-800',
  };

  const labels: Record<Belt, string> = {
    WHITE: 'Branca', YELLOW: 'Amarela', ORANGE: 'Laranja', GREEN: 'Verde',
    BLUE: 'Azul', BROWN: 'Marrom', BLACK: 'Preta'
  };

  return (
    <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border', beltStyles[belt], className)}>
      {labels[belt]}
    </span>
  );
}
