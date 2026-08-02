from analyzer import MindMeshAnalyzer

analyzer = MindMeshAnalyzer()

# Simple test
result = analyzer.analyze_journal(
    "Everything feels pointless",
    history=None
)

print(result)