import { useState } from 'react';
import { ShieldCheck, Info, AlertTriangle, OctagonAlert, ChevronDown, ChevronUp } from 'lucide-react';
import {
  RISK_LEVEL_LABELS,
  countRisks,
  type RiskAssessment,
  type RiskLevel
} from '../../shared/risk-analysis';

const RISK_ICONS: Record<RiskLevel, typeof Info> = {
  none: ShieldCheck,
  low: Info,
  medium: AlertTriangle,
  high: OctagonAlert
};

export function RiskBadge({ level }: { level: RiskLevel }) {
  const Icon = RISK_ICONS[level];
  return (
    <span className={`risk-badge risk-${level}`}>
      <Icon size={10} /> {RISK_LEVEL_LABELS[level]}
    </span>
  );
}

/**
 * RF17 — Brief, user-facing explanation of whether a collected item represents a risk.
 * The summary is always visible; supporting reasons and recommendations are expandable.
 */
export function RiskNote({ assessment, title }: { assessment: RiskAssessment; title?: string }) {
  const [open, setOpen] = useState(false);
  const hasDetails = assessment.reasons.length > 0 || !!assessment.recommendation;

  return (
    <div className={`risk-note risk-${assessment.level}`}>
      <div className="risk-note-header">
        <RiskBadge level={assessment.level} />
        <span className="risk-summary">
          {title && <strong>{title}: </strong>}
          {assessment.summary}
        </span>
      </div>
      {hasDetails && (
        <>
          <button type="button" className="risk-toggle" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
            {open ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            {open ? 'Ocultar detalhes' : 'Por que?'}
          </button>
          {open && (
            <div className="risk-details">
              {assessment.reasons.length > 0 && (
                <ul>
                  {assessment.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              )}
              {assessment.recommendation && (
                <p>
                  <strong>O que fazer:</strong> {assessment.recommendation}
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/** Compact counter of risk levels for a group of assessments (section header). */
export function RiskSummaryBar({ assessments }: { assessments: RiskAssessment[] }) {
  if (assessments.length === 0) return null;
  const counts = countRisks(assessments);
  const levels: RiskLevel[] = ['high', 'medium', 'low', 'none'];
  return (
    <div className="risk-summary-bar">
      <span className="risk-summary-bar-label">Avaliação de risco:</span>
      {levels
        .filter((l) => counts[l] > 0)
        .map((l) => (
          <span key={l} className={`risk-badge risk-${l}`}>
            {counts[l]} · {RISK_LEVEL_LABELS[l]}
          </span>
        ))}
    </div>
  );
}
