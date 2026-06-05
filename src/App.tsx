import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, BarChart3, CheckCircle2, CloudCog, Download, FileText, Gauge, GitBranch, Leaf, LockKeyhole, Mail, Play, ServerCog, Settings, ShieldCheck, Sparkles, TrendingDown, X } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { breakdown, emissions, kpis, recommendations as seedRecommendations, regions, services } from './data/mock';

type RecStatus = 'active' | 'accepted' | 'dismissed' | 'snoozed';
type Recommendation = typeof seedRecommendations[number] & { status?: RecStatus };
type Toast = { title: string; detail: string } | null;

const nav = [
  ['Overview', 'overview'], ['Emissions', 'emissions'], ['Forecast', 'forecast'],
  ['Recommendations', 'recommendations'], ['Scorecards', 'scorecards'], ['Admin', 'admin']
] as const;
const colors = ['#0f766e', '#16a34a', '#0891b2', '#f59e0b', '#475569'];
const ranges = ['7D', '30D', '90D', 'Custom'] as const;

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function downloadFile(name: string, body: string, type = 'text/csv') {
  const blob = new Blob([body], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
}
function toCsv(rows: Record<string, string | number | null | undefined>[]) {
  const headers = Object.keys(rows[0] ?? {});
  const clean = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  return [headers.join(','), ...rows.map(row => headers.map(h => clean(row[h])).join(','))].join('\n');
}
function computeScore(region: string, cpu: number, idle: number, trend: number) {
  const regionIntensity = regions.find(r => r.name === region)?.intensity ?? 250;
  const regionScore = Math.max(0, 100 - regionIntensity / 5);
  const sizingScore = Math.min(100, Math.max(25, cpu < 20 ? 55 : cpu > 85 ? 72 : 95));
  const idleScore = Math.max(0, 100 - idle * 3);
  const trendScore = Math.max(0, Math.min(100, 82 + trend));
  const numeric = Math.round(regionScore * .25 + sizingScore * .3 + idleScore * .25 + trendScore * .2);
  const grade = numeric >= 90 ? 'A' : numeric >= 80 ? 'B' : numeric >= 70 ? 'C' : numeric >= 60 ? 'D' : numeric >= 45 ? 'E' : 'F';
  const exitCode = numeric >= 80 ? 0 : numeric >= 60 ? 1 : 2;
  return { numeric, grade, exitCode, factors: { region: Math.round(regionScore), sizing: Math.round(sizingScore), idle: Math.round(idleScore), trend: Math.round(trendScore) } };
}

function Panel({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) {
  return <section id={id} className={`panel ${className}`}>{children}</section>;
}
function ToastCard({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  if (!toast) return null;
  return <motion.div className="toast" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}><b>{toast.title}</b><span>{toast.detail}</span><button onClick={onClose} title="Dismiss"><X size={16}/></button></motion.div>;
}

function Header({ onExport, onToast }: { onExport: () => void; onToast: (toast: Toast) => void }) {
  async function getAiInsight() {
    try {
      const res = await fetch('/api/ai-insight', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kpis, topRecommendation: seedRecommendations[0], emissions }) });
      const data = await res.json();
      onToast({ title: 'AI insight', detail: data.summary ?? 'Set GROQ_API_KEY in Vercel to enable live AI insight.' });
    } catch {
      onToast({ title: 'AI insight unavailable', detail: 'The UI works locally; configure GROQ_API_KEY on Vercel for the serverless AI endpoint.' });
    }
  }
  return <header className="hero" id="overview">
    <img src="/assets/greenops-command-center.png" alt="GreenOps command center" />
    <div className="heroShade" />
    <nav className="topbar">
      <button className="brand linkButton" onClick={() => scrollToId('overview')}><Leaf size={22}/><span>GreenOps AI</span></button>
      <div className="navlinks">{nav.map(([label,id]) => <button key={id} onClick={() => scrollToId(id)}>{label}</button>)}</div>
      <button className="iconBtn" title="Export dashboard" onClick={onExport}><Download size={18}/></button>
    </nav>
    <motion.div className="heroCopy" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:.7 }}>
      <span className="eyebrow"><Sparkles size={16}/> Xebia sustainability intelligence</span>
      <h1>GreenOps AI Dashboard</h1>
      <p>Unified cloud carbon, cost, forecasting, ESG reporting, and CI/CD Green Score intelligence for AWS and Azure engineering teams.</p>
      <div className="heroActions">
        <button onClick={() => scrollToId('emissions')}><BarChart3 size={18}/> Explore emissions</button>
        <button className="secondary" onClick={() => scrollToId('scorecards')}><GitBranch size={18}/> Check Green Score</button>
        <button className="secondary" onClick={getAiInsight}><Sparkles size={18}/> AI insight</button>
      </div>
    </motion.div>
  </header>
}

