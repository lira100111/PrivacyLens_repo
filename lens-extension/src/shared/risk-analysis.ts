/**
 * RF17 — Explicação de risco dos eventos coletados.
 *
 * Heurísticas puras (sem efeitos colaterais) que traduzem as evidências técnicas
 * coletadas (consentimento, cookies, storage, rede, cabeçalhos de segurança e
 * eventos da cadeia) em uma explicação breve, em linguagem acessível, indicando
 * se o item observado representa risco à segurança ou à privacidade do usuário.
 *
 * As avaliações são derivadas em tempo de exibição e NÃO são gravadas na cadeia
 * de evidências: a cadeia guarda apenas fatos observáveis, enquanto este módulo
 * produz interpretações técnicas (separação fato × interpretação da metodologia).
 * A classificação é heurística e não constitui parecer jurídico.
 */
import type {
  AuditSession,
  ConsentChoice,
  ConsentEvidence,
  CookieEvidence,
  EvidenceEvent,
  NetworkEvidence,
  SecurityHeadersEvidence,
  StorageEvidence
} from './types';

// ---------------------------------------------------------------------------
// Public model
// ---------------------------------------------------------------------------

export type RiskLevel = 'none' | 'low' | 'medium' | 'high';

export interface RiskAssessment {
  level: RiskLevel;
  /** Short sentence always displayed to the user. */
  summary: string;
  /** Additional facts/interpretations supporting the classification. */
  reasons: string[];
  /** Optional guidance on what the user (or site owner) can do. */
  recommendation?: string;
}

export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  none: 'Sem risco',
  low: 'Risco baixo',
  medium: 'Risco médio',
  high: 'Risco alto'
};

const RISK_WEIGHT: Record<RiskLevel, number> = { none: 0, low: 1, medium: 2, high: 3 };

export function maxRiskLevel(levels: RiskLevel[]): RiskLevel {
  return levels.reduce<RiskLevel>((acc, l) => (RISK_WEIGHT[l] > RISK_WEIGHT[acc] ? l : acc), 'none');
}

export function compareRisk(a: RiskAssessment, b: RiskAssessment): number {
  return RISK_WEIGHT[b.level] - RISK_WEIGHT[a.level];
}

export interface RiskCounts {
  none: number;
  low: number;
  medium: number;
  high: number;
  total: number;
  level: RiskLevel;
}

