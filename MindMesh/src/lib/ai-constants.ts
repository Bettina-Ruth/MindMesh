export const HIGH_RISK_PHRASES = [
  "suicide", "self-harm", "end my life", "want to die",
  "kill myself", "better off dead", "nothing to live for",
  "wanna die", "end it all", "end it", "over it", "hurt myself",
  "suicidal", "planning to kill", "take my life", "cut myself",
  "overdose", "hanging", "jump off", "bullet in", "no way out"
];

export const MEDIUM_RISK_PHRASES = [
  "despair", "low mood", "hopeless", "giving up",
  "can't go on", "everything is dark", "no point",
  "don't care anymore", "miserable", "hurting inside",
  "worthless", "empty", "lonely forever", "burden",
  "pain is too much", "tired of living", "don't want to wake up"
];

export const RISK_WEIGHTS = {
  high_phrase: 4.0,
  medium_phrase: 2.0,
  negative_polarity_multiplier: 3.0,
  intensity_boost_threshold: 0.5
} as const;

export const MESSAGES = {
  URGENT: "It sounds like you're going through an extremely difficult time. This is an urgent situation. Please reach out to a professional or someone you trust immediately. You don't have to face this alone.",
  Joy: "It's wonderful to see you're feeling positive today! Keep nurturing this energy.",
  Sad: "I'm sorry to hear you're feeling down. Remember that it's okay to feel this way, and taking small steps for self-care can help.",
  Angry: "It's okay to feel frustrated. Sometimes writing it all out is a good first step to finding calm.",
  Anxious: "Take a deep breath. You've handled tough situations before, and you can handle this one too.",
  Neutral: "Thank you for sharing your thoughts today. Consistency in journaling is a great habit for mental clarity."
} as const;

export const CORRELATION_THRESHOLD = 0.3;
export const TREND_WINDOW = 5;
