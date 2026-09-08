import brandMap from '../data/ergovn-brand-map.json';
import commercialRules from '../data/commercial-rules.json';
import learningImports from '../data/learning-imports.json';
import { reviewedLearningCount } from '../lib/learnings';

const reviewedSources = learningImports.filter((entry) => entry.reviewStatus === 'reviewed').length;
const minimumMargin = Math.round(commercialRules.hard_rules[0].value * 100);

export default function KnowledgeMap() {
  return (
    <section className="knowledge-map" id="knowledge-map" aria-labelledby="knowledge-map-title">
      <div className="km-heading">
        <div>
          <span className="km-eyebrow">FULL DECISION KNOWLEDGE MAP</span>
          <h2 id="knowledge-map-title">See the whole bid before making the decision.</h2>
          <p>
            Every branch connects back to the Win Objective. Facts, experience and judgment guide
            the recommendation; P keeps the final decision.
          </p>
        </div>
        <div className="km-live" aria-label="Knowledge map status">
          <strong>{reviewedLearningCount}</strong>
          <span>durable learnings</span>
          <small>{reviewedSources} reviewed sources · reviewed {brandMap.reviewedAt}</small>
        </div>
      </div>

      <div className="km-canvas">
        <svg className="km-connections" viewBox="0 0 1000 690" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="mapLine" x1="0" x2="1">
              <stop offset="0" stopColor="#64b5f6" />
              <stop offset="1" stopColor="#8b6ee8" />
            </linearGradient>
          </defs>
          <g fill="none" stroke="url(#mapLine)" strokeWidth="2">
            <path d="M500 345 L166 115" />
            <path d="M500 345 L500 115" />
            <path d="M500 345 L834 115" />
            <path d="M500 345 L166 345" />
            <path d="M500 345 L834 345" />
            <path d="M500 345 L166 575" />
            <path d="M500 345 L500 575" />
            <path d="M500 345 L834 575" />
          </g>
          <g fill="#5d9ee8">
            <circle cx="166" cy="115" r="5" /><circle cx="500" cy="115" r="5" />
            <circle cx="834" cy="115" r="5" /><circle cx="166" cy="345" r="5" />
            <circle cx="834" cy="345" r="5" /><circle cx="166" cy="575" r="5" />
            <circle cx="500" cy="575" r="5" /><circle cx="834" cy="575" r="5" />
          </g>
        </svg>

        <article className="km-node km-stakeholders">
          <span className="km-icon">01</span>
          <div><small>RELATIONSHIP</small><h3>Stakeholder power</h3></div>
          <p>Map formal authority, informal influence, interest, attitude and veto power.</p>
          <ul><li>Economic buyer + sponsor</li><li>Users + consultants</li><li>Procurement + gatekeepers</li></ul>
        </article>

        <article className="km-node km-product">
          <span className="km-icon">02</span>
          <div><small>PRODUCT &amp; SCOPE</small><h3>Exact project fit</h3></div>
          <p>Specify by use case, model, configuration and verified performance—not brand name alone.</p>
          <div className="km-tags"><span>Seating</span><span>Systems</span><span>Pods</span><span>Ancillary</span><span>Flooring</span></div>
        </article>

        <article className="km-node km-competition">
          <span className="km-icon">03</span>
          <div><small>COMPETITION</small><h3>Grade A reference set</h3></div>
          <p>User-defined premium competitor range for the current market context.</p>
          <div className="km-rivals"><b>Steelcase</b><b>Haworth</b><b>Herman Miller</b></div>
        </article>

        <article className="km-node km-portfolio">
          <span className="km-icon">04</span>
          <div><small>ERGOVN CORE</small><h3>{brandMap.makers.length}-maker network</h3></div>
          <p>Build the strongest fit-for-scope combination; confirm authorization and availability per bid.</p>
          <div className="km-brand-cloud">
            {brandMap.makers.map((maker) => <span key={maker.name}>{maker.name}</span>)}
          </div>
        </article>

        <article className="km-core-node">
          <span>START HERE</span>
          <strong>WIN<br/>OBJECTIVE</strong>
          <p>What must we win—and what does success mean for the real decision coalition?</p>
          <small>Define this before product or price.</small>
        </article>

        <article className="km-node km-commercial">
          <span className="km-icon">05</span>
          <div><small>COMMERCIAL</small><h3>Value with guardrails</h3></div>
          <p><b>{minimumMargin}% minimum GM</b> is the hard boundary. Test margin, payment, cashflow and bond exposure together.</p>
          <div className="km-tags"><span>20–30% targets</span><span>Payment terms</span><span>Total installed cost</span></div>
        </article>

        <article className="km-node km-learning">
          <span className="km-icon">06</span>
          <div><small>LEARNING</small><h3>Knowledge with labels</h3></div>
          <p>New knowledge stays traceable so temporary preferences never become hidden rules.</p>
          <div className="km-tags"><span>Fact</span><span>Preference</span><span>Experience</span><span>Judgment</span><span>Hard rule</span></div>
        </article>

        <article className="km-node km-evidence">
          <span className="km-icon">07</span>
          <div><small>EVIDENCE</small><h3>Prove the advantage</h3></div>
          <p>Use compliant specs, samples, trials, certifications, warranty, lead time and lifecycle service.</p>
          <div className="km-callout">What evidence could change the advice?</div>
        </article>

        <article className="km-node km-execution">
          <span className="km-icon">08</span>
          <div><small>EXECUTION</small><h3>Deliver the promise</h3></div>
          <p>Validate supply chain, installation capacity, handover, warranty ownership and after-sales response.</p>
          <div className="km-tags"><span>Vietnam</span><span>APAC</span><span>Lead time</span><span>Service</span></div>
        </article>
      </div>

      <div className="km-decision-path" aria-label="Decision path">
        <div><small>1</small><b>Situation</b></div><i>→</i>
        <div><small>2</small><b>2–3 scenarios</b></div><i>→</i>
        <div><small>3</small><b>Trade-offs &amp; risks</b></div><i>→</i>
        <div><small>4</small><b>Recommended direction</b></div><i>→</i>
        <div className="km-human"><small>5</small><b>P decides</b></div>
      </div>

      <p className="km-guardrail">
        <b>Bid guardrail:</b> A listed maker is not automatically equivalent to a competitor model.
        Compare exact configuration, certification, warranty, local support, lead time and installed cost.
      </p>
    </section>
  );
}
