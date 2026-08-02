interface MoodBadgeProps {
  score: number;
  emotion: string;
  riskFlag?: boolean;
}

export default function MoodBadge({ score, emotion, riskFlag }: MoodBadgeProps) {
  const getBg = () => {
    if (riskFlag) return 'bg-destructive/15 text-destructive';
    if (score > 0.3) return 'bg-success/15 text-success';
    if (score > 0) return 'bg-primary/10 text-primary';
    if (score > -0.3) return 'bg-warning/15 text-warning';
    return 'bg-destructive/10 text-destructive';
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getBg()}`}>
      {riskFlag && '⚠️ '}
      {emotion} ({score > 0 ? '+' : ''}{score.toFixed(2)})
    </span>
  );
}
