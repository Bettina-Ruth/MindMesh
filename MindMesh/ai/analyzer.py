import re
import pandas as pd
import numpy as np
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from constants import (
    HIGH_RISK_PHRASES, MEDIUM_RISK_PHRASES, RISK_WEIGHTS, 
    EMOTION_CATEGORIES, MESSAGES, CORRELATION_THRESHOLD, TREND_WINDOW
)

class SentimentEngine:
    def __init__(self):
        self.analyzer = SentimentIntensityAnalyzer()

    def analyze(self, text):
        scores = self.analyzer.polarity_scores(text)
        polarity = scores['compound']
        
        # Determine emotion based on polarity thresholds
        if polarity >= 0.3:
            emotion = "Joy"
        elif polarity <= -0.5:
            emotion = "Sad"
        elif polarity <= -0.25:
            emotion = "Angry"
        elif polarity < -0.05:
            emotion = "Anxious"
        else:
            emotion = "Neutral"
        
        # Confidence score: Strength of the sentiment signal (0.5 to 1.0)
        # Interpretation: 0.5 = Neutral/Uncertain, 1.0 = Highly certain emotional marker.
        confidence = abs(polarity) * 0.5 + 0.5 if polarity != 0 else 0.5
        
        return {
            "emotion": emotion,
            "polarity": polarity,
            "confidence_score": round(confidence, 2)
        }

class RiskEngine:
    def calculate_risk(self, text, polarity):
        text_lower = text.lower()
        high_count = sum(1 for phrase in HIGH_RISK_PHRASES if phrase in text_lower)
        med_count = sum(1 for phrase in MEDIUM_RISK_PHRASES if phrase in text_lower)
        
        # Intensity factor (check for ALL CAPS or multiple exclamation marks)
        intensity_factor = 0.5 if text.isupper() or "!!" in text else 0.0
        
        # Weighted Scoring: (high * 4) + (med * 2) + (abs(neg_polarity) * 3) + intensity
        neg_polarity = min(0, polarity)
        score = (high_count * RISK_WEIGHTS["high_phrase"]) + \
                (med_count * RISK_WEIGHTS["medium_phrase"]) + \
                (abs(neg_polarity) * RISK_WEIGHTS["negative_polarity_multiplier"]) + \
                intensity_factor
        
        score = min(10.0, score) # Clamp to 10
        
        # Precise Thresholds (0-2 LOW, 3-5 MED, 6-8 HIGH, 9-10 CRITICAL)
        level = "LOW"
        if score >= 9:
            level = "CRITICAL"
        elif score >= 6:
            level = "HIGH"
        elif score >= 3:
            level = "MEDIUM"
            
        risk_flag = level in ["HIGH", "CRITICAL"]
        
        return {
            "risk_score": round(score, 1),
            "risk_level": level,
            "risk_flag": risk_flag
        }

class InsightEngine:
    def get_correlations_and_trends(self, history):
        # Minimum sample requirement (n >= 5) for statistical relevance
        if not history or len(history) < 5:
            return {
                "insights": ["Not enough data for insights (minimum 5 entries required)."] if history and len(history) > 0 else [], 
                "trend": "stable"
            }
        
        df = pd.DataFrame(history)
        
        insights = []
        
        # Pearson Correlation
        if 'exercise_minutes' in df.columns:
            corr_exercise = df['exercise_minutes'].corr(df['polarity'])
            if not np.isnan(corr_exercise) and abs(corr_exercise) >= CORRELATION_THRESHOLD:
                # Fixed grammar: "tends to improve/decrease"
                impact = "improve" if corr_exercise > 0 else "decrease"
                insights.append(f"On days you exercise, your mood tends to {impact} (corr: {round(corr_exercise, 2)}).")
                
        if 'medication_taken' in df.columns:
            corr_meds = df['medication_taken'].corr(df['polarity'])
            if not np.isnan(corr_meds) and abs(corr_meds) >= CORRELATION_THRESHOLD:
                impact = "improve" if corr_meds > 0 else "lower"
                insights.append(f"Your mood tends to {impact} on days you take your medication (corr: {round(corr_meds, 2)}).")

        # Trend Detection
        trend = "stable"
        recent = df.tail(TREND_WINDOW)['polarity'].tolist()
        if len(recent) >= 3:
            if all(x < y for x, y in zip(recent, recent[1:])):
                trend = "improving"
            elif all(x > y for x, y in zip(recent, recent[1:])):
                trend = "declining"

        return {
            "insights": insights,
            "trend": trend
        }

