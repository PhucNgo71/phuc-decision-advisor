'use client';

import { useMemo, useState } from 'react';
import commercialRules from '../data/commercial-rules.json';
import learningImports from '../data/learning-imports.json';
import portfolio from '../data/portfolio.json';

type WinObjective = 'must_win' | 'target_scope' | 'defensive' | 'partial_win' | 'profit_led' | 'reference_led';
type RiskLevel = 'low' | 'medium' | 'high';
type ScopeLine = {
  id: number;
  scope: string;
  sellingPrice: number;
  cost: number;
  risk: RiskLevel;
};

const objectiveLabels: Record<WinObjective, string> = {
  must_win: 'Must Win',
  target_scope: 'Targeted Scope Win',
  defensive: 'Defensive Win',
  partial_win: 'Partial / Beachhead Win',
  profit_led: 'Profit-led',
  reference_led: 'Reference-led',
};

const riskRates: Record<RiskLevel, number> = {
  low: 0.03,
  medium: 0.07,
  high: 0.12,
};
const scopeOptions = Array.from(new Set(portfolio.rules.map((rule) => rule.scope)));
const money = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const percent = (value: number) => (value * 100).toFixed(1) + '%';

export default function DecisionLab() {
  const [customer, setCustomer] = useState('Example Workplace Client');
  const [origin, setOrigin] = useState('US-origin clients');
  const [objective, setObjective] = useState<WinObjective>('must_win');
  const [scopeLines, setScopeLines] = useState<ScopeLine[]>([
    { id: 1, scope: 'Furniture', sellingPrice: 800000, cost: 600000, risk: 'medium' },
    { id: 2, scope: 'Ergonomics', sellingPrice: 200000, cost: 150000, risk: 'low' },
  ]);

  const updateScope = <K extends keyof ScopeLine>(
    id: number,
    field: K,
    value: ScopeLine[K],
  ) => {
    setScopeLines((lines) =>
      lines.map((line) => (line.id === id ? { ...line, [field]: value } : line)),
    );
  };

  const addScope = () => {
    setScopeLines((lines) => {
      const nextScope =
        scopeOptions.find((item) => !lines.some((line) => line.scope === item)) ??
        scopeOptions[0];
      const nextId = Math.max(0, ...lines.map((line) => line.id)) + 1;
      return [
        ...lines,
        { id: nextId, scope: nextScope, sellingPrice: 0, cost: 0, risk: 'medium' },
      ];
    });
  };

  const removeScope = (id: number) => {
    setScopeLines((lines) =>
      lines.length > 1 ? lines.filter((line) => line.id !== id) : lines,
    );
  };

  const result = useMemo(() => {
    const floor = commercialRules.hard_rules[0].value;
    const finishedTarget =
      commercialRules.current_targets.find(
        (item) => 'category' in item && item.category === 'Finished products',
      )?.target_gm ?? 0.3;
    const flooringTarget =
      commercialRules.current_targets.find(
        (item) =>
          'category' in item &&
          item.category === 'Carpet / glass / rubber flooring',
      )?.target_gm ?? 0.23;

    const scopes = scopeLines.map((line) => {
      const riskRate = riskRates[line.risk];
      const contingency = Math.round(line.cost * riskRate);
      const estimatedCost = line.cost + contingency;
      const margin =
        line.sellingPrice > 0
          ? (line.sellingPrice - estimatedCost) / line.sellingPrice
          : 0;
      const target =
        line.scope === 'Carpet' || line.scope === 'Glass Partition'
          ? flooringTarget
          : finishedTarget;
      const exactPreference = portfolio.rules.find(
        (rule) =>
          rule.scope === line.scope && rule.priority_for.includes(origin),
      );
      const fallbackPreference = portfolio.rules.find(
        (rule) => rule.scope === line.scope,
      );
      return {
        ...line,
        riskRate,
        contingency,
        estimatedCost,
        margin,
        target,
        preferredBrand: exactPreference?.brand ?? fallbackPreference?.brand,
      };
    });

    const totalPrice = scopes.reduce(
      (sum, line) => sum + line.sellingPrice,
      0,
    );
    const baseCost = scopes.reduce((sum, line) => sum + line.cost, 0);
    const contingency = scopes.reduce(
      (sum, line) => sum + line.contingency,
      0,
    );
    const estimatedCost = baseCost + contingency;
    const grossProfit = totalPrice - estimatedCost;
    const blendedMargin =
      totalPrice > 0 ? grossProfit / totalPrice : 0;
    const weightedTarget =
      totalPrice > 0
        ? scopes.reduce(
            (sum, line) => sum + line.target * line.sellingPrice,
            0,
          ) / totalPrice
        : finishedTarget;
    const floorPrice = estimatedCost / (1 - floor);
    const targetPrice = estimatedCost / (1 - weightedTarget);
    const belowFloor = blendedMargin < floor;
    const belowTarget = blendedMargin < weightedTarget;
    const highRiskScopes = scopes.filter((line) => line.risk === 'high');
    const brands = Array.from(
      new Set(scopes.map((line) => line.preferredBrand).filter(Boolean)),
    ) as string[];

    const direction = belowFloor
      ? 'Do not approve this structure. Reprice the full bid to at least ' +
        money.format(Math.ceil(floorPrice)) +
        ' or reduce verified cost and risk exposure.'
      : highRiskScopes.length > 0
        ? 'Validate the high-risk scope before approval, confirm contingency ownership, and protect the blended project margin.'
        : objective === 'profit_led'
          ? 'Protect value and work toward ' +
            money.format(Math.ceil(targetPrice)) +
            ' for the blended target margin.'
          : 'Lead with the best-fit scope bundle, keep each scope margin visible, and test the decision coalition before discounting.';

    const confidence = Math.max(
      35,
      Math.min(
        92,
        44 +
          (brands.length ? 15 : 0) +
          (totalPrice > 0 && baseCost > 0 ? 15 : 0) +
          (customer.trim() ? 5 : 0) +
          (scopeLines.length > 1 ? 5 : 0) -
          (belowFloor ? 12 : 0) -
          (highRiskScopes.length ? 5 : 0),
      ),
    );

    return {
      scopes,
      floor,
      totalPrice,
      baseCost,
      contingency,
      estimatedCost,
      grossProfit,
      blendedMargin,
      weightedTarget,
      floorPrice,
      targetPrice,
      belowFloor,
      belowTarget,
      highRiskScopes,
      brands,
      direction,
      confidence,
      scenarios: [
        {
          name: 'Fit-led bundle',
          value: brands.length
            ? 'Lead with ' + brands.join(' + ')
            : 'Validate product fit first',
          tradeoff:
            'Stronger scope relevance; requires stakeholder and model-level validation.',
        },
        {
          name: 'Target-margin bundle',
          value: 'Price near ' + money.format(Math.ceil(targetPrice)),
          tradeoff:
            'Protects the ' +
            (weightedTarget * 100).toFixed(0) +
            '% blended preference; may reduce price competitiveness.',
        },
        {
          name: 'Defensive floor',
          value: 'Never below ' + money.format(Math.ceil(floorPrice)),
          tradeoff:
            'Keeps the ' +
            (floor * 100).toFixed(0) +
            '% hard floor after risk contingency.',
        },
      ],
    };
  }, [customer, objective, origin, scopeLines]);

  const durableLearnings = learningImports
    .flatMap((item) => item.records)
    .filter((record) => record.knowledgeType !== 'temporary_context');

  return (
    <section className="decision-lab" id="decision-lab">
      <div className="section-heading">
        <div>
          <span>LIVE MULTI-SCOPE DECISION LAB</span>
          <h2>Build the full project scope</h2>
        </div>
        <p>
          Add as many scope packages as needed. Price, cost, contingency, risk
          and blended margin update immediately.
        </p>
      </div>
      <div className="project-context">
        <label>
          Customer
          <input
            value={customer}
            onChange={(event) => setCustomer(event.target.value)}
          />
        </label>
        <label>
          Win objective
          <select
            value={objective}
            onChange={(event) =>
              setObjective(event.target.value as WinObjective)
            }
          >
            {Object.entries(objectiveLabels).map(([value, label]) => (
              <option value={value} key={value}>{label}</option>
            ))}
          </select>
        </label>
        <label>
          Customer origin
          <select
            value={origin}
            onChange={(event) => setOrigin(event.target.value)}
          >
            <option>US-origin clients</option>
            <option>Australian-origin clients</option>
            <option>Asian-origin clients</option>
            <option>European-origin clients</option>
            <option>Other / unknown</option>
          </select>
        </label>
      </div>

      <div className="scope-builder">
        <div className="scope-builder-head">
          <div>
            <span>1</span>
            <div>
              <b>Scope / cost / risk / margin</b>
              <small>
                Estimate each package separately, then review the blended bid.
              </small>
            </div>
          </div>
          <button type="button" onClick={addScope}>+ Add another scope</button>
        </div>

        <div className="scope-table-head" aria-hidden="true">
          <span>Scope</span>
          <span>Selling price</span>
          <span>Base cost</span>
          <span>Risk</span>
          <span>Risk cost</span>
          <span>Est. margin</span>
          <span />
        </div>

        <div className="scope-rows">
          {result.scopes.map((line, index) => (
            <article className="scope-row" key={line.id}>
              <div className="scope-number">
                {String(index + 1).padStart(2, '0')}
              </div>
              <label>
                <span>Scope</span>
                <select
                  value={line.scope}
                  onChange={(event) =>
                    updateScope(line.id, 'scope', event.target.value)
                  }
                >
                  {scopeOptions.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>Selling price</span>
                <input
                  type="number"
                  min="0"
                  value={line.sellingPrice}
                  onChange={(event) =>
                    updateScope(
                      line.id,
                      'sellingPrice',
                      Number(event.target.value),
                    )
                  }
                />
              </label>
              <label>
                <span>Base cost</span>
                <input
                  type="number"
                  min="0"
                  value={line.cost}
                  onChange={(event) =>
                    updateScope(line.id, 'cost', Number(event.target.value))
                  }
                />
              </label>
              <label>
                <span>Risk</span>
                <select
                  value={line.risk}
                  onChange={(event) =>
                    updateScope(
                      line.id,
                      'risk',
                      event.target.value as RiskLevel,
                    )
                  }
                >
                  <option value="low">Low - 3%</option>
                  <option value="medium">Medium - 7%</option>
                  <option value="high">High - 12%</option>
                </select>
              </label>
              <div className="scope-output">
                <span>Risk cost</span>
                <b>{money.format(Math.ceil(line.contingency))}</b>
                <small>
                  Estimated cost {money.format(Math.ceil(line.estimatedCost))}
                </small>
              </div>
              <div className="scope-output">
                <span>Est. margin</span>
                <b
                  className={
                    line.margin < result.floor
                      ? 'danger'
                      : line.margin < line.target
                        ? 'caution'
                        : 'safe'
                  }
                >
                  {percent(line.margin)}
                </b>
                <small>Target {percent(line.target)}</small>
              </div>
              <button
                className="remove-scope"
                type="button"
                aria-label={'Remove ' + line.scope}
                onClick={() => removeScope(line.id)}
                disabled={scopeLines.length === 1}
              >
                x
              </button>
            </article>
          ))}
        </div>
      </div>

      <div className="estimate-strip">
        <div><small>Total selling price</small><b>{money.format(result.totalPrice)}</b></div>
        <div><small>Base cost</small><b>{money.format(result.baseCost)}</b></div>
        <div><small>Risk contingency</small><b>{money.format(Math.ceil(result.contingency))}</b></div>
        <div><small>Estimated project cost</small><b>{money.format(Math.ceil(result.estimatedCost))}</b></div>
        <div><small>Gross profit estimate</small><b>{money.format(Math.floor(result.grossProfit))}</b></div>
        <div className="margin-summary">
          <small>Blended margin</small>
          <b
            className={
              result.belowFloor
                ? 'danger'
                : result.belowTarget
                  ? 'caution'
                  : 'safe'
            }
          >
            {percent(result.blendedMargin)}
          </b>
          <em>
            {result.belowFloor
              ? 'Below hard floor'
              : result.belowTarget
                ? 'Above floor - below target'
                : 'Target met'}
          </em>
        </div>
      </div>

      <div className="decision-output-grid">
        <div className="logic-panel">
          <div className="panel-title">
            <span>2</span>
            <div>
              <b>Knowledge and risk used</b>
              <small>Traceable inputs behind the estimate</small>
            </div>
          </div>
          <div className="logic-step">
            <i>Objective</i>
            <b>{objectiveLabels[objective]}</b>
            <p>Defines winning before product selection or pricing.</p>
          </div>
          <div className="logic-step">
            <i>Portfolio</i>
            <b>{result.brands.length ? result.brands.join(' + ') : 'No exact match'}</b>
            <p>{result.scopes.length} scopes mapped to portfolio preferences.</p>
          </div>
          <div className="logic-step">
            <i>Risk model</i>
            <b>
              {result.highRiskScopes.length
                ? result.highRiskScopes.length + ' high-risk scope(s)'
                : 'No high-risk scopes'}
            </b>
            <p>Low adds 3%, medium 7%, and high 12% planning contingency.</p>
          </div>
          <details>
            <summary>{durableLearnings.length} imported learnings</summary>
            {durableLearnings.map((record) => (
              <div className="learning-row" key={record.id}>
                <span>{record.knowledgeType.replace('_', ' ')}</span>
                <p>{record.statement}</p>
              </div>
            ))}
          </details>
        </div>
        <div className="advice-panel">
          <div className="panel-title">
            <span>3</span>
            <div>
              <b>Advisor output</b>
              <small>Options first, human decision last</small>
            </div>
          </div>
          <div className="situation">
            <small>Situation</small>
            <p>
              {customer || 'Unnamed customer'} - {result.scopes.length} scopes -{' '}
              {objectiveLabels[objective]} - GM {percent(result.blendedMargin)}
            </p>
          </div>
          <div className="scenario-list">
            {result.scenarios.map((scenario) => (
              <article key={scenario.name}>
                <small>{scenario.name}</small>
                <b>{scenario.value}</b>
                <p>{scenario.tradeoff}</p>
              </article>
            ))}
          </div>
          <div className="recommendation">
            <small>Recommended direction</small>
            <p>{result.direction}</p>
          </div>
          <div className="advice-meta">
            <div>
              <small>Key risk</small>
              <b>{result.belowFloor ? 'Margin rule breach' : result.highRiskScopes.length ? 'High-risk scope exposure' : 'Unvalidated customer response'}</b>
            </div>
            <div>
              <small>Unknown</small>
              <b>Supplier quotes, lead time, power map</b>
            </div>
            <div>
              <small>Confidence</small>
              <b>{result.confidence}%</b>
            </div>
          </div>
          <div className="human-gate">
            Estimates support the decision. <strong>P decides.</strong>
          </div>
        </div>
      </div>
    </section>
  );
}