export function countRisks(assessments: RiskAssessment[]): RiskCounts {
  const counts: RiskCounts = { none: 0, low: 0, medium: 0, high: 0, total: assessments.length, level: 'none' };
  for (const a of assessments) counts[a.level]++;
  counts.level = maxRiskLevel(assessments.map((a) => a.level));
  return counts;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

interface Finding {
  level: RiskLevel;
  text: string;
  recommendation?: string;
}

/** Builds an assessment where the most severe finding becomes the summary. */
function buildAssessment(findings: Finding[], fallback: Finding): RiskAssessment {
  if (findings.length === 0) {
    return { level: fallback.level, summary: fallback.text, reasons: [], recommendation: fallback.recommendation };
  }
  const sorted = [...findings].sort((a, b) => RISK_WEIGHT[b.level] - RISK_WEIGHT[a.level]);
  const top = sorted[0];
  const recommendation = sorted.find((f) => f.recommendation)?.recommendation;
  return {
    level: top.level,
    summary: top.text,
    reasons: sorted.slice(1).map((f) => f.text),
    recommendation
  };
}

const MULTI_PART_TLDS = new Set(['com', 'co', 'org', 'net', 'gov', 'edu', 'ac', 'gob', 'mil']);

function normalizeHost(host: string): string {
  return host.replace(/^\./, '').toLowerCase();
}

/** Approximate registrable domain (eTLD+1) without a public suffix list. */
function baseDomain(host: string): string {
  const labels = normalizeHost(host).split('.').filter(Boolean);
  if (labels.length <= 2) return labels.join('.');
  const sld = labels[labels.length - 2];
  const tld = labels[labels.length - 1];
  const take = tld.length === 2 && MULTI_PART_TLDS.has(sld) ? 3 : 2;
  return labels.slice(-take).join('.');
}

function hostMatches(host: string, pattern: string): boolean {
  const h = normalizeHost(host);
  return h === pattern || h.endsWith(`.${pattern}`);
}

export function isSameSiteHost(host: string, targetDomain: string): boolean {
  if (!host || !targetDomain) return true;
  return baseDomain(host) === baseDomain(targetDomain);
}

function toTime(iso?: string): number {
  const t = iso ? Date.parse(iso) : NaN;
  return Number.isNaN(t) ? Date.now() : t;
}

function asString(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined;
}

function asBoolean(v: unknown): boolean {
  return v === true;
}

function asNumber(v: unknown): number | undefined {
  return typeof v === 'number' && Number.isFinite(v) ? v : undefined;
}

function plural(n: number, singular: string, pluralForm: string): string {
  return `${n} ${n === 1 ? singular : pluralForm}`;
}

// ---------------------------------------------------------------------------
// Knowledge base: trackers, CDNs and sensitive identifiers
// ---------------------------------------------------------------------------

type TrackerCategory = 'analytics' | 'advertising' | 'session_replay' | 'social';

const TRACKER_CATEGORY_LABELS: Record<TrackerCategory, string> = {
  analytics: 'analytics: análise de comportamento',
  advertising: 'publicidade e rastreamento entre sites',
  session_replay: 'gravação de sessão: registra cliques, rolagem e digitação',
  social: 'rede social: vincula a visita ao seu perfil'
};

interface TrackerSignature {
  name: string;
  category: TrackerCategory;
}

const TRACKER_DOMAINS: Array<TrackerSignature & { domain: string }> = [
  { domain: 'google-analytics.com', name: 'Google Analytics', category: 'analytics' },
  { domain: 'analytics.google.com', name: 'Google Analytics', category: 'analytics' },
  { domain: 'googletagmanager.com', name: 'Google Tag Manager', category: 'analytics' },
  { domain: 'doubleclick.net', name: 'Google DoubleClick', category: 'advertising' },
  { domain: 'googlesyndication.com', name: 'Google AdSense', category: 'advertising' },
  { domain: 'googleadservices.com', name: 'Google Ads', category: 'advertising' },
  { domain: 'adservice.google.com', name: 'Google Ads', category: 'advertising' },
  { domain: 'facebook.net', name: 'Meta Pixel', category: 'advertising' },
  { domain: 'facebook.com', name: 'Meta (Facebook)', category: 'social' },
  { domain: 'instagram.com', name: 'Instagram', category: 'social' },
  { domain: 'hotjar.com', name: 'Hotjar', category: 'session_replay' },
  { domain: 'hotjar.io', name: 'Hotjar', category: 'session_replay' },
  { domain: 'clarity.ms', name: 'Microsoft Clarity', category: 'session_replay' },
  { domain: 'mouseflow.com', name: 'Mouseflow', category: 'session_replay' },
  { domain: 'fullstory.com', name: 'FullStory', category: 'session_replay' },
  { domain: 'smartlook.com', name: 'Smartlook', category: 'session_replay' },
  { domain: 'mc.yandex.ru', name: 'Yandex Metrica', category: 'session_replay' },
  { domain: 'bat.bing.com', name: 'Microsoft Ads', category: 'advertising' },
  { domain: 'analytics.tiktok.com', name: 'TikTok Pixel', category: 'advertising' },
  { domain: 'tiktok.com', name: 'TikTok', category: 'social' },
  { domain: 'ads.linkedin.com', name: 'LinkedIn Insight', category: 'advertising' },
  { domain: 'px.ads.linkedin.com', name: 'LinkedIn Insight', category: 'advertising' },
  { domain: 'snap.licdn.com', name: 'LinkedIn Insight', category: 'advertising' },
  { domain: 'ads-twitter.com', name: 'X (Twitter) Ads', category: 'advertising' },
  { domain: 'ct.pinterest.com', name: 'Pinterest Tag', category: 'advertising' },
  { domain: 'sc-static.net', name: 'Snap Pixel', category: 'advertising' },
  { domain: 'criteo.com', name: 'Criteo', category: 'advertising' },
  { domain: 'criteo.net', name: 'Criteo', category: 'advertising' },
  { domain: 'taboola.com', name: 'Taboola', category: 'advertising' },
  { domain: 'outbrain.com', name: 'Outbrain', category: 'advertising' },
  { domain: 'adnxs.com', name: 'Xandr (AppNexus)', category: 'advertising' },
  { domain: 'rubiconproject.com', name: 'Magnite (Rubicon)', category: 'advertising' },
  { domain: 'pubmatic.com', name: 'PubMatic', category: 'advertising' },
  { domain: 'openx.net', name: 'OpenX', category: 'advertising' },
  { domain: 'scorecardresearch.com', name: 'Comscore', category: 'analytics' },
  { domain: 'quantserve.com', name: 'Quantcast', category: 'advertising' },
  { domain: 'segment.io', name: 'Segment', category: 'analytics' },
  { domain: 'segment.com', name: 'Segment', category: 'analytics' },
  { domain: 'mixpanel.com', name: 'Mixpanel', category: 'analytics' },
  { domain: 'amplitude.com', name: 'Amplitude', category: 'analytics' },
  { domain: 'hs-analytics.net', name: 'HubSpot Analytics', category: 'analytics' },
  { domain: 'hubspot.com', name: 'HubSpot', category: 'analytics' }
];

const CDN_DOMAINS = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'gstatic.com',
  'ajax.googleapis.com',
  'cdnjs.cloudflare.com',
  'cdn.jsdelivr.net',
  'unpkg.com',
  'cloudfront.net',
  'akamaihd.net',
  'akamaized.net',
  'fastly.net',
  'bootstrapcdn.com',
  'code.jquery.com'
];

const TRACKER_COOKIES: Array<TrackerSignature & { pattern: RegExp }> = [
  { pattern: /^(_ga($|_)|_gid$|_gat|__utm[a-z]$)/, name: 'Google Analytics', category: 'analytics' },
  { pattern: /^(_gcl_|IDE$|DSID$|test_cookie$|__gads$|__gpi$|NID$)/, name: 'Google Ads', category: 'advertising' },
  { pattern: /^(_fbp|_fbc|fr)$/, name: 'Meta Pixel', category: 'advertising' },
  { pattern: /^_hj/, name: 'Hotjar', category: 'session_replay' },
  { pattern: /^(_clck|_clsk|CLID)$/, name: 'Microsoft Clarity', category: 'session_replay' },
  { pattern: /^(_uet|MUID$)/, name: 'Microsoft Ads', category: 'advertising' },
  { pattern: /^(_ttp$|_tt_)/, name: 'TikTok Pixel', category: 'advertising' },
  { pattern: /^(li_|bcookie$|lidc$|UserMatchHistory$|AnalyticsSyncHistory$)/, name: 'LinkedIn', category: 'advertising' },
  { pattern: /^(_pin_unauth|_pinterest)/, name: 'Pinterest', category: 'advertising' },
  { pattern: /^(_scid|_sctr)/, name: 'Snap Pixel', category: 'advertising' },
  { pattern: /^cto_/, name: 'Criteo', category: 'advertising' },
  { pattern: /^(_ym_|yandexuid$)/, name: 'Yandex Metrica', category: 'session_replay' },
  { pattern: /^ajs_/, name: 'Segment', category: 'analytics' },
  { pattern: /^mp_/, name: 'Mixpanel', category: 'analytics' },
  { pattern: /^amp_/, name: 'Amplitude', category: 'analytics' },
  { pattern: /^(hubspotutk$|__hs)/, name: 'HubSpot', category: 'analytics' },
  { pattern: /^_mkto_trk$/, name: 'Marketo', category: 'advertising' },
  { pattern: /^_pk_/, name: 'Matomo', category: 'analytics' }
];

