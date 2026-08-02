import { describe, it, expect } from "vitest";
import { mindMeshAnalyzer } from "../lib/ai-engine";

describe("MindMeshAnalyzer", () => {
    describe("Sentiment Analysis", () => {
        it("should identify joy in positive sentences", () => {
            const result = mindMeshAnalyzer.analyze_journal("I am so happy and excited today, it was amazing!");
            expect(result.emotion).toBe("Joy");
            expect(result.polarity).toBeGreaterThan(0.1);
        });

        it("should identify sadness in negative sentences", () => {
            const result = mindMeshAnalyzer.analyze_journal("I feel so sad and depressed, everything is terrible.");
            expect(result.emotion).toBe("Sad");
            expect(result.polarity).toBeLessThan(-0.5);
        });

        it("should identify anxiety", () => {
            const result = mindMeshAnalyzer.analyze_journal("I am feeling very anxious and worried about the future.");
            expect(result.emotion).toBe("Anxious");
            expect(result.polarity).toBeLessThan(-0.05);
        });

        it("should be neutral for neutral text", () => {
            const result = mindMeshAnalyzer.analyze_journal("I went to the store and bought some milk.");
            expect(result.emotion).toBe("Neutral");
        });
    });

    describe("Risk Detection", () => {
        it("should flag HIGH risk for suicidal ideation", () => {
            const result = mindMeshAnalyzer.analyze_journal("I want to end my life, I have nothing to live for.");
            // score: 2 high risk phrases = 8.0 -> HIGH
            expect(result.risk_level).toBe("HIGH");
            expect(result.risk_flag).toBe(true);
        });

        it("should flag CRITICAL risk for extremely high risk phrases", () => {
            const result = mindMeshAnalyzer.analyze_journal("suicide suicide suicide");
            expect(result.risk_level).toBe("CRITICAL");
            expect(result.risk_score).toBe(10.0);
        });

        it("should flag HIGH risk for combined distress phrases and negative polarity", () => {
            const result = mindMeshAnalyzer.analyze_journal("Everything is dark and I feel hopeless.");
            // 2 med phrases (4.0) + negative polarity (~2.7) = 6.7 -> HIGH
            expect(result.risk_level).toBe("HIGH");
            expect(result.risk_flag).toBe(true);
        });

        it("should flag LOW risk for normal emotional expressions", () => {
            const result = mindMeshAnalyzer.analyze_journal("I'm having a bad day and I'm a bit sad.");
            expect(result.risk_level).toBe("LOW");
        });
    });
});
