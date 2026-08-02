import { useState } from 'react';
import { motion } from 'framer-motion';
import { Pill, Plus, Check, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getMedications, addMedication, removeMedication, getMedLogs, addMedLog, generateId, Medication } from '@/lib/storage';
import { format } from 'date-fns';

export default function Medications() {
  const [meds, setMeds] = useState<Medication[]>(getMedications());
  const [logs, setLogs] = useState(getMedLogs());
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [reminder, setReminder] = useState('08:00');

  const today = format(new Date(), 'yyyy-MM-dd');

  const handleAdd = () => {
    if (!name.trim()) return;
    const med: Medication = {
      id: generateId(),
      name: name.trim(),
      dosage: dosage.trim(),
      frequencyPerDay: 1,
      reminderTime: reminder,
    };
    addMedication(med);
    setMeds([...meds, med]);
    setName('');
    setDosage('');
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    removeMedication(id);
    setMeds(meds.filter(m => m.id !== id));
    setLogs(logs.filter(l => l.medicationId !== id));
  };

  const isTakenToday = (medId: string) => logs.some(l => l.medicationId === medId && l.takenDate === today && l.taken);

  const markTaken = (medId: string) => {
    if (isTakenToday(medId)) return;
    const log = { id: generateId(), medicationId: medId, takenDate: today, taken: true };
    addMedLog(log);
    setLogs([...logs, log]);
  };

  // Streak
  const getStreak = (medId: string) => {
    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const day = format(new Date(Date.now() - i * 86400000), 'yyyy-MM-dd');
      if (logs.some(l => l.medicationId === medId && l.takenDate === day && l.taken)) streak++;
      else break;
    }
    return streak;
  };

  const weekAdherence = () => {
    if (meds.length === 0) return 0;
    let taken = 0, total = meds.length * 7;
    for (let i = 0; i < 7; i++) {
      const day = format(new Date(Date.now() - i * 86400000), 'yyyy-MM-dd');
      meds.forEach(m => {
        if (logs.some(l => l.medicationId === m.id && l.takenDate === day && l.taken)) taken++;
      });
    }
    return Math.round((taken / total) * 100);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <Pill className="w-6 h-6 text-primary" />
            Medications
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Weekly adherence: {weekAdherence()}%</p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)} size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </div>

      {/* Add form */}
      {showAdd && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-card rounded-xl p-4 card-shadow space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Medication name" value={name} onChange={e => setName(e.target.value)} />
            <Input placeholder="Dosage (e.g., 10mg)" value={dosage} onChange={e => setDosage(e.target.value)} />
          </div>
          <div className="flex items-center gap-3">
            <Input type="time" value={reminder} onChange={e => setReminder(e.target.value)} className="w-36" />
            <Button onClick={handleAdd} disabled={!name.trim()} size="sm">Save</Button>
            <Button onClick={() => setShowAdd(false)} variant="ghost" size="sm">Cancel</Button>
          </div>
        </motion.div>
      )}

      {/* Medication list */}
      <div className="space-y-3">
        {meds.map((med, i) => {
          const taken = isTakenToday(med.id);
          const streak = getStreak(med.id);
          return (
            <motion.div
              key={med.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`bg-card rounded-xl p-4 card-shadow flex items-center justify-between transition-all ${taken ? 'ring-2 ring-success/30' : ''}`}
            >
              <div className="flex-1">
                <p className="font-medium text-foreground">{med.name}</p>
                <p className="text-xs text-muted-foreground">{med.dosage} · Reminder: {med.reminderTime}</p>
                <p className="text-xs text-primary mt-0.5">🔥 {streak} day streak</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={taken ? 'default' : 'outline'}
                  onClick={() => markTaken(med.id)}
                  disabled={taken}
                  className={taken ? 'bg-success hover:bg-success text-success-foreground' : ''}
                >
                  {taken ? <Check className="w-4 h-4" /> : 'Take'}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(med.id)}>
                  <Trash2 className="w-4 h-4 text-muted-foreground" />
                </Button>
              </div>
            </motion.div>
          );
        })}
        {meds.length === 0 && (
          <p className="text-center text-muted-foreground py-12 text-sm">No medications added yet. Tap "Add" to get started.</p>
        )}
      </div>
    </div>
  );
}