class MessageEngine:
    def get_message(self, emotion, risk_level):
        if risk_level in ["HIGH", "CRITICAL"]:
            return MESSAGES["URGENT"]
        return MESSAGES.get(emotion, MESSAGES["Neutral"])

class MindMeshAnalyzer:
    def __init__(self):
        self.sentiment_engine = SentimentEngine()
        self.risk_engine = RiskEngine()
        self.insight_engine = InsightEngine()
        self.message_engine = MessageEngine()

    def _preprocess(self, text):
        if not text:
            return ""
        # Basic cleaning
        text = re.sub(r'\s+', ' ', text).strip()
        return text

    def analyze_journal(self, text, history=None):
        if not text or not text.strip():
            return self._empty_response()
            
        clean_text = self._preprocess(text)
        
        # 1. Sentiment
        sentiment_res = self.sentiment_engine.analyze(clean_text)
        
        # 2. Risk
        risk_res = self.risk_engine.calculate_risk(clean_text, sentiment_res["polarity"])
        
        # 3. Safety Escalation Override
        # If Risk >= HIGH, skip correlation analysis and trend detection for safety focus.
        if risk_res["risk_flag"]:
            return {
                "emotion": sentiment_res["emotion"],
                "polarity": sentiment_res["polarity"],
                "confidence_score": sentiment_res["confidence_score"],
                "risk_score": risk_res["risk_score"],
                "risk_level": risk_res["risk_level"],
                "risk_flag": risk_res["risk_flag"],
                "trend": "N/A (Priority Evaluation)",
                "ai_message": self.message_engine.get_message(sentiment_res["emotion"], risk_res["risk_level"]),
                "insights": ["Insights suspended due to high risk priority."]
            }
        
        # 4. Insights & Trends (Normal flow)
        insight_res = self.insight_engine.get_correlations_and_trends(history)
        
        # 5. Message
        ai_message = self.message_engine.get_message(sentiment_res["emotion"], risk_res["risk_level"])
        
        # Combine everything
        return {
            "emotion": sentiment_res["emotion"],
            "polarity": sentiment_res["polarity"],
            "confidence_score": sentiment_res["confidence_score"],
            "risk_score": risk_res["risk_score"],
            "risk_level": risk_res["risk_level"],
            "risk_flag": risk_res["risk_flag"],
            "trend": insight_res["trend"],
            "ai_message": ai_message,
            "insights": insight_res["insights"]
        }

    def _empty_response(self):
        return {
            "emotion": "Neutral",
            "polarity": 0.0,
            "confidence_score": 0.0,
            "risk_score": 0,
            "risk_level": "LOW",
            "risk_flag": False,
            "trend": "stable",
            "ai_message": MESSAGES["Neutral"],
            "insights": []
        }

if __name__ == "__main__":
    # Quick test
    analyzer = MindMeshAnalyzer()
    
    # Sample history
    history_data = [
        {"polarity": -0.2, "exercise_minutes": 0, "medication_taken": 0},
        {"polarity": 0.1, "exercise_minutes": 20, "medication_taken": 1},
        {"polarity": 0.4, "exercise_minutes": 40, "medication_taken": 1},
    ]
    
    test_text = "I feel quite sad and hopeless today. I haven't been sleeping well."
    result = analyzer.analyze_journal(test_text, history_data)
    
    import json
    print(json.dumps(result, indent=2))
