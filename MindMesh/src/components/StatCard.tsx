import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtitle?: string;
  variant?: 'default' | 'primary' | 'accent' | 'success';
}

const variantClasses = {
  default: 'bg-card',
  primary: 'bg-primary/5',
  accent: 'bg-accent/10',
  success: 'bg-success/10',
};

const iconVariantClasses = {
  default: 'bg-secondary text-foreground',
  primary: 'bg-primary/15 text-primary',
  accent: 'bg-accent/20 text-accent',
  success: 'bg-success/15 text-success',
};

export default function StatCard({ icon: Icon, label, value, subtitle, variant = 'default' }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`rounded-xl p-5 card-shadow transition-shadow hover:card-shadow-hover ${variantClasses[variant]}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold font-display mt-1 text-foreground">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconVariantClasses[variant]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  );
}