const TRACKER_STORAGE_KEY = /^(_ga|_hj|amp_|amplitude|mp_|mixpanel|ajs_|_fbp|_ttp|_uet|_clck|_clsk|__anon_id|optimizely|_pk_|_gcl)/i;
const SENSITIVE_COOKIE_NAME = /(sess|token|auth|jwt|login|remember|(^|[_\-.])s?sid($|[_\-.]))/i;
const ANTI_CSRF_NAME = /(csrf|xsrf)/i;
const SENSITIVE_STORAGE_KEY = /(token|jwt|auth|password|passwd|secret|api[_-]?key|credential|refresh|access[_-]?key)/i;
const PII_STORAGE_KEY = /(e-?mail|cpf|cnpj|phone|telefone|celular|address|endereco|birth|nascimento|user[_-]?(id|name|data|info)|profile)/i;
const CONSENT_STORAGE_KEY = /(consent|cookie|gdpr|lgpd|cmp|euconsent|optanon|didomi|cookiebot|usercentrics)/i;
const PII_QUERY_PARAM = /^(e-?mail|mail|cpf|cnpj|phone|tel|telefone|celular|name|nome|first_?name|last_?name|full_?name|address|endereco|cep|zip|birth(date)?|dob)$/i;
const ID_QUERY_PARAM = /^(uid|user_?id|userid|cid|client_?id|visitor_?id|device_?id|fbp|_fbp|gclid|fbclid|ttclid|msclkid)$/i;
const EMAIL_VALUE = /[^\s@]+@[^\s@]+\.[a-z]{2,}/i;

function matchTrackerDomain(host: string): TrackerSignature | undefined {
  return TRACKER_DOMAINS.find((t) => hostMatches(host, t.domain));
}

function matchTrackerCookie(name: string): TrackerSignature | undefined {
  return TRACKER_COOKIES.find((t) => t.pattern.test(name));
}

function isCdnHost(host: string): boolean {
  return CDN_DOMAINS.some((d) => hostMatches(host, d));
}

// ---------------------------------------------------------------------------
// Consent timeline helpers
// ---------------------------------------------------------------------------

const CONSENT_DECISIONS: ConsentChoice[] = ['ACCEPTED_ALL', 'REJECTED_ALL', 'CUSTOMIZED'];

function isDecision(choice: ConsentChoice): boolean {
  return CONSENT_DECISIONS.includes(choice);
}

/** Returns the last consent decision taken at or before `iso`, or null if none. */
export function consentDecisionAt(consentEvents: ConsentEvidence[], iso?: string): ConsentChoice | null {
  const t = toTime(iso);
  let decision: ConsentChoice | null = null;
  let decisionTime = -Infinity;
  for (const ev of consentEvents) {
    const evTime = toTime(ev.timestamp);
    if (isDecision(ev.actionTaken) && evTime <= t && evTime >= decisionTime) {
      decision = ev.actionTaken;
      decisionTime = evTime;
    }
  }
  return decision;
}

function consentContextFinding(
  tracker: TrackerSignature,
  decision: ConsentChoice | null,
  subject: string,
  preExisting = false
): Finding {
  const category = TRACKER_CATEGORY_LABELS[tracker.category];
  const revoke = 'Você pode recusar ou revogar o consentimento a qualquer momento (LGPD, art. 8º, §5º) e limpar os cookies deste site.';
  if (decision === null) {
    if (preExisting) {
      return {
        level: 'medium',
        text: `${subject} de ${tracker.name} (${category}) já existia ao iniciar a auditoria, antes de qualquer escolha nesta sessão. Se você não aceitou cookies em visita anterior, isso indica rastreamento sem consentimento.`,
        recommendation: revoke
      };
    }
    return {
      level: 'high',
      text: `${subject} de ${tracker.name} (${category}) ativado antes da sua escolha de consentimento — possível tratamento de dados sem base legal (LGPD).`,
      recommendation: 'Evite interagir com o site até decidir sobre os cookies; recuse os não essenciais e limpe os cookies deste site.'
    };
  }
  if (decision === 'REJECTED_ALL') {
    return {
      level: 'high',
      text: `${subject} de ${tracker.name} (${category}) observado após você recusar cookies não essenciais — sua escolha pode não estar sendo respeitada.`,
      recommendation: 'Limpe os cookies deste site e, se persistir, registre a evidência exportada junto ao encarregado (DPO) ou à ANPD.'
    };
  }
  if (decision === 'CUSTOMIZED') {
    return {
      level: 'medium',
      text: `${subject} de ${tracker.name} (${category}) ativo após você personalizar as preferências. Confirme se essa categoria foi autorizada.`,
      recommendation: revoke
    };
  }
  return {
    level: 'medium',
    text: `${subject} de ${tracker.name} (${category}): monitora sua navegação e pode compartilhá-la com terceiros. Foi autorizado pelo seu aceite.`,
    recommendation: revoke
  };
}

// ---------------------------------------------------------------------------
// Cookies
// ---------------------------------------------------------------------------

export type CookieLike = Pick<CookieEvidence, 'name' | 'domain' | 'secure' | 'httpOnly' | 'sameSite'> &
  Partial<Pick<CookieEvidence, 'session' | 'expirationDate' | 'firstObservedAt' | 'sourceContext'>>;

export interface AssessmentContext {
  targetDomain: string;
  consentEvents: ConsentEvidence[];
  auditStartedAt?: string;
}

/** Cookies captured by the initial snapshot are stamped right after the audit starts. */
const SNAPSHOT_WINDOW_MS = 3000;

