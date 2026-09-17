import brandMap from '../data/ergovn-brand-map.json';
import commercialRules from '../data/commercial-rules.json';
import learningImports from '../data/learning-imports.json';
import { reviewedLearningCount } from '../lib/learnings';

const reviewedEntries = learningImports.filter((entry) => entry.reviewStatus === 'reviewed');
const reviewedSources = reviewedEntries.length;
const latestReviewedAt = reviewedEntries[reviewedEntries.length - 1]?.importedAt ?? brandMap.reviewedAt;
const minimumMargin = Math.round(commercialRules.hard_rules[0].value * 100);

export default function KnowledgeMap() {
  return (
    <section className="knowledge-map" id="knowledge-map" aria-labelledby="knowledge-map-title">
      <div className="km-heading">
        <div>
          <span className="km-eyebrow">DECISION KNOWLEDGE JOURNEY</span>
          <h2 id="knowledge-map-title">See the decision clearly.</h2>
          <p>
            Start with the Win Objective, then move through the four questions that shape a
            confident bid. Detail stays readable, connected and ready for action.
          </p>
        </div>
        <div className="km-live" aria-label="Knowledge map status">
          <strong>{reviewedLearningCount}</strong>
          <span>durable learnings</span>
          <small>{reviewedSources} reviewed sources · reviewed {latestReviewedAt}</small>
        </div>
      </div>

      <div className="km-objective">
        <span className="km-objective-number">01</span>
        <div>
          <small>START HERE</small>
          <h3>Define the Win Objective</h3>
          <p>What must we win—and what does success mean to the real decision coalition?</p>
        </div>
        <strong>Define this before product or price.</strong>
      </div>

      <div className="km-focus-lines" aria-label="Priority knowledge lines">
        <article className="km-focus-line km-focus-product">
          <span aria-hidden="true">P</span>
          <div>
            <small>PRODUCTS</small>
            <b>Choose the exact product—not only the brand.</b>
            <p>Check model, configuration, application fit, specifications, certification, warranty, availability and local support.</p>
          </div>
        </article>
        <article className="km-focus-line km-focus-logistics">
          <span aria-hidden="true">L</span>
          <div>
            <small>SUPPLY CHAIN &amp; LOGISTICS</small>
            <b>Price and protect the complete delivery journey.</b>
            <p>Validate origin, HS code, freight, import tax, customs documents, lead time, storage, last-mile delivery and installation risk.</p>
          </div>
        </article>
      </div>

      <div className="km-journey" aria-label="Decision knowledge journey">
        <section className="km-stage">
          <header><span>02</span><div><small>UNDERSTAND</small><h3>Who and why?</h3></div></header>
          <article>
            <b>Stakeholder power</b>
            <p>Map authority, influence, interest, attitude and veto power.</p>
            <div className="km-tags"><span>Buyer</span><span>Sponsor</span><span>Users</span><span>Procurement</span></div>
          </article>
          <article>
            <b>Customer context</b>
            <p>Clarify needs, geography, buying behavior and success criteria.</p>
            <div className="km-question">Who must believe what for us to win?</div>
          </article>
        </section>

        <section className="km-stage">
          <header><span>03</span><div><small>SHAPE</small><h3>What fits best?</h3></div></header>
          <article>
            <b>Product &amp; scope</b>
            <p>Specify by use case, model, configuration and verified performance.</p>
            <div className="km-tags"><span>{brandMap.makers.length} makers</span><span>Seating</span><span>Systems</span><span>Pods</span></div>
          </article>
          <article>
            <b>Competition</b>
            <p>Compare the exact offer, not the brand name alone.</p>
            <div className="km-rivals"><span>Steelcase</span><span>Haworth</span><span>Herman Miller</span></div>
          </article>
        </section>

        <section className="km-stage">
          <header><span>04</span><div><small>TEST</small><h3>Can it win?</h3></div></header>
          <article>
            <b>Commercial guardrails</b>
            <p>Test cost, risk, payment, cashflow and margin together.</p>
            <div className="km-metric"><strong>{minimumMargin}%</strong><span>minimum gross margin</span></div>
          </article>
          <article>
            <b>Evidence</b>
            <p>Use specs, trials, certifications, warranty, lead time and lifecycle service.</p>
            <div className="km-question">What evidence could change the advice?</div>
          </article>
        </section>

        <section className="km-stage">
          <header><span>05</span><div><small>DELIVER</small><h3>Can we promise it?</h3></div></header>
          <article>
            <b>Execution</b>
            <p>Validate supply chain, import cost, installation, handover and after-sales support.</p>
            <div className="km-tags"><span>Vietnam</span><span>APAC</span><span>Lead time</span><span>Service</span></div>
          </article>
          <article>
            <b>Learn and improve</b>
            <p>Record outcomes, corrections and practical experience without hiding assumptions.</p>
            <div className="km-tags"><span>Fact</span><span>Experience</span><span>Judgment</span></div>
          </article>
        </section>
      </div>

      <div className="km-output">
        <div><small>1</small><b>Situation</b></div><i>→</i>
        <div><small>2</small><b>Scenarios</b></div><i>→</i>
        <div><small>3</small><b>Trade-offs &amp; risks</b></div><i>→</i>
        <div><small>4</small><b>Recommended direction</b></div><i>→</i>
        <div className="km-human"><small>5</small><b>P decides</b></div>
      </div>

      <p className="km-guardrail">
        <b>Knowledge guardrail:</b> Facts, preferences, experience and judgment stay labelled.
        The advisor shows options and evidence; P makes the final decision.
      </p>
    </section>
  );
}
