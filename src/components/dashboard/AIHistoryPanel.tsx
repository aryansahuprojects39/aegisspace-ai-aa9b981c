import { motion, AnimatePresence } from "framer-motion";
import { History, CheckCircle, AlertTriangle, XCircle, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { useState } from "react";
import type { AIAnalysis } from "./AIAnalysisPanel";

export interface HistoryEntry {
  id: string;
  timestamp: string;
  analysis: AIAnalysis;
}

interface AIHistoryPanelProps {
  history: HistoryEntry[];
  onClear?: () => void;
}

const STATUS_META = {
  nominal: {
    icon: CheckCircle,
    color: "text-primary",
    bg: "bg-primary/10 border-primary/20",
    dot: "bg-primary",
    label: "Nominal",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-yellow-400",
    bg: "bg-yellow-400/10 border-yellow-400/20",
    dot: "bg-yellow-400",
    label: "Warning",
  },
  critical: {
    icon: XCircle,
    color: "text-destructive",
    bg: "bg-destructive/10 border-destructive/20",
    dot: "bg-destructive",
    label: "Critical",
  },
};

const HistoryItem = ({ entry, index }: { entry: HistoryEntry; index: number }) => {
  const [expanded, setExpanded] = useState(false);
  const meta = STATUS_META[entry.analysis.status];
  const Icon = meta.icon;
  const time = new Date(entry.timestamp);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
      className={`rounded-xl border ${meta.bg} overflow-hidden`}
    >
      {/* Row header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:brightness-110 transition-all"
      >
        {/* Status dot */}
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${meta.dot}`} />

        {/* Icon */}
        <Icon className={`w-3.5 h-3.5 shrink-0 ${meta.color}`} />

        {/* Label + summary */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-semibold ${meta.color}`}>{meta.label}</span>
            {entry.analysis.risks.length > 0 && (
              <span className="text-[9px] text-muted-foreground/60 font-mono">
                {entry.analysis.risks.length} risk{entry.analysis.risks.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground/80 truncate">{entry.analysis.summary}</p>
        </div>

        {/* Timestamp */}
        <div className="text-right shrink-0">
          <div className="text-[9px] text-muted-foreground/60 font-mono">
            {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </div>
          <div className="text-[9px] text-muted-foreground/40 font-mono">
            {time.toLocaleDateString([], { month: "short", day: "numeric" })}
          </div>
        </div>

        {/* Expand toggle */}
        {expanded ? (
          <ChevronUp className="w-3 h-3 text-muted-foreground/40 shrink-0" />
        ) : (
          <ChevronDown className="w-3 h-3 text-muted-foreground/40 shrink-0" />
        )}
      </button>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-2 border-t border-white/5 pt-2">
              <div>
                <div className="text-[9px] text-muted-foreground/60 mb-0.5">Details</div>
                <div className="text-[10px] text-foreground/80 leading-relaxed">{entry.analysis.details}</div>
              </div>

              {entry.analysis.risks.length > 0 && (
                <div>
                  <div className="text-[9px] text-muted-foreground/60 mb-1">Risks</div>
                  <ul className="space-y-0.5">
                    {entry.analysis.risks.map((risk, i) => (
                      <li key={i} className="text-[10px] text-destructive flex items-start gap-1">
                        <span className="shrink-0">•</span>
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <div className="text-[9px] text-muted-foreground/60 mb-0.5">Recommendation</div>
                <div className={`text-[10px] ${meta.color}`}>{entry.analysis.recommendation}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const AIHistoryPanel = ({ history, onClear }: AIHistoryPanelProps) => {
  // Stats for the summary bar
  const counts = history.reduce(
    (acc, e) => {
      acc[e.analysis.status]++;
      return acc;
    },
    { nominal: 0, warning: 0, critical: 0 }
  );

  return (
    <div className="glass rounded-2xl p-4 card-tilt h-full flex flex-col" style={{ maxHeight: '420px', minHeight: '260px' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-primary" />
          <span className="text-sm font-heading font-semibold text-foreground">Analysis History</span>
          <span className="text-[9px] font-mono text-muted-foreground/50 bg-muted/30 px-1.5 py-0.5 rounded">
            {history.length}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Mini stats */}
          {history.length > 0 && (
            <div className="flex items-center gap-2 text-[9px] font-mono">
              {counts.nominal > 0 && (
                <span className="flex items-center gap-1 text-primary">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                  {counts.nominal}
                </span>
              )}
              {counts.warning > 0 && (
                <span className="flex items-center gap-1 text-yellow-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block" />
                  {counts.warning}
                </span>
              )}
              {counts.critical > 0 && (
                <span className="flex items-center gap-1 text-destructive">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive inline-block" />
                  {counts.critical}
                </span>
              )}
            </div>
          )}
          {onClear && history.length > 0 && (
            <button
              onClick={onClear}
              className="text-muted-foreground/40 hover:text-destructive transition-colors"
              title="Clear history"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Timeline bar */}
      {history.length > 1 && (
        <div className="flex h-1 rounded-full overflow-hidden mb-3 gap-px">
          {history.slice().reverse().map((e) => (
            <div
              key={e.id}
              className={`flex-1 rounded-full ${
                e.analysis.status === "critical"
                  ? "bg-destructive"
                  : e.analysis.status === "warning"
                    ? "bg-yellow-400"
                    : "bg-primary"
              }`}
              title={`${e.analysis.status} at ${new Date(e.timestamp).toLocaleTimeString()}`}
            />
          ))}
        </div>
      )}

      {/* Entry list */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-web" style={{ maxHeight: '320px' }}>
        {history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 border border-dashed border-border/30 rounded-xl">
            <History className="w-8 h-8 text-muted-foreground/20" />
            <span className="text-xs text-muted-foreground/40 text-center px-4">
              History will appear here as AI analysis runs automatically
            </span>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {history.map((entry, i) => (
              <HistoryItem key={entry.id} entry={entry} index={i} />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default AIHistoryPanel;