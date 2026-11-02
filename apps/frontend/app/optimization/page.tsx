'use client';

import { useState } from 'react';
import { Check, Undo2 } from 'lucide-react';

const PRIORITIES = [
  { label: 'High', tone: 'high' },
  { label: 'Medium', tone: 'medium' },
  { label: 'Low', tone: 'low' },
];

const APPS = [
  { key: 'netra', label: 'Netra' },
  { key: 'kavacha', label: 'NextGen2' },
];

const TASKS = [
  {
    id: 'netra-supply-chain',
    app: 'netra',
    appLabel: 'Netra',
    rank: 0,
    title: 'Supply Chain Answers: 76% Helpful Rate',
    desc: '5,232 queries recorded. SharePoint sources index is 3 days old.',
    action: 'Refresh index and assign content owner.',
    owner: 'Supply Chain Dept',
    initials: 'SC',
    metric: { value: '76%', label: 'helpful rate' },
  },
  {
    id: 'netra-hr-it-cost',
    app: 'netra',
    appLabel: 'Netra',
    rank: 1,
    title: 'HR & IT Queries: High Cost Execution',
    desc: '47% of total traffic. Current model tier is over-provisioned for simple lookups.',
    action: 'Route easy queries to lower-tier model to save ~$155.',
    owner: 'Platform Team',
    initials: 'PT',
    metric: { value: '~$155', label: 'potential saving' },
  },
  {
    id: 'netra-jde-volume',
    app: 'netra',
    appLabel: 'Netra',
    rank: 1,
    title: 'JDE Application: High Volume (+21%)',
    desc: 'Fastest-growing source. Helpful rate is currently 82%.',
    action: 'Publish approval-limit and PO guides.',
    owner: 'Finance Ops',
    initials: 'FO',
    metric: { value: '+21%', label: 'query growth' },
  },
  {
    id: 'netra-service-desk',
    app: 'netra',
    appLabel: 'Netra',
    rank: 2,
    title: 'HR and IT Service Desk: 90% Helpful Rate',
    desc: 'Performing exceptionally well in current deployments.',
    action: 'Expand rollout to additional plant locations.',
    owner: 'Business Sponsors',
    initials: 'BS',
    metric: { value: '90%', label: 'helpful rate' },
  },
  {
    id: 'kavacha-payment-flows',
    app: 'kavacha',
    appLabel: 'NextGen2',
    rank: 0,
    title: 'End-to-End Payment Flows: 22% Flakiness',
    desc: '480 test failures due to Stripe API timeouts.',
    action: 'Move to nightly slow-track suite.',
    owner: 'QA Automation',
    initials: 'QA',
    metric: { value: '22%', label: 'flaky runs' },
  },
  {
    id: 'kavacha-nextgen2',
    app: 'kavacha',
    appLabel: 'NextGen2',
    rank: 1,
    title: 'NextGen2 Regression Cases: Obsolete',
    desc: '120 tests executing against deprecated tables (0 bugs caught in 8 months).',
    action: 'Remove tests to save 45 mins daily compute.',
    owner: 'Data Engineering',
    initials: 'DE',
    metric: { value: '45 min', label: 'saved per day' },
  },
  {
    id: 'kavacha-ui-time',
    app: 'kavacha',
    appLabel: 'NextGen2',
    rank: 1,
    title: 'UI Test Execution: Time Increased 30%',
    desc: 'Current GitHub Actions CI is limited to 4 concurrent workers.',
    action: 'Increase parallel workers to 8 (+$40/mo).',
    owner: 'DevOps',
    initials: 'DO',
    metric: { value: '+30%', label: 'run time' },
  },
];