export function assessCookie(cookie: CookieLike, ctx: AssessmentContext): RiskAssessment {
  const findings: Finding[] = [];
  const tracker = matchTrackerCookie(cookie.name);
  const sensitive = SENSITIVE_COOKIE_NAME.test(cookie.name) && !ANTI_CSRF_NAME.test(cookie.name) && !tracker;
  const decision = consentDecisionAt(ctx.consentEvents, cookie.firstObservedAt);
  const preExisting =
    !!ctx.auditStartedAt &&
    cookie.sourceContext === 'before_consent' &&
    Math.abs(toTime(cookie.firstObservedAt) - toTime(ctx.auditStartedAt)) <= SNAPSHOT_WINDOW_MS;

  if (tracker) {
    findings.push(consentContextFinding(tracker, decision, 'Cookie', preExisting));
  }

  if (!isSameSiteHost(cookie.domain, ctx.targetDomain)) {
    findings.push({
      level: 'medium',
      text: `Cookie de terceiro (${normalizeHost(cookie.domain)}): permite que outra empresa reconheça você em diferentes sites.`
    });
  }

  if (!cookie.secure) {
    findings.push(
      sensitive
        ? {
            level: 'high',
            text: 'Cookie de sessão/autenticação sem o atributo Secure: pode ser interceptado em redes inseguras (ex.: Wi-Fi público), permitindo sequestro da sua conta.',
            recommendation: 'Falha de configuração do site: o responsável deve marcar o cookie como Secure. Evite usar o site em redes públicas.'
          }
        : { level: 'low', text: 'Sem o atributo Secure: o cookie pode ser enviado em conexões HTTP sem criptografia.' }
    );
  }

  if (!cookie.httpOnly && sensitive) {
    findings.push({
      level: 'high',
      text: 'Cookie de sessão/autenticação acessível via JavaScript (sem HttpOnly): pode ser roubado em um ataque XSS.',
      recommendation: 'Falha de configuração do site: o responsável deve marcar o cookie como HttpOnly.'
    });
  }

  if (cookie.sameSite === 'no_restriction') {
    findings.push(
      sensitive
        ? { level: 'medium', text: 'SameSite=None em cookie de sessão: é enviado em requisições vindas de outros sites, facilitando ataques CSRF.' }
        : { level: 'low', text: 'SameSite=None: o cookie pode ser enviado em contextos de terceiros, viabilizando rastreamento entre sites.' }
    );
  } else if (cookie.sameSite === 'unspecified' && sensitive) {
    findings.push({ level: 'low', text: 'SameSite não definido: a proteção contra CSRF depende do padrão do navegador.' });
  }

  if (!cookie.session && cookie.expirationDate) {
    const days = (cookie.expirationDate * 1000 - toTime(cookie.firstObservedAt)) / 86_400_000;
    if (days > 395) {
      findings.push({
        level: 'low',
        text: `Validade longa (~${Math.round(days / 30)} meses): ultrapassa os 13 meses usualmente recomendados para cookies persistentes.`
      });
    }
  }

  return buildAssessment(findings, {
    level: 'none',
    text: sensitive
      ? 'Cookie de sessão com atributos de segurança adequados (Secure/HttpOnly).'
      : 'Cookie funcional sem indícios de rastreamento ou falhas de segurança.'
  });
}

// ---------------------------------------------------------------------------
// Local / session storage
// ---------------------------------------------------------------------------

export function assessStorageItem(item: StorageEvidence): RiskAssessment {
  const findings: Finding[] = [];
  const isLocal = item.type === 'localStorage';

  if (SENSITIVE_STORAGE_KEY.test(item.key)) {
    findings.push({
      level: isLocal ? 'high' : 'medium',
      text: isLocal
        ? 'Possível token/credencial em localStorage: qualquer script da página pode lê-lo (XSS) e ele persiste mesmo após fechar o navegador.'
        : 'Possível token/credencial em sessionStorage: qualquer script da página pode lê-lo (XSS) enquanto a aba estiver aberta.',
      recommendation: 'Faça logout ao terminar de usar o site. Para o responsável: prefira cookies HttpOnly para guardar credenciais.'
    });
  }

  if (PII_STORAGE_KEY.test(item.key)) {
    findings.push({
      level: 'medium',
      text: 'Possível dado pessoal guardado no navegador sem proteção: pode ser lido por scripts de terceiros carregados na página.'
    });
  }

  if (TRACKER_STORAGE_KEY.test(item.key)) {
    findings.push({
      level: 'medium',
      text: 'Identificador de analytics/rastreamento guardado localmente: permite reconhecer você entre visitas, mesmo sem cookies.',
      recommendation: 'Limpe os dados do site nas configurações do navegador para remover o identificador.'
    });
  }

  if (item.sizeBytes > 1_048_576) {
    findings.push({ level: 'low', text: `Item volumoso (${(item.sizeBytes / 1_048_576).toFixed(1)} MB) armazenado no seu dispositivo.` });
  }

  const fallback: Finding = CONSENT_STORAGE_KEY.test(item.key)
    ? { level: 'none', text: 'Registro da sua escolha de consentimento ou preferência de cookies.' }
    : { level: 'none', text: 'Dado técnico do site; nenhum indício de risco identificado.' };

  return buildAssessment(findings, fallback);
}

// ---------------------------------------------------------------------------
// Network requests
// ---------------------------------------------------------------------------

export type NetworkLike = Pick<NetworkEvidence, 'url' | 'domain'> &
  Partial<Pick<NetworkEvidence, 'method' | 'timestamp' | 'isThirdParty' | 'statusCode'>>;

