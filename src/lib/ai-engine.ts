import {
    HIGH_RISK_PHRASES,
    MEDIUM_RISK_PHRASES,
    RISK_WEIGHTS,
    MESSAGES,
    CORRELATION_THRESHOLD,
    TREND_WINDOW
} from './ai-constants';

// A simple sentiment lexicon for client-side use
// In a real app, this could be more comprehensive or use a library
const SENTIMENT_LEXICON: Record<string, number> = {
    // Positive
    "happy": 0.8, "joy": 0.9, "excited": 0.8, "great": 0.7, "wonderful": 0.9,
    "good": 0.5, "excellent": 0.9, "amazing": 0.9, "love": 0.8, "blessed": 0.7,
    "grateful": 0.7, "peaceful": 0.6, "calm": 0.5, "relaxed": 0.5, "better": 0.4,
    "awesome": 0.8, "fantastic": 0.9, "proud": 0.7, "hopeful": 0.6,
    "cheerful": 0.7, "content": 0.5, "delighted": 0.8, "elated": 0.9, "glad": 0.5,
    "inspired": 0.7, "optimistic": 0.6, "pleased": 0.5, "radiant": 0.8, "satisfied": 0.5,
    "thrilled": 0.9, "vibrant": 0.7, "confident": 0.6, "strong": 0.5, "peace": 0.6,
    "success": 0.7, "win": 0.7, "gift": 0.6, "beautiful": 0.7, "lovely": 0.7,
    // Negative
    "sad": -0.8, "depressed": -0.9, "lonely": -0.7, "crying": -0.8, "angry": -0.7,
    "mad": -0.6, "furious": -0.9, "hate": -0.8, "anxious": -0.6, "worried": -0.5,
    "nervous": -0.4, "panic": -0.8, "hopeless": -0.9, "despair": -0.9, "tired": -0.3,
    "exhausted": -0.5, "stressed": -0.6, "overwhelmed": -0.7, "bad": -0.5, "terrible": -0.8,
    "awful": -0.9, "hurts": -0.7, "pain": -0.7, "miserable": -0.9, "gutted": -0.8,
    "gloomy": -0.6, "heartbroken": -0.9, "heavy": -0.4, "low": -0.5, "melancholy": -0.6,
    "pessimistic": -0.6, "sorrowful": -0.8, "unhappy": -0.7,
    "fear": -0.7, "scared": -0.7, "terrified": -0.9, "dread": -0.8, "guilt": -0.6,
    "shame": -0.7, "loneliness": -0.8, "abandoned": -0.8, "rejected": -0.7, "failure": -0.7,
    "lost": -0.6, "broken": -0.8, "disappointed": -0.6, "frustrated": -0.6,
    // Extreme Risk Markers (Impact Sentiment even if not in high_risk_phrases)
    "die": -1.0, "death": -1.0, "kill": -1.0, "hurt": -0.8, "harm": -0.9,
    "suicide": -1.0, "hopelessness": -0.9
};

export interface AIAnalysisResult {
    emotion: string;
    polarity: number;
    confidence_score: number;
    risk_score: number;
    risk_level: string;
    risk_flag: boolean;
    trend: string;
    ai_message: string;
    insights: string[];
}

class SentimentEngine {
    analyze(text: string) {
        const words = text.toLowerCase().match(/\b(\w+)\b/g) || [];
        let polarity = 0;
        let matches = 0;

        words.forEach(word => {
            if (SENTIMENT_LEXICON[word]) {
                polarity += SENTIMENT_LEXICON[word];
                matches++;
            }
        });

        // Normalize polarity to -1 to 1 range
        const normalizedPolarity = matches > 0 ? Math.max(-1, Math.min(1, polarity / Math.sqrt(matches))) : 0;

        // Specific emotion detection based on keyword counts
        const categoryCounts: Record<string, number> = { joy: 0, sad: 0, angry: 0, anxious: 0 };
        const joyWords = ["happy", "joy", "excited", "great", "wonderful", "excellent", "amazing", "love", "blessed", "grateful", "awesome", "fantastic", "proud", "hopeful", "cheerful", "content", "delighted", "elated", "glad", "inspired", "optimistic", "pleased", "radiant", "satisfied", "thrilled", "vibrant", "confident", "strong", "peace", "success", "win", "gift", "beautiful", "lovely"];
        const sadWords = ["sad", "depressed", "lonely", "crying", "hopeless", "despair", "tired", "exhausted", "bad", "terrible", "awful", "miserable", "gutted", "gloomy", "heartbroken", "heavy", "low", "melancholy", "sorrowful", "unhappy", "lost", "broken", "disappointed"];
        const angryWords = ["angry", "mad", "furious", "hate", "frustrated", "irritated", "annoyed"];
        const anxiousWords = ["anxious", "worried", "nervous", "panic", "fear", "scared", "terrified", "dread", "guilt", "shame", "loneliness", "abandoned", "rejected"];

        words.forEach(word => {
            if (joyWords.includes(word)) categoryCounts.joy++;
            if (sadWords.includes(word)) categoryCounts.sad++;
            if (angryWords.includes(word)) categoryCounts.angry++;
            if (anxiousWords.includes(word)) categoryCounts.anxious++;
        });

        let emotion = "Neutral";
        if (normalizedPolarity >= 0.1) {
            emotion = "Joy";
        } else if (normalizedPolarity <= -0.05) {
            // Determine the most prominent negative emotion
            const maxVal = Math.max(categoryCounts.sad, categoryCounts.angry, categoryCounts.anxious);
            if (maxVal > 0) {
                if (categoryCounts.sad === maxVal) emotion = "Sad";
                else if (categoryCounts.anxious === maxVal) emotion = "Anxious";
                else if (categoryCounts.angry === maxVal) emotion = "Angry";
            } else {
                emotion = "Sad"; // Default for negative if no specific keywords matched
            }
        }

        const confidence = matches > 0 ? Math.min(1.0, 0.5 + (Math.abs(normalizedPolarity) * 0.5)) : 0.5;

        return {
            emotion,
            polarity: normalizedPolarity,
            confidence_score: Math.round(confidence * 100) / 100
        };
    }
}

