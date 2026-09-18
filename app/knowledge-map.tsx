'use client';

import { useState } from 'react';
import brandMap from '../data/ergovn-brand-map.json';
import commercialRules from '../data/commercial-rules.json';
import learningImports from '../data/learning-imports.json';
import { reviewedLearningCount } from '../lib/learnings';

type MapView = 'journey' | 'board' | 'orbit';

const reviewedEntries = learningImports.filter((entry) => entry.reviewStatus === 'reviewed');
const reviewedSources = reviewedEntries.length;
const latestReviewedAt = reviewedEntries[reviewedEntries.length - 1]?.importedAt ?? brandMap.reviewedAt;
const minimumMargin = Math.round(commercialRules.hard_rules[0].value * 100);

const boardAreas = [
  ['Relationship', 'Stakeholder power, influence and decision coalition'],
  ['Products & scope', 'Models, configurations, specifications and project fit'],
  ['Competition', 'Incumbents, Grade A references and win strategy'],
  ['Commercial', 'Landed cost, risk, payment and margin guardrails'],
  ['Evidence', 'Trials, certification, warranty and proof'],
  ['Supply chain & logistics', 'Origin, freight, tax, customs, lead time and delivery'],
];

export default function KnowledgeMap() {
  const [view, setView] = useState<MapView>('journey');

  return (
    <section className="knowledge-map" id="knowledge-map" aria-labelledby="knowledge-map-title">
      <div className="km-heading">
        <div>
          <span className="km-eyebrow">DECISION KNOWLEDGE MAP</span>
          <h2 id="knowledge-map-title">See the decision clearly.</h2>
          <p>Choose the view that fits the conversation. Every view begins with the Win Objective and keeps the final decision with P.</p>
        </div>
        <div className="km-live" aria-label="Knowledge map status">
          <strong>{reviewedLearningCount}</strong>
          <span>durable learnings</span>
          <small>{reviewedSources} reviewed sources · reviewed {latestReviewedAt}</small>
        </div>
      </div>

      <div className="km-view-switch" role="tablist" aria-label="Knowledge map view">
        {(['journey', 'board', 'orbit'] as MapView[]).map((option) => (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={view === option}
            aria-controls={`km-${option}-panel`}
            onClick={() => setView(option)}
          >
            {option === 'journey' ? 'Journey' : option === 'board' ? 'Board' : 'Orbit'}
          </button>
        ))}
      </div>

      <div className="km-focus-lines" aria-label="Priority knowledge lines">
        <article className="km-focus-line km-focus-product">
          <span aria-hidden="true">P</span>
          <div><small>PRODUCTS</small><b>Choose the exact product—not only the brand.</b><p>Check model, configuration, application fit, specifications, certification, warranty, availability and local support.</p></div>
        </article>
        <article className="km-focus-line km-focus-logistics">
          <span aria-hidden="true">L</span>
          <div><small>SUPPLY CHAIN &amp; LOGISTICS</small><b>Price and protect the complete delivery journey.</b><p>Validate origin, HS code, freight, import tax, customs documents, lead time, storage, last-mile delivery and installation risk.</p></div>
        </article>
      </div>

      {view === 'journey' && (
        <div id="km-journey-panel" role="tabpanel" className="km-panel">
          <Objective />
          <div className="km-journey" aria-label="Decision knowledge journey">
            <Stage number="02" label="UNDERSTAND" title="Who and why?">
              <KnowledgeCard title="Stakeholder power" text="Map authority, influence, interest, attitude and veto power." tags={['Buyer','Sponsor','Users','Procurement']} />
              <KnowledgeCard title="Customer context" text="Clarify needs, geography, buying behavior and success criteria." question="Who must believe what for us to win?" />
            </Stage>
            <Stage number="03" label="SHAPE" title="What fits best?">
              <KnowledgeCard title="Product & scope" text="Specify by use case, model, configuration and verified performance." tags={[`${brandMap.makers.length} makers`,'Seating','Systems','Pods']} />
              <KnowledgeCard title="Competition" text="Compare the exact offer, not the brand name alone." rivals={['Steelcase','Haworth','Herman Miller']} />
            </Stage>
            <Stage number="04" label="TEST" title="Can it win?">
              <article className="km-card"><b>Commercial guardrails</b><p>Test cost, risk, payment, cashflow and margin together.</p><div className="km-metric"><strong>{minimumMargin}%</strong><span>minimum gross margin</span></div></article>
              <KnowledgeCard title="Evidence" text="Use specs, trials, certifications, warranty, lead time and lifecycle service." question="What evidence could change the advice?" />
            </Stage>
            <Stage number="05" label="DELIVER" title="Can we promise it?">
              <KnowledgeCard title="Execution" text="Validate supply chain, import cost, installation, handover and after-sales support." tags={['Vietnam','APAC','Lead time','Service']} />
              <KnowledgeCard title="Learn and improve" text="Record outcomes, corrections and practical experience without hiding assumptions." tags={['Fact','Experience','Judgment']} />
            </Stage>
          </div>
          <DecisionOutput />
        </div>
      )}

      {view === 'board' && (
        <div id="km-board-panel" role="tabpanel" className="km-panel">
          <Objective compact />
          <div className="km-board">
            {boardAreas.map(([title, text], index) => (
              <article key={title} className="km-board-card">
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div><b>{title}</b><p>{text}</p></div>
              </article>
            ))}
          </div>
          <DecisionOutput />
        </div>
      )}

      {view === 'orbit' && (
        <div id="km-orbit-panel" role="tabpanel" className="km-panel">
          <div className="km-orbit" aria-label="Win Objective knowledge orbit">
            <div className="km-orbit-ring km-ring-one" aria-hidden="true" />
            <div className="km-orbit-ring km-ring-two" aria-hidden="true" />
            <div className="km-orbit-core"><small>START HERE</small><b>WIN<br/>OBJECTIVE</b><span>Define before product or price</span></div>
            <OrbitNode position="one" title="Relationship" text="Who decides and influences?" />
            <OrbitNode position="two" title="Products & scope" text="What exactly fits?" />
            <OrbitNode position="three" title="Competition" text="What must we beat?" />
            <OrbitNode position="four" title="Commercial" text="Can we win profitably?" />
            <OrbitNode position="five" title="Supply chain & logistics" text="Can we deliver it safely?" />
            <OrbitNode position="six" title="Evidence & learning" text="What proves and improves it?" />
          </div>
          <DecisionOutput />
        </div>
      )}

      <p className="km-guardrail"><b>Knowledge guardrail:</b> Facts, preferences, experience and judgment stay labelled. The advisor shows options and evidence; P makes the final decision.</p>
    </section>
  );
}

