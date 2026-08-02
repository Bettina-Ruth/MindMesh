import { motion } from 'framer-motion';
import { BarChart3, Brain, TrendingUp, ArrowUpRight, ArrowDownRight, Minus, Sparkles, Activity, Pill, Target } from 'lucide-react';
import { getWeeklyInsights } from '@/lib/insights';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

export default function Insights() {
  const insights = getWeeklyInsights();

  const trendIcon = (val: number) => {
    if (val > 0.1) return <div className="p-1 rounded-full bg-success/10 text-success"><ArrowUpRight className="w-4 h-4" /></div>;
    if (val < -0.1) return <div className="p-1 rounded-full bg-destructive/10 text-destructive"><ArrowDownRight className="w-4 h-4" /></div>;
    return <div className="p-1 rounded-full bg-muted/10 text-muted-foreground"><Minus className="w-4 h-4" /></div>;
  };

  const metrics = [
    { label: 'Avg Mood', value: insights.avgMood.toFixed(2), icon: trendIcon(insights.avgMood), sub: 'Weekly average' },
    { label: 'Fitness', value: `${Math.round(insights.fitnessCorrelation * 100)}%`, icon: <Activity className="w-4 h-4 text-primary" />, sub: 'Mood correlation' },
    { label: 'Medication', value: `${Math.round(insights.medicationCorrelation * 100)}%`, icon: <Pill className="w-4 h-4 text-accent" />, sub: 'Adherence link' },
    { label: 'Forecast', value: insights.predictedNextMood.toFixed(2), icon: <Target className="w-4 h-4 text-primary" />, sub: 'Predicted mood' },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-primary" />
          Behavioral Insights
        </h1>
        <p className="text-muted-foreground text-sm mt-1">AI-powered analysis of your habits and mood patterns based on recent trends.</p>
      </motion.div>

      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card/50 backdrop-blur-sm border rounded-3xl p-8 card-shadow relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
          <Brain className="w-32 h-32" />
        </div>
        <div className="flex items-start gap-6 relative z-10">
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/30">
            <Brain className="w-7 h-7 text-primary-foreground" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-primary">AI Perspective</span>
              <Sparkles className="w-3.5 h-3.5 text-primary" />
            </div>
            <h2 className="text-xl font-display font-semibold text-foreground">Weekly Summary</h2>
            <p className="text-foreground/80 leading-relaxed max-w-2xl">
              {insights.summary || "You haven't logged enough data this week to generate detailed behavioral insights. Start journaling and logging your activities to see patterns!"}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card border rounded-2xl p-5 card-shadow group hover:bg-primary/5 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-tight">{m.label}</p>
              {m.icon}
            </div>
            <p className="text-2xl font-display font-black text-foreground">{m.value}</p>
            <p className="text-[10px] text-muted-foreground font-medium mt-1">{m.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Analytics Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card border rounded-3xl p-8 card-shadow"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Emotional Trajectory
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">Distribution of sentiment scores over the last 7 days</p>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full bg-secondary">
            <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-primary" />Positive</div>
            <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-destructive" />Negative</div>
          </div>
        </div>

        <div className="h-[280px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={insights.moodTrend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fontWeight: 600, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[-1, 1]}
                tick={{ fontSize: 11, fontWeight: 600, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                ticks={[-1, -0.5, 0, 0.5, 1]}
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--primary)/0.03)' }}
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '1rem',
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                  padding: '12px'
                }}
              />
              <Bar dataKey="score">
                {insights.moodTrend.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.score >= 0 ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'}
                    radius={entry.score >= 0 ? [6, 6, 0, 0] : [0, 0, 6, 6]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