const CSS = `
.opt {
  --bg: var(--ov-bg-page, #f7f7f5);
  --card: var(--ov-bg-card, #ffffff);
  --line: var(--ov-border, #e4e4df);
  --ink: var(--ov-text-primary, #16181d);
  --ink-2: var(--ov-text-secondary, #4b5260);
  --ink-3: var(--ov-text-muted, #7a8190);
  --font: var(--ov-font-sans, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif);
  box-sizing: border-box;
  min-height: 100%;
  max-width: 1040px;
  margin: 0 auto;
  padding: 40px 40px 72px;
  background: var(--bg);
  color: var(--ink);
  font-family: var(--font);
}
.opt *, .opt *::before, .opt *::after { box-sizing: border-box; }
.opt button { font: inherit; color: inherit; cursor: pointer; }
.opt button:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }

.opt .tone-high { --tone: #dc2626; }
.opt .tone-medium { --tone: #d97706; }
.opt .tone-low { --tone: #16a34a; }
.opt [class*='tone-'] { --tone-text: color-mix(in srgb, var(--tone) 72%, var(--ink)); }

/* Header */
.opt-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; flex-wrap: wrap; margin-bottom: 28px; }
.opt-title { margin: 0 0 8px; font-size: 28px; line-height: 1.15; font-weight: 650; letter-spacing: -0.02em; }
.opt-sub { margin: 0; max-width: 58ch; font-size: 14px; line-height: 1.55; color: var(--ink-2); }
.opt-progress { width: 220px; }
.opt-progress-text { margin-bottom: 8px; font-size: 13px; color: var(--ink-2); font-variant-numeric: tabular-nums; }
.opt-bar { height: 4px; border-radius: 2px; background: var(--line); overflow: hidden; }
.opt-bar > span { display: block; height: 100%; background: #16a34a; transition: width 0.3s ease; }

/* Priority tiles (double as filters) */
.opt-tiles { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-bottom: 28px; }
.opt-tile { display: flex; align-items: baseline; gap: 12px; padding: 14px 18px; text-align: left; background: var(--card); border: 1px solid var(--line); border-radius: 8px; }
.opt-tile:hover { border-color: var(--tone); }
.opt-tile.is-active { border-color: var(--tone); box-shadow: inset 0 0 0 1px var(--tone); }
.opt-tile-count { font-size: 28px; line-height: 1; font-weight: 650; letter-spacing: -0.02em; color: var(--tone-text); font-variant-numeric: tabular-nums; }
.opt-tile-label { font-size: 13px; font-weight: 550; color: var(--ink-2); }

/* Toolbar */
.opt-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 16px; }
.opt-seg { display: inline-flex; gap: 2px; padding: 3px; border-radius: 9px; background: color-mix(in srgb, var(--ink) 7%, transparent); }
.opt-seg-btn { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; border: 0; border-radius: 6px; background: transparent; font-size: 13px; font-weight: 550; color: var(--ink-2); }
.opt-seg-btn:hover { color: var(--ink); }
.opt-seg-btn.is-active { background: var(--card); color: var(--ink); box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12); }
.opt-seg-count { font-size: 12px; font-weight: 500; color: var(--ink-3); font-variant-numeric: tabular-nums; }
.opt-clear { padding: 6px 4px; border: 0; background: transparent; font-size: 13px; font-weight: 550; color: var(--ink-2); text-decoration: underline; text-underline-offset: 3px; }
.opt-clear:hover { color: var(--ink); }

/* Task list */
.opt-list { display: flex; flex-direction: column; gap: 10px; margin: 0; padding: 0; list-style: none; }
.opt-row { position: relative; display: grid; grid-template-columns: minmax(0, 1fr) 150px 200px; gap: 28px; padding: 20px 22px 20px 28px; background: var(--card); border: 1px solid var(--line); border-radius: 8px; overflow: hidden; }
.opt-row::before { content: ''; position: absolute; top: 0; bottom: 0; left: 0; width: 4px; background: var(--tone); }
.opt-row.is-done::before { background: var(--line); }
.opt-row.is-done .opt-main, .opt-row.is-done .opt-metric { opacity: 0.55; }
.opt-row.is-done .opt-item-title { text-decoration: line-through; text-decoration-color: var(--ink-3); }

.opt-tags { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
.opt-pill { display: inline-flex; align-items: center; gap: 6px; padding: 3px 10px 3px 8px; border-radius: 999px; background: color-mix(in srgb, var(--tone) 13%, transparent); color: var(--tone-text); font-size: 12px; font-weight: 600; }
.opt-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--tone); }
.opt-app { font-size: 12px; font-weight: 550; color: var(--ink-3); }
.opt-item-title { margin: 0 0 6px; font-size: 16px; line-height: 1.35; font-weight: 600; letter-spacing: -0.005em; }
.opt-desc { margin: 0; max-width: 62ch; font-size: 14px; line-height: 1.55; color: var(--ink-2); }
.opt-next { display: flex; align-items: baseline; gap: 10px; margin: 14px 0 0; padding: 10px 12px; border-radius: 6px; background: color-mix(in srgb, var(--tone) 7%, transparent); font-size: 13px; line-height: 1.5; color: var(--ink); }
.opt-next b { flex: none; font-weight: 600; color: var(--tone-text); }

.opt-metric { display: flex; flex-direction: column; justify-content: center; gap: 4px; padding-left: 24px; border-left: 1px solid var(--line); }
.opt-metric-value { font-size: 26px; line-height: 1.1; font-weight: 650; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
.opt-metric-label { font-size: 12px; color: var(--ink-3); }

.opt-side { display: flex; flex-direction: column; justify-content: space-between; align-items: flex-start; gap: 16px; }
.opt-owner { display: flex; align-items: center; gap: 10px; min-width: 0; }
.opt-avatar { flex: none; display: grid; place-items: center; width: 32px; height: 32px; border-radius: 50%; background: color-mix(in srgb, var(--ink) 8%, transparent); font-size: 11px; font-weight: 650; letter-spacing: 0.02em; color: var(--ink-2); }
.opt-owner-text { display: flex; flex-direction: column; min-width: 0; }
.opt-owner-label { font-size: 11px; color: var(--ink-3); }
.opt-owner-name { font-size: 13px; font-weight: 600; line-height: 1.3; }
.opt-done { display: inline-flex; align-items: center; gap: 6px; padding: 7px 13px; border: 1px solid var(--line); border-radius: 6px; background: transparent; font-size: 13px; font-weight: 550; }
.opt-done:hover { background: color-mix(in srgb, var(--ink) 6%, transparent); }

/* Empty state */
.opt-empty { padding: 40px 24px; text-align: center; background: var(--card); border: 1px dashed var(--line); border-radius: 8px; }
.opt-empty-title { margin: 0 0 4px; font-size: 15px; font-weight: 600; }
.opt-empty-body { margin: 0 0 16px; font-size: 13px; color: var(--ink-2); }

@media (max-width: 860px) {
  .opt { padding: 24px 16px 56px; }
  .opt-progress { width: 100%; }
  .opt-tile { flex-direction: column; align-items: flex-start; gap: 6px; padding: 12px 14px; }
  .opt-row { grid-template-columns: minmax(0, 1fr); gap: 18px; padding: 18px 16px 18px 22px; }
  .opt-metric { flex-direction: row; align-items: baseline; justify-content: flex-start; gap: 10px; padding: 14px 0 0; border-left: 0; border-top: 1px solid var(--line); }
  .opt-side { flex-direction: row; align-items: center; justify-content: space-between; flex-wrap: wrap; }
}

@media (prefers-reduced-motion: reduce) {
  .opt-bar > span { transition: none; }
}
`;

