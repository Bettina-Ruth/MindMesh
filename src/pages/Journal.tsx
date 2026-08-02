import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookHeart, Send, AlertTriangle, Sparkles, TrendingUp, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import MoodBadge from '@/components/MoodBadge';
import { getJournals, addJournal, generateId, JournalEntry } from '@/lib/storage';
import { mindMeshAnalyzer, AIAnalysisResult } from '@/lib/ai-engine';
import { format, parseISO } from 'date-fns';

export default function Journal() {
  const [content, setContent] = useState('');
  const [entries, setEntries] = useState<JournalEntry[]>(getJournals());
  const [lastAnalysis, setLastAnalysis] = useState<AIAnalysisResult | null>(null);

  const handleSubmit = () => {
    if (!content.trim()) return;

    // Use the new AI engine
    const analysis = mindMeshAnalyzer.analyze_journal(content, entries);

    const entry: JournalEntry = {
      id: generateId(),
      content: content.trim(),
      sentimentScore: analysis.polarity,
      emotionLabel: analysis.emotion,
      riskFlag: analysis.risk_flag,
      createdAt: new Date().toISOString(),
    };

    addJournal(entry);
    setEntries([entry, ...entries]);
    setLastAnalysis(analysis);
    setContent('');
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-2">
          <BookHeart className="w-8 h-8 text-accent" />
          Mindful Journal
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your safe space for expression. Powered by AI to understand your emotional journey.
        </p>
      </motion.div>

      {/* New entry input */}
      <div className="bg-card/50 backdrop-blur-sm border rounded-2xl p-6 card-shadow space-y-4">
        <Textarea
          placeholder="How are you truly feeling right now?"
          value={content}
          onChange={e => setContent(e.target.value)}
          className="min-h-[140px] resize-none border-input bg-background/50 focus-visible:ring-primary text-base leading-relaxed"
        />
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <AnimatePresence>
              {lastAnalysis && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <MoodBadge score={lastAnalysis.polarity} emotion={lastAnalysis.emotion} riskFlag={lastAnalysis.risk_flag} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!content.trim()}
            className="gap-2 rounded-full px-6 gradient-primary hover:opacity-90 transition-all shadow-lg shadow-primary/20"
          >
            <Send className="w-4 h-4" />
            Analyze & Save
          </Button>
        </div>

        {/* AI Insight Box */}
        <AnimatePresence>
          {lastAnalysis && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-3">
                <div className="flex items-center gap-2 text-primary font-medium text-sm">
                  <Sparkles className="w-4 h-4" />
                  AI Analysis
                </div>
                <p className="text-sm text-foreground/90 italic">"{lastAnalysis.ai_message}"</p>

                {lastAnalysis.insights.length > 0 && (
                  <div className="pt-2 border-t border-primary/10">
                    {lastAnalysis.insights.map((insight, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        <span>{insight}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4 pt-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Trend: <span className="text-foreground capitalize font-medium">{lastAnalysis.trend}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Confidence: <span className="text-foreground font-medium">{Math.round(lastAnalysis.confidence_score * 100)}%</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {lastAnalysis?.risk_flag && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 text-destructive text-sm border border-destructive/20"
          >
            <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="font-semibold text-destructive">Support is available</p>
              <p>
                If you're struggling, please reach out. <strong>988 Suicide & Crisis Lifeline:</strong> call or text 988.
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Entries List */}
      <div className="space-y-4 pt-4">
        <h2 className="text-xl font-display font-semibold px-1">Recent Entries</h2>
        <div className="space-y-3">
          {entries.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group bg-card hover:bg-card/80 transition-colors rounded-xl p-5 border card-shadow"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground font-medium">
                    {format(parseISO(entry.createdAt), 'EEEE, MMMM do')}
                  </p>
                  <p className="text-[10px] text-muted-foreground/70">
                    {format(parseISO(entry.createdAt), 'h:mm a')}
                  </p>
                </div>
                <MoodBadge score={entry.sentimentScore} emotion={entry.emotionLabel} riskFlag={entry.riskFlag} />
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed group-hover:text-foreground transition-colors">
                {entry.content}
              </p>
            </motion.div>
          ))}
          {entries.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 px-6 rounded-2xl border-2 border-dashed border-muted"
            >
              <p className="text-muted-foreground text-sm font-medium">Your mindful journey starts here.</p>
              <p className="text-muted-foreground/60 text-xs mt-1">Write your first journal entry above.</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