function KpiGrid() { return <div className="kpis">{kpis.map((k,i)=><motion.div className="kpi" key={k.label} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*.08}}><span>{k.label}</span><strong>{k.value}</strong><em className={k.tone}>{k.delta}</em></motion.div>)}</div> }
function TrendChart({ range }: { range: string }) {
  const data = range === '7D' ? emissions.slice(-4) : range === '30D' ? emissions.slice(-6) : emissions;
  return <ResponsiveContainer width="100%" height={310}><AreaChart data={data}><defs><linearGradient id="co2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0f766e" stopOpacity={0.35}/><stop offset="95%" stopColor="#0f766e" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#dbe5df"/><XAxis dataKey="day"/><YAxis/><Tooltip/><Area type="monotone" dataKey="actual" stroke="#0f766e" fill="url(#co2)" strokeWidth={3}/><Line type="monotone" dataKey="forecast" stroke="#f59e0b" strokeWidth={2} dot={false}/><Line type="monotone" dataKey="target" stroke="#64748b" strokeDasharray="5 5" dot={false}/></AreaChart></ResponsiveContainer>
}
function BreakdownChart({ provider }: { provider: string }){
  const data = breakdown.map((b, i) => ({ ...b, co2e: provider === 'Azure' && i % 2 ? +(b.co2e * .82).toFixed(1) : provider === 'AWS' && i % 2 === 0 ? +(b.co2e * .9).toFixed(1) : b.co2e }));
  return <ResponsiveContainer width="100%" height={260}><BarChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="#dbe5df"/><XAxis dataKey="name" tick={{fontSize:11}}/><YAxis/><Tooltip/><Bar dataKey="co2e" radius={[8,8,0,0]}>{data.map((_,i)=><Cell key={i} fill={colors[i%colors.length]}/>)}</Bar></BarChart></ResponsiveContainer>
}

function EmissionsExplorer({ range, setRange, provider, setProvider, onExport }: { range: string; setRange: (r: string) => void; provider: string; setProvider: (p: string) => void; onExport: () => void }) {
  return <div className="grid two" id="emissions"><Panel id="forecast"><div className="sectionHead"><div><p>Executive Forecast</p><h2>Actual emissions, 90-day forecast, and carbon target</h2></div><span className="badge"><Gauge size={16}/> MAPE target &lt; 15%</span></div><div className="controls">{ranges.map(r => <button className={range === r ? 'active' : ''} onClick={() => setRange(r)} key={r}>{r}</button>)}<button onClick={onExport}><FileText size={16}/> CSV</button></div><TrendChart range={range}/></Panel><Panel><div className="sectionHead"><div><p>Business Unit Breakdown</p><h2>CO2e by operating portfolio</h2></div></div><div className="controls"><button className={provider==='All'?'active':''} onClick={() => setProvider('All')}>All</button><button className={provider==='AWS'?'active':''} onClick={() => setProvider('AWS')}>AWS</button><button className={provider==='Azure'?'active':''} onClick={() => setProvider('Azure')}>Azure</button></div><BreakdownChart provider={provider}/></Panel></div>
}