export function assessNetworkRequest(req: NetworkLike, ctx: AssessmentContext): RiskAssessment {
  const findings: Finding[] = [];
  let parsed: URL | null = null;
  try {
    parsed = new URL(req.url);
  } catch {
    parsed = null;
  }

  const host = req.domain || parsed?.hostname || '';
  const isThirdParty = req.isThirdParty ?? !isSameSiteHost(host, ctx.targetDomain);

  if (parsed?.protocol === 'http:' && !/^(localhost|127\.0\.0\.1)$/.test(parsed.hostname)) {
    findings.push({
      level: 'high',
      text: 'Requisição sem criptografia (HTTP): o conteúdo pode ser lido ou alterado por qualquer pessoa na mesma rede.',
      recommendation: 'Evite enviar dados neste site em redes públicas; o responsável deve migrar todos os recursos para HTTPS.'
    });
  }

  if (parsed && isThirdParty) {
    const piiParams: string[] = [];
    const idParams: string[] = [];
    parsed.searchParams.forEach((value, key) => {
      if (PII_QUERY_PARAM.test(key) || EMAIL_VALUE.test(value)) piiParams.push(key);
      else if (ID_QUERY_PARAM.test(key)) idParams.push(key);
    });
    if (piiParams.length > 0) {
      findings.push({
        level: 'high',
        text: `A URL envia possíveis dados pessoais a um terceiro (parâmetros: ${[...new Set(piiParams)].join(', ')}).`,
        recommendation: 'Exporte a evidência: o envio de dados pessoais a terceiros exige base legal e transparência (LGPD, arts. 7º e 9º).'
      });
    }
    if (idParams.length > 0) {
      findings.push({
        level: 'medium',
        text: `A URL carrega identificadores únicos (${[...new Set(idParams)].join(', ')}) que permitem reconhecer você entre visitas e sites.`
      });
    }
  }

  const tracker = matchTrackerDomain(host);
  if (tracker) {
    findings.push(consentContextFinding(tracker, consentDecisionAt(ctx.consentEvents, req.timestamp), 'Serviço'));
  }

  const fallback: Finding = !isThirdParty
    ? { level: 'none', text: 'Requisição ao próprio site auditado; não envolve terceiros.' }
    : isCdnHost(host)
      ? { level: 'low', text: 'Provedor de conteúdo (CDN/fontes): recebe seu IP e a página visitada, mas não tem finalidade de rastreamento conhecida.' }
      : {
          level: 'low',
          text: 'Domínio de terceiro não classificado: recebe seu endereço IP, dados do navegador e, possivelmente, a página visitada.'
        };

  return buildAssessment(findings, fallback);
}

// ---------------------------------------------------------------------------
// Consent
// ---------------------------------------------------------------------------

interface TrackerActivity {
  cookies: string[];
  domains: string[];
}

function trackerActivityBetween(session: AuditSession, from: number, to: number): TrackerActivity {
  const inWindow = (iso: string) => {
    const t = toTime(iso);
    return t >= from && t < to;
  };
  const cookies = Object.values(session.cookies)
    .filter((c) => inWindow(c.firstObservedAt) && matchTrackerCookie(c.name))
    .map((c) => c.name);
  const domains = session.networkRequests
    .filter((r) => inWindow(r.timestamp) && matchTrackerDomain(r.domain))
    .map((r) => r.domain);
  return { cookies: [...new Set(cookies)], domains: [...new Set(domains)] };
}

function describeActivity(a: TrackerActivity): string {
  const parts: string[] = [];
  if (a.cookies.length) parts.push(`${plural(a.cookies.length, 'cookie', 'cookies')} (${a.cookies.slice(0, 3).join(', ')}${a.cookies.length > 3 ? '…' : ''})`);
  if (a.domains.length) parts.push(`${plural(a.domains.length, 'serviço', 'serviços')} (${a.domains.slice(0, 3).join(', ')}${a.domains.length > 3 ? '…' : ''})`);
  return parts.join(' e ');
}

export function assessConsentEvent(ev: ConsentEvidence, session: AuditSession): RiskAssessment {
  const evTime = toTime(ev.timestamp);
  const nextDecision = session.consentEvents
    .map((e) => ({ t: toTime(e.timestamp), a: e.actionTaken }))
    .filter((e) => e.t > evTime && isDecision(e.a))
    .reduce((min, e) => Math.min(min, e.t), Infinity);
  const activity = trackerActivityBetween(session, evTime, nextDecision);
  const hasActivity = activity.cookies.length + activity.domains.length > 0;

  switch (ev.actionTaken) {
    case 'BANNER_DETECTED':
      return {
        level: 'none',
        summary: `Banner de consentimento${ev.cmpName ? ` (${ev.cmpName})` : ''} exibido. O site deve aguardar sua escolha antes de ativar cookies não essenciais.`,
        reasons: [],
        recommendation: 'Leia as opções do banner; recusar cookies não essenciais reduz o rastreamento.'
      };
    case 'REJECTED_ALL':
      return hasActivity
        ? {
            level: 'high',
            summary: `Você recusou cookies não essenciais, mas depois disso houve atividade de rastreamento: ${describeActivity(activity)}.`,
            reasons: ['A escolha de recusa pode não estar sendo respeitada pelo site (possível descumprimento da LGPD).'],
            recommendation: 'Exporte o relatório como evidência e limpe os cookies deste site.'
          }
        : {
            level: 'none',
            summary: 'Você recusou cookies não essenciais. Nenhum rastreador conhecido foi observado após a recusa até agora.',
            reasons: []
          };
    case 'ACCEPTED_ALL':
      return {
        level: 'medium',
        summary: hasActivity
          ? `Você autorizou todos os cookies; após o aceite houve atividade de rastreamento: ${describeActivity(activity)}.`
          : 'Você autorizou todos os cookies, incluindo publicidade e analytics: seus hábitos de navegação podem ser compartilhados com terceiros.',
        reasons: hasActivity ? ['Seus hábitos de navegação podem ser compartilhados com parceiros de publicidade e análise.'] : [],
        recommendation: 'Você pode revogar o consentimento a qualquer momento (LGPD, art. 8º, §5º).'
      };
    case 'CUSTOMIZED':
      return {
        level: hasActivity ? 'medium' : 'low',
        summary: hasActivity
          ? `Você personalizou as preferências; depois disso houve atividade de rastreamento: ${describeActivity(activity)}.`
          : 'Você abriu/ajustou as preferências de cookies. Verifique se apenas as categorias desejadas foram ativadas.',
        reasons: hasActivity ? ['Confirme se essas categorias foram de fato autorizadas por você.'] : []
      };
    default:
      return { level: 'none', summary: 'Interação sem decisão de consentimento identificada.', reasons: [] };
  }
}

