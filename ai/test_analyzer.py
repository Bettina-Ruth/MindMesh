import pytest
from analyzer import MindMeshAnalyzer

@pytest.fixture
def analyzer():
    return MindMeshAnalyzer()

def test_empty_entry(analyzer):
    result = analyzer.analyze_journal("")
    assert result["emotion"] == "Neutral"
    assert result["risk_level"] == "LOW"

def test_positive_entry(analyzer):
    text = "Today was a wonderful day! I feel so happy and energetic."
    result = analyzer.analyze_journal(text)
    assert result["polarity"] > 0.5
    assert result["emotion"] == "Joy"
    assert result["risk_level"] == "LOW"

def test_high_risk_entry(analyzer):
    text = "I feel like I want to die. Everything is hopeless and I might end my life."
    result = analyzer.analyze_journal(text)
    # 2 phrases (die, end my life) = 8 points. Intensity factor? No ALL CAPS.
    # neg polarity multiplier? abs(-0.8) * 3 = 2.4. Total ~10.4 -> clamped to 10.
    assert result["risk_score"] >= 9
    assert result["risk_level"] == "CRITICAL"
    assert result["risk_flag"] is True
    assert "urgent" in result["ai_message"].lower()
    # Safety Override Check
    assert result["trend"] == "N/A (Priority Evaluation)"
    assert "Insights suspended" in result["insights"][0]

def test_sarcasm_and_intensity(analyzer):
    text = "I AM SO HAPPY RIGHT NOW!!!"
    result = analyzer.analyze_journal(text)
    assert result["polarity"] > 0.7
    assert result["confidence_score"] > 0.8

def test_correlation_logic(analyzer):
    # Need n >= 5 now
    history = [
        {"polarity": -0.5, "exercise_minutes": 10, "medication_taken": 0},
        {"polarity": -0.4, "exercise_minutes": 15, "medication_taken": 0},
        {"polarity": 0.1, "exercise_minutes": 20, "medication_taken": 1},
        {"polarity": 0.5, "exercise_minutes": 30, "medication_taken": 1},
        {"polarity": 0.6, "exercise_minutes": 45, "medication_taken": 1},
    ]
    text = "Feeling better today."
    result = analyzer.analyze_journal(text, history)
    
    # Fixed grammar check: "tends to improve"
    assert any("exercise" in i and "tends to improve" in i for i in result["insights"])
    assert any("medication" in i and "tends to improve" in i for i in result["insights"])

def test_trend_detection(analyzer):
    # Declining trend (n >= 5 requirement)
    history = [
        {"polarity": 0.5},
        {"polarity": 0.3},
        {"polarity": 0.1},
        {"polarity": -0.1},
        {"polarity": -0.3},
    ]
    result = analyzer.analyze_journal("Still down.", history)
    assert result["trend"] == "declining"

def test_mixed_emotions(analyzer):
    text = "I am happy about my job but very sad about my breakup."
    result = analyzer.analyze_journal(text)
    # VADER weights "very sad" strongly, so we expect a negative-leaning polarity
    assert result["polarity"] < 0
    assert result["emotion"] in ["Sad", "Neutral"]