function Recommendations({ items, onStatus, onSort }: { items: Recommendation[]; onStatus: (id: string, status: RecStatus) => void; onSort: () => void }) {
  return <Panel id="recommendations"><div className="sectionHead"><div><p>Optimization Engine</p><h2>Ranked recommendations by carbon and cost impact</h2></div><button className="ghost" onClick={onSort}><TrendingDown size={17}/> Impact score</button></div><div className="recs">{items.filter(r => (r.status ?? 'active') === 'active').map(r=><article key={r.id}><div><b>{r.type}</b><span>{r.resource}</span></div><span>{r.region}</span><strong>{r.impact}</strong><span>{r.co2e}</span><span>{r.saving}</span><div className="recActions"><button onClick={() => onStatus(r.id, 'accepted')}>Accept</button><button onClick={() => onStatus(r.id, 'snoozed')}>Snooze</button><button onClick={() => onStatus(r.id, 'dismissed')}>Dismiss</button></div></article>)}</div></Panel>
}
function Scorecards({ onToast }: { onToast: (toast: Toast) => void }) {
  const [service, setService] = useState('checkout-api');
  const [region, setRegion] = useState('eu-west-1');
  const [cpu, setCpu] = useState(42);
  const [idle, setIdle] = useState(8);
  const [trend, setTrend] = useState(3);
  const result = computeScore(region, cpu, idle, trend);
  function runPipeline() { onToast({ title: `Green Score ${result.grade} (${result.numeric})`, detail: `Pipeline exit code ${result.exitCode}. Region ${result.factors.region}, sizing ${result.factors.sizing}, idle ${result.factors.idle}, trend ${result.factors.trend}.` }); }
  return <Panel id="scorecards"><div className="sectionHead"><div><p>Shift-left Green Score</p><h2>Service-level sustainability scorecards</h2></div><button className="badge linkButton" onClick={runPipeline}><Play size={16}/> Run check</button></div><div className="scoreTool"><div className="formGrid"><label>Service<input value={service} onChange={e=>setService(e.target.value)} /></label><label>Region<select value={region} onChange={e=>setRegion(e.target.value)}>{regions.map(r=><option key={r.name}>{r.name}</option>)}</select></label><label>CPU %<input type="number" value={cpu} onChange={e=>setCpu(+e.target.value)} /></label><label>Idle ratio %<input type="number" value={idle} onChange={e=>setIdle(+e.target.value)} /></label><label>Trend delta<input type="number" value={trend} onChange={e=>setTrend(+e.target.value)} /></label></div><div className="scoreResult"><div className="grade huge">{result.grade}</div><b>{service}</b><span>{result.numeric}/100</span><small>Exit code {result.exitCode}</small></div></div><div className="scores">{services.map(s=><article key={s.name}><div className="grade">{s.score}</div><h3>{s.name}</h3><p>{s.value}/100 <span>{s.trend}</span></p><div className="bars">{s.factors.map((f,i)=><i key={i} style={{height:`${f}%`}} />)}</div></article>)}</div></Panel>
}
function Architecture(){ const items=[['Data ingestion','AWS Cost Explorer + Azure Cost Management daily batch',CloudCog],['Emissions engine','PUE coefficients + Electricity Maps grid intensity',Activity],['API gateway','FastAPI, RBAC, rate limits, OpenAPI /v1',LockKeyhole],['Governance','Audit logs, GDPR-by-design, OWASP review',ShieldCheck]]; return <Panel><div className="sectionHead"><div><p>Platform Architecture</p><h2>From billing records to audit-ready carbon intelligence</h2></div></div><div className="architecture">{items.map(([t,d,Icon]: any)=><div key={t}><Icon size={22}/><b>{t}</b><span>{d}</span></div>)}</div></Panel> }
function RegionCompare(){ return <Panel><div className="sectionHead"><div><p>Region Intelligence</p><h2>Lower-carbon deployment targets</h2></div></div>{regions.map(r=><button className="region linkButton" key={r.name} onClick={() => alert(`${r.name}: ${r.intensity} gCO2e/kWh via ${r.provider}`)}><span>{r.name}<em>{r.provider}</em></span><div><i style={{width:`${r.intensity/4.2}%`}} /></div><b>{r.intensity} gCO2e/kWh</b></button>)}</Panel> }
function Alerts({ onToast }: { onToast: (toast: Toast) => void }) {
  const [threshold, setThreshold] = useState(45);
  const breached = threshold < 43;
  return <Panel id="admin" className="alerts"><h2><AlertTriangle size={20}/> Active ESG controls</h2><p>{breached ? 'Threshold breach simulated: Retail BU requires investigation within 1 hour.' : '3 projects approaching monthly CO2e thresholds. Forecast cache refreshed 6 hours ago. Tag compliance is at 87%, above MVP target.'}</p><div><span>RBAC</span><span>Azure AD SSO</span><span>CSV/PDF Export</span><span>Audit Log</span></div><label className="threshold">Project threshold: {threshold}t CO2e<input type="range" min="30" max="60" value={threshold} onChange={e=>setThreshold(+e.target.value)} /></label><button className="lightBtn" onClick={() => onToast({ title: 'Alert saved', detail: `Monthly project threshold set to ${threshold}t CO2e. Email + in-app notification enabled.` })}><Mail size={16}/> Save alert rule</button></Panel>
}