/** Overall consent posture of the session (shown at the top of the Consent tab). */
export function assessConsentOverview(session: AuditSession): RiskAssessment {
  const firstDecision = session.consentEvents
    .filter((e) => isDecision(e.actionTaken))
    .reduce((min, e) => Math.min(min, toTime(e.timestamp)), Infinity);
  const startedAt = toTime(session.startedAt) + SNAPSHOT_WINDOW_MS;
  const beforeDecision = trackerActivityBetween(session, startedAt, firstDecision);
  const hasBanner = session.consentEvents.length > 0;

  if (beforeDecision.cookies.length + beforeDecision.domains.length > 0) {
    return {
      level: 'high',
      summary: hasBanner
        ? `Antes da sua escolha de consentimento já houve atividade de rastreamento: ${describeActivity(beforeDecision)}.`
        : `Nenhum banner de consentimento foi detectado, mas houve atividade de rastreamento: ${describeActivity(beforeDecision)}.`,
      reasons: ['Rastreadores não essenciais exigem consentimento prévio do titular (LGPD, art. 7º, I).'],
      recommendation: 'Exporte o relatório como evidência; recuse os cookies não essenciais e limpe os dados do site.'
    };
  }
  if (!hasBanner) {
    return {
      level: 'low',
      summary: 'Nenhum banner de consentimento detectado até agora. Pode ser um banner não reconhecido ou o site não solicita consentimento.',
      reasons: ['Nenhum rastreador conhecido foi ativado durante a sessão até o momento.']
    };
  }
  const latest = [...session.consentEvents].sort((a, b) => toTime(b.timestamp) - toTime(a.timestamp))[0];
  return assessConsentEvent(latest, session);
}

// ---------------------------------------------------------------------------
// Security headers
// ---------------------------------------------------------------------------

export interface HeaderAssessment {
  key: keyof SecurityHeadersEvidence['headers'];
  label: string;
  value?: string;
  assessment: RiskAssessment;
}

function assessCsp(value?: string): RiskAssessment {
  if (!value) {
    return {
      level: 'medium',
      summary: 'Sem CSP: se o site sofrer injeção de código (XSS), nada impede que scripts maliciosos roubem seus dados ou senhas.',
      reasons: [],
      recommendation: 'Falha de configuração do site; o responsável deve definir uma Content-Security-Policy restritiva.'
    };
  }
  const scriptDirective = /(script-src|default-src)[^;]*/i.exec(value)?.[0] ?? '';
  const unsafe = ["'unsafe-inline'", "'unsafe-eval'"].filter((u) => scriptDirective.includes(u));
  if (unsafe.length > 0) {
    return {
      level: 'low',
      summary: `CSP presente, mas permite ${unsafe.join(' e ')}, o que enfraquece a proteção contra XSS.`,
      reasons: []
    };
  }
  return { level: 'none', summary: 'CSP configurado: restringe quais scripts podem rodar na página, reduzindo o risco de XSS.', reasons: [] };
}

function assessHsts(value: string | undefined, isHttps: boolean): RiskAssessment {
  if (!value) {
    return {
      level: isHttps ? 'medium' : 'high',
      summary: 'Sem HSTS: um atacante na mesma rede (ex.: Wi-Fi público) pode forçar a conexão para HTTP e interceptar seus dados.',
      reasons: [],
      recommendation: 'Digite sempre https:// e evite redes públicas; o responsável deve habilitar Strict-Transport-Security.'
    };
  }
  const maxAge = Number(/max-age=(\d+)/i.exec(value)?.[1] ?? 0);
  if (maxAge < 15_552_000) {
    return {
      level: 'low',
      summary: `HSTS presente, mas com validade curta (${Math.round(maxAge / 86400)} dias); o recomendado é pelo menos 6 meses.`,
      reasons: []
    };
  }
  return { level: 'none', summary: 'HSTS ativo: o navegador só acessará este site por HTTPS, impedindo o rebaixamento da conexão.', reasons: [] };
}

function assessXcto(value?: string): RiskAssessment {
  if (!value || value.trim().toLowerCase() !== 'nosniff') {
    return {
      level: 'low',
      summary: 'Sem "nosniff": o navegador pode “adivinhar” o tipo de arquivos, permitindo executar conteúdo malicioso disfarçado.',
      reasons: []
    };
  }
  return { level: 'none', summary: 'nosniff ativo: impede que arquivos sejam interpretados como um tipo diferente do declarado.', reasons: [] };
}

function assessReferrer(value?: string): RiskAssessment {
  if (!value) {
    return {
      level: 'low',
      summary: 'Sem Referrer-Policy explícita: navegadores modernos limitam o envio da URL a terceiros por padrão, mas navegadores antigos podem vazá-la.',
      reasons: []
    };
  }
  const v = value.toLowerCase();
  if (v.includes('unsafe-url') || v.includes('no-referrer-when-downgrade')) {
    return {
      level: 'medium',
      summary: 'A URL completa da página (que pode conter dados pessoais ou de busca) é enviada aos sites terceiros contatados.',
      reasons: []
    };
  }
  return { level: 'none', summary: 'Referrer-Policy restritiva: limita o vazamento do endereço visitado para terceiros.', reasons: [] };
}

