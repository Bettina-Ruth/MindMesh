import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Plus, Flame, Clock, Footprints } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getFitnessLogs, addFitnessLog, generateId, FitnessLog } from '@/lib/storage';
import { format, subDays } from 'date-fns';
import StatCard from '@/components/StatCard';

export default function Fitness() {
  const [logs, setLogs] = useState<FitnessLog[]>(getFitnessLogs());
  const [showAdd, setShowAdd] = useState(false);
  const [steps, setSteps] = useState('');
  const [minutes, setMinutes] = useState('');
  const [intensity, setIntensity] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayLog = logs.find(l => l.logDate === today);

  const handleAdd = () => {
    const log: FitnessLog = {
      id: generateId(),
      logDate: today,
      activityCompleted: true,
      steps: parseInt(steps) || 0,
      minutesExercised: parseInt(minutes) || 0,
      intensity,
    };
    addFitnessLog(log);
    setLogs([...logs, log]);
    setSteps('');
    setMinutes('');
    setShowAdd(false);
  };

  // Weekly stats
  const weekLogs = logs.filter(l => {
    const d = new Date(l.logDate);
    return d >= subDays(new Date(), 7);
  });
  const weekMinutes = weekLogs.reduce((s, l) => s + l.minutesExercised, 0);
  const weekSteps = weekLogs.reduce((s, l) => s + l.steps, 0);

  // Streak
  let streak = 0;
  for (let i = 0; i < 30; i++) {
    const day = format(subDays(new Date(), i), 'yyyy-MM-dd');
    if (logs.some(l => l.logDate === day)) streak++;
    else break;
  }

  const intensityColor = (i: string) => {
    if (i === 'HIGH') return 'bg-destructive/15 text-destructive';
    if (i === 'MEDIUM') return 'bg-warning/15 text-warning';
    return 'bg-success/15 text-success';
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            Fitness
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Track your daily activity and build consistency.</p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)} size="sm" className="gap-1.5 rounded-full gradient-primary">
          <Plus className="w-4 h-4" />
          Log Activity
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={Flame} label="Streak" value={streak} variant="primary" />
        <StatCard icon={Clock} label="Week Minutes" value={weekMinutes} variant="accent" />
        <StatCard icon={Footprints} label="Week Steps" value={weekSteps.toLocaleString()} variant="success" />
      </div>

      {/* Add form */}
      {showAdd && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-card rounded-xl p-4 card-shadow space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Steps" type="number" value={steps} onChange={e => setSteps(e.target.value)} />
            <Input placeholder="Minutes exercised" type="number" value={minutes} onChange={e => setMinutes(e.target.value)} />
          </div>
          <div className="flex items-center gap-3">
            <Select value={intensity} onValueChange={v => setIntensity(v as 'LOW' | 'MEDIUM' | 'HIGH')}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleAdd} size="sm">Save</Button>
            <Button onClick={() => setShowAdd(false)} variant="ghost" size="sm">Cancel</Button>
          </div>
        </motion.div>
      )}

      {/* Log history */}
      <div className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-foreground">Recent Activity</h2>
        {[...logs].reverse().slice(0, 14).map((log, i) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="bg-card rounded-xl p-4 card-shadow flex items-center justify-between"
          >
            <div>
              <p className="font-medium text-foreground text-sm">{format(new Date(log.logDate), 'MMM d, yyyy')}</p>
              <p className="text-xs text-muted-foreground">{log.minutesExercised}min · {log.steps.toLocaleString()} steps</p>
            </div>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${intensityColor(log.intensity)}`}>
              {log.intensity}
            </span>
          </motion.div>
        ))}
        {logs.length === 0 && (
          <p className="text-center text-muted-foreground py-12 text-sm">No fitness logs yet. Start tracking today!</p>
        )}
      </div>
    </div>
  );
}