export default function OptimizationPage() {
  const [app, setApp] = useState('all');
  const [priority, setPriority] = useState(-1);
  const [done, setDone] = useState(() => new Set());

  const doneCount = TASKS.filter((t) => done.has(t.id)).length;

  const tiles = PRIORITIES.map((p, rank) => ({
    label: p.label,
    tone: p.tone,
    rank,
    open: TASKS.filter(
      (t) => t.rank === rank && !done.has(t.id) && (app === 'all' || t.app === app)
    ).length,
  }));

  const appTabs = [{ key: 'all', label: 'All tasks' }, ...APPS].map((a) => ({
    key: a.key,
    label: a.label,
    open: TASKS.filter(
      (t) =>
        (a.key === 'all' || t.app === a.key) &&
        !done.has(t.id) &&
        (priority === -1 || t.rank === priority)
    ).length,
  }));

  const visible = TASKS.filter(
    (t) => (app === 'all' || t.app === app) && (priority === -1 || t.rank === priority)
  ).sort((a, b) => a.rank - b.rank);

  const filtersActive = app !== 'all' || priority !== -1;

  return (
    <div className="opt">
      <style>{CSS}</style>

      <header className="opt-head">
        <div>
          <h1 className="opt-title">System optimization tasks</h1>
          <p className="opt-sub">
            Pending action items to improve system performance, reduce costs, and resolve
            operational issues.
          </p>
        </div>
        <div className="opt-progress">
          <div className="opt-progress-text">
            {doneCount} of {TASKS.length} tasks done
          </div>
          <div
            className="opt-bar"
            role="progressbar"
            aria-label="Tasks completed"
            aria-valuemin={0}
            aria-valuemax={TASKS.length}
            aria-valuenow={doneCount}
          >
            <span style={{ width: `${(doneCount / TASKS.length) * 100}%` }} />
          </div>
        </div>
      </header>

      <div className="opt-tiles" role="group" aria-label="Filter by priority">
        {tiles.map((p) => (
          <button
            key={p.label}
            type="button"
            className={`opt-tile tone-${p.tone}${priority === p.rank ? ' is-active' : ''}`}
            aria-pressed={priority === p.rank}
            aria-label={`${p.open} open ${p.label.toLowerCase()} priority tasks`}
            onClick={() => setPriority((cur) => (cur === p.rank ? -1 : p.rank))}
          >
            <span className="opt-tile-count">{p.open}</span>
            <span className="opt-tile-label">{p.label} priority</span>
          </button>
        ))}
      </div>

      <div className="opt-toolbar">
        <div className="opt-seg" role="group" aria-label="Filter by application">
          {appTabs.map((a) => (
            <button
              key={a.key}
              type="button"
              className={`opt-seg-btn${app === a.key ? ' is-active' : ''}`}
              aria-pressed={app === a.key}
              onClick={() => setApp(a.key)}
            >
              {a.label}
              <span className="opt-seg-count">{a.open}</span>
            </button>
          ))}
        </div>
        {filtersActive && (
          <button
            type="button"
            className="opt-clear"
            onClick={() => {
              setApp('all');
              setPriority(-1);
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      {visible.length === 0 ? (
        <div className="opt-empty">
          <p className="opt-empty-title">No tasks match these filters</p>
          <p className="opt-empty-body">Clear the filters to see every task.</p>
          <button
            type="button"
            className="opt-done"
            onClick={() => {
              setApp('all');
              setPriority(-1);
            }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <ul className="opt-list">
          {visible.map((t) => {
            const p = PRIORITIES[t.rank];
            const isDone = done.has(t.id);
            return (
              <li
                key={t.id}
                className={`opt-row tone-${p.tone}${isDone ? ' is-done' : ''}`}
              >
                <div className="opt-main">
                  <div className="opt-tags">
                    <span className="opt-pill">
                      <span className="opt-dot" />
                      {p.label}
                    </span>
                    <span className="opt-app">{t.appLabel}</span>
                  </div>
                  <h3 className="opt-item-title">{t.title}</h3>
                  <p className="opt-desc">{t.desc}</p>
                  <p className="opt-next">
                    <b>Next step</b>
                    <span>{t.action}</span>
                  </p>
                </div>

                <div className="opt-metric">
                  <span className="opt-metric-value">{t.metric.value}</span>
                  <span className="opt-metric-label">{t.metric.label}</span>
                </div>

                <div className="opt-side">
                  <div className="opt-owner">
                    <span className="opt-avatar" aria-hidden="true">
                      {t.initials}
                    </span>
                    <span className="opt-owner-text">
                      <span className="opt-owner-label">Assigned to</span>
                      <span className="opt-owner-name">{t.owner}</span>
                    </span>
                  </div>
                  <button
                    type="button"
                    className="opt-done"
                    onClick={() =>
                      setDone((prev) => {
                        const next = new Set(prev);
                        if (next.has(t.id)) next.delete(t.id);
                        else next.add(t.id);
                        return next;
                      })
                    }
                  >
                    {isDone ? (
                      <Undo2 size={14} aria-hidden="true" />
                    ) : (
                      <Check size={14} aria-hidden="true" />
                    )}
                    {isDone ? 'Reopen' : 'Mark done'}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}