function Objective({ compact = false }: { compact?: boolean }) {
  return <div className={`km-objective${compact ? ' km-objective-compact' : ''}`}><span className="km-objective-number">01</span><div><small>START HERE</small><h3>Define the Win Objective</h3><p>What must we win—and what does success mean to the real decision coalition?</p></div><strong>Define this before product or price.</strong></div>;
}

function Stage({ number, label, title, children }: { number: string; label: string; title: string; children: React.ReactNode }) {
  return <section className="km-stage"><header><span>{number}</span><div><small>{label}</small><h3>{title}</h3></div></header>{children}</section>;
}

function KnowledgeCard({ title, text, tags, rivals, question }: { title: string; text: string; tags?: string[]; rivals?: string[]; question?: string }) {
  return <article className="km-card"><b>{title}</b><p>{text}</p>{tags && <div className="km-tags">{tags.map((tag) => <span key={tag}>{tag}</span>)}</div>}{rivals && <div className="km-rivals">{rivals.map((rival) => <span key={rival}>{rival}</span>)}</div>}{question && <div className="km-question">{question}</div>}</article>;
}

function OrbitNode({ position, title, text }: { position: string; title: string; text: string }) {
  return <article className={`km-orbit-node km-orbit-${position}`}><b>{title}</b><span>{text}</span></article>;
}

function DecisionOutput() {
  return <div className="km-output"><div><small>1</small><b>Situation</b></div><i>→</i><div><small>2</small><b>Scenarios</b></div><i>→</i><div><small>3</small><b>Trade-offs &amp; risks</b></div><i>→</i><div><small>4</small><b>Recommended direction</b></div><i>→</i><div className="km-human"><small>5</small><b>P decides</b></div></div>;
}