function assessPermissions(value?: string): RiskAssessment {
  if (!value) {
    return {
      level: 'low',
      summary: 'Sem Permissions-Policy: scripts incorporados não têm restrição explícita a câmera, microfone ou localização (o navegador ainda pedirá sua permissão).',
      reasons: []
    };
  }
  return { level: 'none', summary: 'Permissions-Policy definida: restringe o acesso a recursos sensíveis do dispositivo.', reasons: [] };
}

export function assessSecurityHeaders(sec: SecurityHeadersEvidence): { overall: RiskAssessment; headers: HeaderAssessment[] } {
  const isHttps = sec.url.startsWith('https:');
  const h = sec.headers;
  const headers: HeaderAssessment[] = [
    { key: 'csp', label: 'Content-Security-Policy', value: h.csp, assessment: assessCsp(h.csp) },
    { key: 'hsts', label: 'Strict-Transport-Security (HSTS)', value: h.hsts, assessment: assessHsts(h.hsts, isHttps) },
    { key: 'xContentTypeOptions', label: 'X-Content-Type-Options', value: h.xContentTypeOptions, assessment: assessXcto(h.xContentTypeOptions) },
    { key: 'referrerPolicy', label: 'Referrer-Policy', value: h.referrerPolicy, assessment: assessReferrer(h.referrerPolicy) },
    { key: 'permissionsPolicy', label: 'Permissions-Policy', value: h.permissionsPolicy, assessment: assessPermissions(h.permissionsPolicy) }
  ];

  const findings: Finding[] = headers
    .filter((x) => x.assessment.level !== 'none')
    .map((x) => ({ level: x.assessment.level, text: `${x.label}: ${x.assessment.summary}` }));

  if (!isHttps) {
    findings.push({
      level: 'high',
      text: 'A página principal foi carregada sem HTTPS: tudo o que você digitar pode ser interceptado.',
      recommendation: 'Não informe senhas ou dados pessoais neste site.'
    });
  }

  const weak = headers.filter((x) => x.assessment.level !== 'none').length;
  const overall = buildAssessment(findings, {
    level: 'none',
    text: 'Todos os cabeçalhos de segurança avaliados estão configurados adequadamente.'
  });
  if (findings.length > 0 && isHttps) {
    overall.summary = `${plural(weak, 'cabeçalho de proteção ausente ou fraco', 'cabeçalhos de proteção ausentes ou fracos')}. ${
      overall.level === 'medium' || overall.level === 'high'
        ? 'O site fica mais exposto a ataques que podem afetar seus dados.'
        : 'Impacto direto baixo para você.'
    }`;
    overall.reasons = findings.map((f) => f.text);
    overall.recommendation =
      overall.recommendation ?? 'São falhas de configuração do servidor: cabe ao responsável pelo site corrigi-las.';
  }
  return { overall, headers };
}

// ---------------------------------------------------------------------------
// Evidence chain
// ---------------------------------------------------------------------------

export function assessEvidenceEvent(ev: EvidenceEvent, session: AuditSession): RiskAssessment {
  const d = ev.data;
  const ctx: AssessmentContext = {
    targetDomain: session.targetDomain,
    consentEvents: session.consentEvents,
    auditStartedAt: session.startedAt
  };

  switch (ev.eventType) {
    case 'AUDIT_STARTED':
      return { level: 'none', summary: 'Início da auditoria: marco inicial (gênese) da cadeia de evidências; não representa risco.', reasons: [] };

    case 'AUDIT_STOPPED':
      return { level: 'none', summary: 'Encerramento da auditoria: a coleta foi finalizada e a cadeia, selada.', reasons: [] };

    case 'COOKIE_DETECTED': {
      if (asString(d.type) === 'INITIAL_SNAPSHOT') {
        const names = Array.isArray(d.names) ? d.names.filter((n): n is string => typeof n === 'string') : [];
        const trackers = [...new Set(names.filter((n) => matchTrackerCookie(n)))];
        return trackers.length > 0
          ? {
              level: 'medium',
              summary: `Snapshot inicial: ${plural(names.length, 'cookie já existente', 'cookies já existentes')}, incluindo ${trackers.length} de rastreamento (${trackers.slice(0, 4).join(', ')}).`,
              reasons: ['Se você não aceitou cookies em uma visita anterior, esses rastreadores indicam coleta sem consentimento.']
            }
          : {
              level: 'none',
              summary: `Snapshot inicial: ${plural(names.length, 'cookie já presente', 'cookies já presentes')} ao iniciar a auditoria, sem rastreadores conhecidos.`,
              reasons: []
            };
      }
      const context = asString(d.context);
      return assessCookie(
        {
          name: asString(d.cookieName) ?? '',
          domain: asString(d.domain) ?? session.targetDomain,
          secure: asBoolean(d.secure),
          httpOnly: asBoolean(d.httpOnly),
          sameSite: (asString(d.sameSite) as CookieEvidence['sameSite']) ?? 'unspecified',
          expirationDate: asNumber(d.expirationDate),
          session: asNumber(d.expirationDate) === undefined,
          firstObservedAt: ev.timestamp,
          sourceContext: context === 'before_consent' || context === 'after_consent' ? context : 'unknown'
        },
        ctx
      );
    }

    case 'COOKIE_MODIFIED':
      return {
        level: 'none',
        summary: `Cookie "${asString(d.cookieName) ?? ''}" removido, expirado ou substituído; a remoção em si não representa risco.`,
        reasons: []
      };

    case 'STORAGE_RECORDED': {
      const items = Array.isArray(d.items) ? (d.items as StorageEvidence[]) : [];
      const assessed = items.map(assessStorageItem);
      const risky = assessed.filter((a) => a.level !== 'none').sort(compareRisk);
      if (risky.length === 0) {
        return {
          level: 'none',
          summary: `Snapshot de ${plural(items.length, 'item', 'itens')} de armazenamento local; nenhum indício de risco.`,
          reasons: []
        };
      }
      return {
        level: risky[0].level,
        summary: `Snapshot de ${plural(items.length, 'item', 'itens')} de armazenamento local; ${plural(risky.length, 'merece', 'merecem')} atenção. ${risky[0].summary}`,
        reasons: risky.slice(1, 4).map((a) => a.summary),
        recommendation: risky[0].recommendation
      };
    }

    case 'THIRD_PARTY_REQUEST':
      return assessNetworkRequest(
        {
          url: asString(d.url) ?? '',
          domain: asString(d.domain) ?? '',
          method: asString(d.method),
          timestamp: ev.timestamp,
          isThirdParty: true
        },
        ctx
      );

    case 'CONSENT_ACTION':
      return assessConsentEvent(
        {
          timestamp: ev.timestamp,
          actionTaken: (asString(d.action) as ConsentChoice) ?? 'UNKNOWN',
          cmpName: asString(d.cmpName),
          details: asString(d.details)
        },
        session
      );

    case 'SECURITY_HEADER_CHECK': {
      const headers = (d.headers && typeof d.headers === 'object' ? d.headers : {}) as SecurityHeadersEvidence['headers'];
      const warnings = Array.isArray(d.warnings) ? (d.warnings as string[]) : [];
      return assessSecurityHeaders({ url: asString(d.url) ?? '', timestamp: ev.timestamp, headers, warnings }).overall;
    }

    default:
      return { level: 'none', summary: 'Evento técnico de registro; não representa risco.', reasons: [] };
  }
}