export default function App(){
  const [range, setRange] = useState('90D');
  const [provider, setProvider] = useState('All');
  const [toast, setToast] = useState<Toast>(null);
  const [recs, setRecs] = useState<Recommendation[]>(() => {
    const saved = localStorage.getItem('greenops-recommendations');
    return saved ? JSON.parse(saved) : seedRecommendations;
  });
  const activeRecs = useMemo(() => recs.filter(r => (r.status ?? 'active') === 'active'), [recs]);
  function updateRec(id: string, status: RecStatus) {
    const next = recs.map(r => r.id === id ? { ...r, status } : r);
    setRecs(next); localStorage.setItem('greenops-recommendations', JSON.stringify(next));
    setToast({ title: `Recommendation ${status}`, detail: `${id} moved out of the active recommendation queue and audit event recorded locally.` });
  }
  function sortRecs() {
    setRecs([...recs].sort((a,b) => b.impact - a.impact));
    setToast({ title: 'Sorted by impact', detail: 'Recommendations are ordered by composite CO2e + cost impact score.' });
  }
  function exportCsv() {
    downloadFile('greenops-emissions-export.csv', toCsv(emissions));
    setToast({ title: 'CSV exported', detail: 'Emissions time-series export downloaded.' });
  }
  function exportDashboard() {
    downloadFile('greenops-recommendations.csv', toCsv(activeRecs));
    setToast({ title: 'Dashboard export ready', detail: 'Recommendation CSV downloaded. The print dialog can save the dashboard as PDF.' });
    setTimeout(() => window.print(), 250);
  }
  return <><Header onExport={exportDashboard} onToast={setToast}/><main><KpiGrid/><EmissionsExplorer range={range} setRange={setRange} provider={provider} setProvider={setProvider} onExport={exportCsv}/><div className="grid side"><Recommendations items={recs} onStatus={updateRec} onSort={sortRecs}/><Scorecards onToast={setToast}/></div><div className="grid three"><Architecture/><RegionCompare/><Alerts onToast={setToast}/></div><Panel><div className="roadmap"><div><ServerCog size={22}/><p>MVP Weeks 1-16</p><b>Ingestion, emissions engine, core dashboard, RBAC, Green Score, exports.</b></div><div><Sparkles size={22}/><p>Phase 2 Weeks 17-28</p><b>Prophet forecasting, anomaly detection, executive summary, region migration.</b></div><div><CloudCog size={22}/><p>Phase 3+</p><b>Multi-tenant SaaS, streaming ingestion, Scope 3, IaC carbon estimation.</b></div></div></Panel></main><footer>Built from GreenOps AI Dashboard PRD v1.0. Optimized for Vercel deployment.</footer><ToastCard toast={toast} onClose={() => setToast(null)}/></>
}
