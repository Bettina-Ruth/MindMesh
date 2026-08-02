// localStorage wrapper for MindMesh data — scoped per user

import { getCurrentUserId } from './auth';

export interface UserProfile {
  name: string;
  primaryGoal: 'MOOD' | 'MEDICATION' | 'FITNESS' | 'STRESS';
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  content: string;
  sentimentScore: number;
  emotionLabel: string;
  riskFlag: boolean;
  createdAt: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequencyPerDay: number;
  reminderTime: string;
}

export interface MedicationLog {
  id: string;
  medicationId: string;
  takenDate: string;
  taken: boolean;
}

export interface FitnessLog {
  id: string;
  logDate: string;
  activityCompleted: boolean;
  steps: number;
  minutesExercised: number;
  intensity: 'LOW' | 'MEDIUM' | 'HIGH';
}

function userKey(base: string): string {
  const uid = getCurrentUserId();
  return uid ? `mindmesh_${uid}_${base}` : `mindmesh_${base}`;
}

function get<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function set(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Profile
export const getProfile = (): UserProfile | null => get(userKey('profile'), null);
export const setProfile = (p: UserProfile) => set(userKey('profile'), p);

// Journal
export const getJournals = (): JournalEntry[] => get(userKey('journals'), []);
export const addJournal = (entry: JournalEntry) => {
  const entries = getJournals();
  entries.unshift(entry);
  set(userKey('journals'), entries);
};

// Medications
export const getMedications = (): Medication[] => get(userKey('medications'), []);
export const addMedication = (med: Medication) => {
  const meds = getMedications();
  meds.push(med);
  set(userKey('medications'), meds);
};
export const removeMedication = (id: string) => {
  set(userKey('medications'), getMedications().filter(m => m.id !== id));
  set(userKey('med_logs'), getMedLogs().filter(l => l.medicationId !== id));
};

// Medication Logs
export const getMedLogs = (): MedicationLog[] => get(userKey('med_logs'), []);
export const addMedLog = (log: MedicationLog) => {
  const logs = getMedLogs();
  logs.push(log);
  set(userKey('med_logs'), logs);
};

// Fitness
export const getFitnessLogs = (): FitnessLog[] => get(userKey('fitness'), []);
export const addFitnessLog = (log: FitnessLog) => {
  const logs = getFitnessLogs();
  logs.push(log);
  set(userKey('fitness'), logs);
};

export const generateId = () => Math.random().toString(36).substring(2, 10);
