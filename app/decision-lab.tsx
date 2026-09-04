'use client';

import { useMemo, useState } from 'react';
import commercialRules from '../data/commercial-rules.json';
import learningImports from '../data/learning-imports.json';
import portfolio from '../data/portfolio.json';

type WinObjective = 'must_win' | 'target_scope' | 'defensive' | 'partial_win' | 'profit_led' | 'reference_led';

const objectiveLabels: Record<WinObjective, string> = {
  must_win: 'Must Win',
  target_scope: 'Targeted Scope Win',
  defensive: 'Defensive Win',
  partial_win: 'Partial / Beachhead Win',
  profit_led: 'Profit-led',
  reference_led: 'Reference-led',
};

const money = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

export default function DecisionLab() {
  const [customer, setCustomer] = useState('Example Workplace Client');
  const [origin, setOrigin] = useState('US-origin clients');
  const [scope, setScope] = useState('Furniture');
  const [objective, setObjective] = useState<WinObjective>('must_win');
  const [sellingPrice, setSellingPrice] = useState(1_000_000);
  const [cost, setCost] = useState(760_000);

  const result = useMemo(() => {
    const grossMargin = sellingPrice > 0 ? (sellingPrice - cost) / sellingPrice : 0;
    const floor = commercialRules.hard_rules[0].value;
    const categoryTarget = commercialRules.current_targets.find((item) => 'category' in item && item.category === 'Finished products')?.target_gm ?? 0.3;
    const exactPreference = portfolio.rules.find((rule) => rule.scope === scope && rule.priority_for.includes(origin));
    const fallbackPreference = portfolio.rules.find((rule) => rule.scope === scope);
    const preferredBrand = exactPreference?.brand ?? fallbackPreference?.brand;
    const floorPrice = cost / (1 - floor);
    const targetPrice = cost / (1 - categoryTarget);
    const belowFloor = grossMargin < floor;
    const belowTarget = grossMargin < categoryTarget;
    const direction = belowFloor
      ? `Do not approve the current structure. Reprice to at least ${money.format(Math.ceil(floorPrice))} or reduce verified cost.`
      : objective === 'profit_led'
        ? `Protect value and work toward ${money.format(Math.ceil(targetPrice))} selling price for the current margin target.`
        : preferredBrand
          ? `Lead with ${preferredBrand} for fit, keep margin visible, and test the customer's response before discounting.`
          : 'Clarify customer priorities and product fit before selecting a lead brand or changing price.';
    const confidence = Math.max(35, Math.min(90, 45 + (preferredBrand ? 20 : 0) + (sellingPrice > 0 && cost > 0 ? 15 : 0) + (customer.trim() ? 5 : 0) - (belowFloor ? 10 : 0)));
    return {
      grossMargin, floor, categoryTarget, preferredBrand, belowFloor, belowTarget, direction, confidence,
      scenarios: [
        { name: 'Fit-led offer', value: preferredBrand ? `Lead with ${preferredBrand}` : 'Validate product fit first', tradeoff: 'Stronger relevance; requires stakeholder validation.' },
        { name: 'Target-margin offer', value: `Price near ${money.format(Math.ceil(targetPrice))}`, tradeoff: `Protects the ${(categoryTarget * 100).toFixed(0)}% preference; may reduce price competitiveness.` },
        { name: 'Defensive floor', value: `Never below ${money.format(Math.ceil(floorPrice))}`, tradeoff: `Keeps the ${(floor * 100).toFixed(0)}% hard floor; leaves little room for execution surprises.` },
      ],
    };
  }, [cost, customer, objective, origin, scope, sellingPrice]);

  const durableLearnings = learningImports.flatMap((item) => item.records).filter((record) => record.knowledgeType !== 'temporary_context');

  return (
    <section className="decision-lab" id="decision-lab">
      <div className="section-heading"><div><span>LIVE DECISION MAP</span><h2>See how the advice is made</h2></div><p>Change an input and the scenarios, rule checks and recommendation update immediately.</p></div>
      <div className="decision-grid">
        <form className="input-panel" onSubmit={(event) => event.preventDefault()}>
          <div className="panel-title"><span>1</span><div><b>Project inputs</b><small>What are we trying to win?</small></div></div>
          <label>Customer<input value={customer} onChange={(event) => setCustomer(event.target.value)} /></label>
          <label>Win objective<select value={objective} onChange={(event) => setObjective(event.target.value as WinObjective)}>{Object.entries(objectiveLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
          <label>Customer origin<select value={origin} onChange={(event) => setOrigin(event.target.value)}><option>US-origin clients</option><option>Australian-origin clients</option><option>Asian-origin clients</option><option>European-origin clients</option><option>Other / unknown</option></select></label>
          <label>Scope<select value={scope} onChange={(event) => setScope(event.target.value)}>{Array.from(new Set(portfolio.rules.map((rule) => rule.scope))).map((item) => <option key={item}>{item}</option>)}</select></label>
          <div className="field-pair"><label>Selling price<input type="number" min="0" value={sellingPrice} onChange={(event) => setSellingPrice(Number(event.target.value))} /></label><label>Verified cost<input type="number" min="0" value={cost} onChange={(event) => setCost(Number(event.target.value))} /></label></div>
          <div className="margin-meter"><div><span>Gross margin</span><b className={result.belowFloor ? 'danger' : result.belowTarget ? 'caution' : 'safe'}>{(result.grossMargin * 100).toFixed(1)}%</b></div><div className="meter"><i style={{ width: `${Math.max(0, Math.min(100, result.grossMargin * 200))}%` }} /></div><small>Hard floor {(result.floor * 100).toFixed(0)}% · Current preference {(result.categoryTarget * 100).toFixed(0)}%</small></div>
        </form>

        <div className="logic-panel">
          <div className="panel-title"><span>2</span><div><b>Knowledge used</b><small>Traceable, classified inputs</small></div></div>
          <div className="logic-step"><i>Objective</i><b>{objectiveLabels[objective]}</b><p>Sets what “winning” means before product or price advice.</p></div>
          <div className="logic-step"><i>Portfolio</i><b>{result.preferredBrand ?? 'No exact match'}</b><p>{result.preferredBrand ? `${origin} + ${scope} matched a Current Preference.` : 'More customer/product context is required.'}</p></div>
          <div className="logic-step"><i>Commercial</i><b>{result.belowFloor ? 'Hard rule failed' : result.belowTarget ? 'Above floor, below target' : 'Target met'}</b><p>Margin is checked against the 12% hard boundary and the current category target.</p></div>
          <details><summary>{durableLearnings.length} imported learnings</summary>{durableLearnings.map((record) => <div className="learning-row" key={record.id}><span>{record.knowledgeType.replace('_', ' ')}</span><p>{record.statement}</p></div>)}</details>
        </div>

        <div className="advice-panel">
          <div className="panel-title"><span>3</span><div><b>Advisor output</b><small>Options first, human decision last</small></div></div>
          <div className="situation"><small>Situation</small><p>{customer || 'Unnamed customer'} · {scope} · {objectiveLabels[objective]} · GM {(result.grossMargin * 100).toFixed(1)}%</p></div>
          <div className="scenario-list">{result.scenarios.map((scenario) => <article key={scenario.name}><small>{scenario.name}</small><b>{scenario.value}</b><p>{scenario.tradeoff}</p></article>)}</div>
          <div className="recommendation"><small>Recommended direction</small><p>{result.direction}</p></div>
          <div className="advice-meta"><div><small>Key risk</small><b>{result.belowFloor ? 'Margin rule breach' : 'Unvalidated customer response'}</b></div><div><small>Unknown</small><b>Budget, power map, competition</b></div><div><small>Confidence</small><b>{result.confidence}%</b></div></div>
          <div className="human-gate">AI advises. <strong>P decides.</strong></div>
        </div>
      </div>
    </section>
  );
}

