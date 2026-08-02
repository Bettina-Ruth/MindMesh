// Simple localStorage-based auth for multi-user support

export interface StoredUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  primaryGoal: 'MOOD' | 'MEDICATION' | 'FITNESS' | 'STRESS';
  createdAt: string;
}

const USERS_KEY = 'mindmesh_users';
const SESSION_KEY = 'mindmesh_session';

function generateId() {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

// Simple hash (not cryptographically secure — fine for localStorage demo)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'mindmesh_salt_2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function getUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export async function registerUser(
  email: string,
  password: string,
  name: string,
  primaryGoal: StoredUser['primaryGoal'] = 'MOOD'
): Promise<{ success: boolean; error?: string; user?: StoredUser }> {
  const users = getUsers();
  const normalizedEmail = email.toLowerCase().trim();

  if (users.some(u => u.email === normalizedEmail)) {
    return { success: false, error: 'An account with this email already exists.' };
  }

  const user: StoredUser = {
    id: generateId(),
    email: normalizedEmail,
    name: name.trim(),
    passwordHash: await hashPassword(password),
    primaryGoal,
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  saveUsers(users);
  setSession(user);
  return { success: true, user };
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; user?: StoredUser }> {
  const users = getUsers();
  const normalizedEmail = email.toLowerCase().trim();
  const user = users.find(u => u.email === normalizedEmail);

  if (!user) {
    return { success: false, error: 'No account found with this email.' };
  }

  const hash = await hashPassword(password);
  if (hash !== user.passwordHash) {
    return { success: false, error: 'Incorrect password.' };
  }

  setSession(user);
  return { success: true, user };
}

export async function resetPassword(
  email: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const users = getUsers();
  const normalizedEmail = email.toLowerCase().trim();
  const idx = users.findIndex(u => u.email === normalizedEmail);

  if (idx === -1) {
    return { success: false, error: 'No account found with this email.' };
  }

  users[idx].passwordHash = await hashPassword(newPassword);
  saveUsers(users);
  return { success: true };
}

export function setSession(user: StoredUser) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id, email: user.email, name: user.name }));
}

export function getSession(): { userId: string; email: string; name: string } | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function getCurrentUserId(): string | null {
  return getSession()?.userId ?? null;
}