class RiskEngine {
    calculate_risk(text: string, polarity: number) {
        const textLower = text.toLowerCase();

        // Count total occurrences of all high and medium risk phrases
        let high_count = 0;
        HIGH_RISK_PHRASES.forEach(phrase => {
            const regex = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            const matches = textLower.match(regex);
            if (matches) high_count += matches.length;
        });

        let med_count = 0;
        MEDIUM_RISK_PHRASES.forEach(phrase => {
            const regex = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            const matches = textLower.match(regex);
            if (matches) med_count += matches.length;
        });

        // Intensity factor (check for ALL CAPS or multiple exclamation marks)
        const isAllCap = text.length > 5 && text === text.toUpperCase();
        const hasMultipleExclamations = /!!+/.test(text);
        const intensity_factor = (isAllCap || hasMultipleExclamations) ? 0.5 : 0.0;

        const neg_polarity = Math.min(0, polarity);
        let score = (high_count * RISK_WEIGHTS.high_phrase) +
            (med_count * RISK_WEIGHTS.medium_phrase) +
            (Math.abs(neg_polarity) * RISK_WEIGHTS.negative_polarity_multiplier) +
            intensity_factor;

        score = Math.min(10.0, score);

        let level = "LOW";
        if (score >= 9) level = "CRITICAL";
        else if (score >= 6) level = "HIGH";
        else if (score >= 3) level = "MEDIUM";

        const risk_flag = level === "HIGH" || level === "CRITICAL";

        return {
            risk_score: Math.round(score * 10) / 10,
            risk_level: level,
            risk_flag
        };
    }
}

class InsightEngine {
    get_correlations_and_trends(history: any[]) {
        if (!history || history.length < 5) {
            return {
                insights: history && history.length > 0 ? ["Not enough data for insights (minimum 5 entries required)."] : [],
                trend: "stable"
            };
        }

        const insights: string[] = [];

        // Trend detection
        let trend = "stable";
        const recent = history.slice(-TREND_WINDOW).map(h => h.polarity);
        if (recent.length >= 3) {
            const isImproving = recent.every((val, i) => i === 0 || val > recent[i - 1]);
            const isDeclining = recent.every((val, i) => i === 0 || val < recent[i - 1]);
            if (isImproving) trend = "improving";
            else if (isDeclining) trend = "declining";
        }

        // Note: Pearson correlation for exercise/meds would be implemented here 
        // if history contains those fields. For now, we use a placeholder or basic check.

        return { insights, trend };
    }
}

class MessageEngine {
    get_message(emotion: string, risk_level: string): string {
        if (risk_level === "HIGH" || risk_level === "CRITICAL") {
            return MESSAGES.URGENT;
        }
        return (MESSAGES as any)[emotion] || MESSAGES.Neutral;
    }
}

export class MindMeshAnalyzer {
    private sentiment_engine = new SentimentEngine();
    private risk_engine = new RiskEngine();
    private insight_engine = new InsightEngine();
    private message_engine = new MessageEngine();

    analyze_journal(text: string, history: any[] = []): AIAnalysisResult {
        if (!text || !text.trim()) {
            return this._empty_response();
        }

        const clean_text = text.trim();
        const sentiment_res = this.sentiment_engine.analyze(clean_text);
        const risk_res = this.risk_engine.calculate_risk(clean_text, sentiment_res.polarity);

        if (risk_res.risk_flag) {
            return {
                ...sentiment_res,
                ...risk_res,
                trend: "N/A (Priority Evaluation)",
                ai_message: this.message_engine.get_message(sentiment_res.emotion, risk_res.risk_level),
                insights: ["Insights suspended due to high risk priority."]
            };
        }

        const insight_res = this.insight_engine.get_correlations_and_trends(history);
        const ai_message = this.message_engine.get_message(sentiment_res.emotion, risk_res.risk_level);

        return {
            ...sentiment_res,
            ...risk_res,
            trend: insight_res.trend,
            ai_message,
            insights: insight_res.insights
        };
    }

    private _empty_response(): AIAnalysisResult {
        return {
            emotion: "Neutral",
            polarity: 0.0,
            confidence_score: 0.0,
            risk_score: 0,
            risk_level: "LOW",
            risk_flag: false,
            trend: "stable",
            ai_message: MESSAGES.Neutral,
            insights: []
        };
    }
}

export const mindMeshAnalyzer = new MindMeshAnalyzer();
