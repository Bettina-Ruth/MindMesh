import { getJournals, getFitnessLogs, getMedLogs, getMedications } from './storage';
import { subDays, format, parseISO, isAfter } from 'date-fns';

export interface WeeklyInsight {
  avgMood: number;
  fitnessCorrelation: number;
  medicationCorrelation: number;
  predictedNextMood: number;
  summary: string;
  moodTrend: { date: string; score: number }[];
}

function pearsonCorrelation(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  if (n < 3) return 0;
  const xs = x.slice(0, n), ys = y.slice(0, n);
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i++) {
    const xd = xs[i] - mx, yd = ys[i] - my;
    num += xd * yd;
    dx += xd * xd;
    dy += yd * yd;
  }
  const denom = Math.sqrt(dx * dy);
  return denom === 0 ? 0 : Math.round((num / denom) * 100) / 100;
}

export function getWeeklyInsights(): WeeklyInsight {
  const now = new Date();
  const weekAgo = subDays(now, 7);

  // Use strings for comparison to avoid time-of-day edge cases in filtering
  const weekAgoStr = format(weekAgo, 'yyyy-MM-dd');

  const journals = getJournals().filter(j => j.createdAt.split('T')[0] >= weekAgoStr);
  const fitness = getFitnessLogs().filter(f => f.logDate >= weekAgoStr);
  const medLogs = getMedLogs().filter(l => l.takenDate >= weekAgoStr);
  const meds = getMedications();

  // Avg mood
  const avgMood = journals.length
    ? Math.round((journals.reduce((s, j) => s + j.sentimentScore, 0) / journals.length) * 100) / 100
    : 0;

  // Daily mood scores for the week
  const moodTrend: { date: string; score: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = format(subDays(now, i), 'yyyy-MM-dd');
    const dayJournals = journals.filter(j => j.createdAt.startsWith(day));
    const dayScore = dayJournals.length
      ? dayJournals.reduce((s, j) => s + j.sentimentScore, 0) / dayJournals.length
      : 0;
    moodTrend.push({ date: format(subDays(now, i), 'EEE'), score: Math.round(dayScore * 100) / 100 });
  }

  // Fitness correlation
  const dailyMoods: number[] = [];
  const dailyFitness: number[] = [];
  for (let i = 14; i >= 0; i--) { // Use more days for better correlation signal if available
    const day = format(subDays(now, i), 'yyyy-MM-dd');
    const dj = getJournals().filter(j => j.createdAt.startsWith(day));
    const df = getFitnessLogs().filter(f => f.logDate === day);

    if (dj.length > 0) {
      const avgDayMood = dj.reduce((s, j) => s + j.sentimentScore, 0) / dj.length;
      const dayMinutes = df.reduce((sum, log) => sum + log.minutesExercised, 0);
      dailyMoods.push(avgDayMood);
      dailyFitness.push(dayMinutes);
    }
  }
  const fitnessCorrelation = pearsonCorrelation(dailyMoods, dailyFitness);

  // Medication correlation
  const dailyMedAdherence: number[] = [];
  const dailyMoodsForMed: number[] = [];
  for (let i = 14; i >= 0; i--) {
    const day = format(subDays(now, i), 'yyyy-MM-dd');
    const dj = getJournals().filter(j => j.createdAt.startsWith(day));
    const dl = getMedLogs().filter(l => l.takenDate === day);

    if (dj.length > 0 && meds.length > 0) {
      const avgDayMood = dj.reduce((s, j) => s + j.sentimentScore, 0) / dj.length;
      const adherence = dl.filter(l => l.taken).length / Math.max(meds.length, 1);
      dailyMoodsForMed.push(avgDayMood);
      dailyMedAdherence.push(adherence);
    }
  }
  const medicationCorrelation = pearsonCorrelation(dailyMoodsForMed, dailyMedAdherence);

  // Simple prediction: weighted average of recent moods with trend
  const recentScores = moodTrend.map(m => m.score).filter(s => s !== 0);
  let predictedNextMood = avgMood;
  if (recentScores.length >= 2) {
    const trend = recentScores[recentScores.length - 1] - recentScores[recentScores.length - 2];
    predictedNextMood = Math.round(Math.max(-1, Math.min(1, avgMood + trend * 0.3)) * 100) / 100;
  }

  // Summary
  const parts: string[] = [];
  if (fitnessCorrelation > 0.1) parts.push(`Exercise correlates with ${Math.round(fitnessCorrelation * 100)}% mood improvement.`);
  if (medicationCorrelation > 0.1) parts.push(`Medication adherence shows ${Math.round(medicationCorrelation * 100)}% positive mood link.`);
  if (avgMood > 0.2) parts.push('Your mood has been positive this week. Keep it up!');
  else if (avgMood < -0.2) parts.push('Your mood has been lower this week. Consider reaching out for support.');
  else parts.push('Your mood has been neutral this week.');
  if (predictedNextMood > avgMood) parts.push('Trend suggests improvement tomorrow.');

  return {
    avgMood,
    fitnessCorrelation,
    medicationCorrelation,
    predictedNextMood,
    summary: parts.join(' ') || 'Add more data to get personalized insights.',
    moodTrend,
  };
}
