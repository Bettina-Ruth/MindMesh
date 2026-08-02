import { addJournal, addFitnessLog, addMedLog, addMedication, generateId } from './storage';
import { subDays, format } from 'date-fns';

export function seedSampleData() {
    const now = new Date();

    // 1. Add sample medications if none exist
    const sampleMeds = [
        { name: 'Vitamin D', dosage: '1000 IU', frequency: 1 },
        { name: 'Omega-3', dosage: '500mg', frequency: 1 }
    ];

    const medIds: string[] = [];
    sampleMeds.forEach(m => {
        const id = generateId();
        addMedication({
            id,
            name: m.name,
            dosage: m.dosage,
            frequencyPerDay: m.frequency,
            reminderTime: '08:00'
        });
        medIds.push(id);
    });

    // 2. Generate 5 days of history
    for (let i = 5; i >= 0; i--) {
        const date = subDays(now, i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const isoStr = date.toISOString();

        // Journal Entry
        let content = "";
        let score = 0;
        let emotion = "";

        if (i === 5) {
            content = "Starting this journal. Feeling a bit overwhelmed with everything task-wise.";
            score = -0.3;
            emotion = "Anxious";
        } else if (i === 4) {
            content = "Had a good walk today. It helped clear my head. Feeling much better.";
            score = 0.5;
            emotion = "Joy";
        } else if (i === 3) {
            content = "Busy day at work, didn't have much time for myself. Feeling neutral.";
            score = 0;
            emotion = "Neutral";
        } else if (i === 2) {
            content = "Great session at the gym! The endorphins are amazing. Extremely positive vibe.";
            score = 0.8;
            emotion = "Joy";
        } else if (i === 1) {
            content = "Focused and productive. Making progress on my goals feels great.";
            score = 0.6;
            emotion = "Joy";
        } else {
            content = "Today has been wonderful. Feeling grateful for the small things.";
            score = 0.7;
            emotion = "Joy";
        }

        addJournal({
            id: generateId(),
            content,
            sentimentScore: score,
            emotionLabel: emotion,
            riskFlag: false,
            createdAt: isoStr
        });

        // Fitness Log
        addFitnessLog({
            id: generateId(),
            logDate: dateStr,
            activityCompleted: true,
            steps: 5000 + Math.floor(Math.random() * 5000),
            minutesExercised: i % 2 === 0 ? 30 + Math.floor(Math.random() * 30) : 0,
            intensity: i % 2 === 0 ? 'MEDIUM' : 'LOW'
        });

        // Med Logs (mostly taken)
        medIds.forEach(medId => {
            addMedLog({
                id: generateId(),
                medicationId: medId,
                takenDate: dateStr,
                taken: Math.random() > 0.2
            });
        });
    }
}
