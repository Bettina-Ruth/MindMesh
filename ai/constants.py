# Risk Detection Constants
HIGH_RISK_PHRASES = [
    "suicide", "self-harm", "end my life", "want to die", 
    "kill myself", "better off dead", "nothing to live for"
]

MEDIUM_RISK_PHRASES = [
    "despair", "low mood", "hopeless", "giving up", 
    "can't go on", "everything is dark", "no point"
]

RISK_WEIGHTS = {
    "high_phrase": 4.0,
    "medium_phrase": 2.0,
    "negative_polarity_multiplier": 3.0,
    "intensity_boost_threshold": 0.5
}

# Emotion Mappings
EMOTION_CATEGORIES = {
    "Joy": {"keywords": ["happy", "joy", "excited", "great", "wonderful"], "polarity_min": 0.3},
    "Sad": {"keywords": ["sad", "depressed", "lonely", "crying"], "polarity_max": -0.2},
    "Angry": {"keywords": ["angry", "mad", "furious", "hate"], "polarity_max": -0.1},
    "Anxious": {"keywords": ["anxious", "worried", "nervous", "panic"], "polarity_max": 0.0},
    "Neutral": {"keywords": [], "polarity_min": -0.1, "polarity_max": 0.1}
}

# Message Templates
MESSAGES = {
    "URGENT": "It sounds like you're going through an extremely difficult time. This is an urgent situation. Please reach out to a professional or someone you trust immediately. You don't have to face this alone.",
    "Joy": "It's wonderful to see you're feeling positive today! Keep nurturing this energy.",
    "Sad": "I'm sorry to hear you're feeling down. Remember that it's okay to feel this way, and taking small steps for self-care can help.",
    "Angry": "It's okay to feel frustrated. Sometimes writing it all out is a good first step to finding calm.",
    "Anxious": "Take a deep breath. You've handled tough situations before, and you can handle this one too.",
    "Neutral": "Thank you for sharing your thoughts today. Consistency in journaling is a great habit for mental clarity."
}

# Statistical Thresholds
CORRELATION_THRESHOLD = 0.3
TREND_WINDOW = 5