export function assessChainIntegrity(status: { isValid: boolean; brokenAtIndex?: number } | null): RiskAssessment {
  if (!status) {
    return {
      level: 'low',
      summary: 'Integridade ainda não verificada. Clique em "Verificar Integridade" antes de usar o relatório como evidência.',
      reasons: []
    };
  }
  if (status.isValid) {
    return {
      level: 'none',
      summary: 'Cadeia íntegra: nenhuma evidência foi alterada, removida ou reordenada desde a coleta.',
      reasons: []
    };
  }
  return {
    level: 'high',
    summary: 'Cadeia violada: as evidências podem ter sido adulteradas e o relatório não deve ser usado como prova.',
    reasons: [`A divergência de hash começa no evento de índice ${status.brokenAtIndex ?? '?'}; todos os eventos seguintes ficam comprometidos.`],
    recommendation: 'Inicie uma nova auditoria para gerar uma cadeia confiável.'
  };
}

// ---------------------------------------------------------------------------
// Session-wide report (dashboard)
// ---------------------------------------------------------------------------

export type RiskCategory = 'consent' | 'cookies' | 'storage' | 'network' | 'security';

export const RISK_CATEGORY_LABELS: Record<RiskCategory, string> = {
  consent: 'Consentimento',
  cookies: 'Cookies',
  storage: 'Armazenamento',
  network: 'Rede',
  security: 'Segurança'
};

export interface RiskReportItem {
  category: RiskCategory;
  subject: string;
  assessment: RiskAssessment;
}

export interface SessionRiskReport {
  consentOverview: RiskAssessment;
  consent: RiskAssessment[];
  cookies: Record<string, RiskAssessment>;
  storage: RiskAssessment[];
  network: RiskAssessment[];
  security: ReturnType<typeof assessSecurityHeaders> | null;
  evidence: Record<string, RiskAssessment>;
  /** Flattened, de-duplicated list of items (one per cookie/storage key/domain/header). */
  items: RiskReportItem[];
}

export function buildSessionRiskReport(session: AuditSession): SessionRiskReport {
  const ctx: AssessmentContext = {
    targetDomain: session.targetDomain,
    consentEvents: session.consentEvents,
    auditStartedAt: session.startedAt
  };

  const consentOverview = assessConsentOverview(session);
  const consent = session.consentEvents.map((ev) => assessConsentEvent(ev, session));

  const cookies: Record<string, RiskAssessment> = {};
  for (const [key, c] of Object.entries(session.cookies)) cookies[key] = assessCookie(c, ctx);

  const storage = session.storageItems.map(assessStorageItem);
  const network = session.networkRequests.map((r) => assessNetworkRequest(r, ctx));
  const security = session.securityHeaders ? assessSecurityHeaders(session.securityHeaders) : null;

  const evidence: Record<string, RiskAssessment> = {};
  for (const ev of session.evidenceEvents) evidence[ev.id] = assessEvidenceEvent(ev, session);

  const items: RiskReportItem[] = [{ category: 'consent', subject: 'Postura de consentimento', assessment: consentOverview }];
  for (const [key, a] of Object.entries(cookies)) {
    items.push({ category: 'cookies', subject: session.cookies[key].name, assessment: a });
  }
  session.storageItems.forEach((s, i) => items.push({ category: 'storage', subject: s.key, assessment: storage[i] }));

  // One entry per third-party domain, keeping its most severe assessment.
  const byDomain = new Map<string, RiskAssessment>();
  session.networkRequests.forEach((r, i) => {
    if (!r.isThirdParty) return;
    const prev = byDomain.get(r.domain);
    if (!prev || RISK_WEIGHT[network[i].level] > RISK_WEIGHT[prev.level]) byDomain.set(r.domain, network[i]);
  });
  byDomain.forEach((a, domain) => items.push({ category: 'network', subject: domain, assessment: a }));

  security?.headers.forEach((h) => items.push({ category: 'security', subject: h.label, assessment: h.assessment }));

  return { consentOverview, consent, cookies, storage, network, security, evidence, items };
}
