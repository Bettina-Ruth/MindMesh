// Simple keyword-based sentiment analysis (replaces ML)

const POSITIVE_WORDS = [
  'happy', 'great', 'wonderful', 'amazing', 'good', 'love', 'excited', 'grateful',
  'blessed', 'joy', 'peaceful', 'calm', 'relaxed', 'proud', 'accomplished',
  'motivated', 'energetic', 'hopeful', 'confident', 'content', 'cheerful',
  'fantastic', 'brilliant', 'excellent', 'better', 'improved', 'smile', 'laugh',
];

const NEGATIVE_WORDS = [
  'sad', 'angry', 'depressed', 'anxious', 'stressed', 'tired', 'exhausted',
  'lonely', 'frustrated', 'worried', 'overwhelmed', 'hopeless', 'miserable',
  'terrible', 'awful', 'bad', 'worse', 'pain', 'hurt', 'cry', 'crying',
  'fear', 'scared', 'nervous', 'upset', 'annoyed', 'irritated', 'drained',
];

const RISK_KEYWORDS = [
  'self-harm', 'suicide', 'kill myself', 'end it all', 'don\'t want to live',
  'no reason to live', 'better off dead', 'want to die', 'hurt myself',
];

const EMOTION_MAP: Record<string, string[]> = {
  'Joy': ['happy', 'joy', 'excited', 'cheerful', 'love', 'fantastic', 'brilliant', 'laugh', 'smile'],
  'Gratitude': ['grateful', 'blessed', 'thankful', 'appreciate'],
  'Calm': ['peaceful', 'calm', 'relaxed', 'content', 'serene'],
  'Sadness': ['sad', 'lonely', 'cry', 'crying', 'miserable', 'depressed'],
  'Anxiety': ['anxious', 'worried', 'nervous', 'stressed', 'overwhelmed', 'fear', 'scared'],
  'Anger': ['angry', 'frustrated', 'annoyed', 'irritated', 'upset'],
  'Fatigue': ['tired', 'exhausted', 'drained'],
};

export function analyzeSentiment(text: string): { score: number; emotion: string; riskFlag: boolean } {
  const lower = text.toLowerCase();
  const words = lower.split(/\W+/);

  // Risk detection
  const riskFlag = RISK_KEYWORDS.some(kw => lower.includes(kw));

  // Score
  let pos = 0, neg = 0;
  words.forEach(w => {
    if (POSITIVE_WORDS.includes(w)) pos++;
    if (NEGATIVE_WORDS.includes(w)) neg++;
  });

  const total = pos + neg || 1;
  const score = Math.round(((pos - neg) / total) * 100) / 100;

  // Emotion
  let emotion = 'Neutral';
  let maxMatch = 0;
  for (const [label, keywords] of Object.entries(EMOTION_MAP)) {
    const count = words.filter(w => keywords.includes(w)).length;
    if (count > maxMatch) {
      maxMatch = count;
      emotion = label;
    }
  }

  return { score: Math.max(-1, Math.min(1, score)), emotion, riskFlag };
}
