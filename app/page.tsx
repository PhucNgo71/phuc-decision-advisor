import { reviewedLearningCount } from '../lib/learnings';

const brains = [
  { name: 'Product Brain', desc: 'Brands, models, applications, specs', cls: 'b1' },
  { name: 'Customer Brain', desc: 'Industries, regions, buying behavior', cls: 'b2' },
  { name: 'Commercial Brain', desc: 'Margin, payment terms, cashflow, bond', cls: 'b3' },
  { name: 'Relationship Brain', desc: 'End user, Procurement, PM, stakeholders', cls: 'b4' },
  { name: 'Competition Brain', desc: 'Competitors, incumbents, win strategies', cls: 'b5' },
  { name: 'Execution Brain', desc: 'Lead time, supply chain, installation, warranty', cls: 'b6' },
  { name: 'Sustainability Brain', desc: 'Certifications, ESG, wellbeing', cls: 'b7' },
  { name: 'Project Brain', desc: 'Scopes, timeline, risk, objectives', cls: 'b8' },
  { name: 'Learning Brain', desc: 'Your decisions, outcomes, patterns', cls: 'b9' },
];

export default function Home() {
  return (
    <main className="page">
      <header className="topbar">
        <div className="brand"><img src="/phuc-sealion.png" alt="Phuc mascot"/><div><b>Phuc</b><span>Decision Advisor</span></div></div>
        <nav><a className="active">Home</a><a>Opportunities</a><a>Products</a><a>Customers</a><a>Insights</a><a>Settings</a></nav>
        <div className="profile">Phuc Ngo <span>⌄</span></div>
      </header>

      <section className="hero">
        <div className="copy">
          <div className="eyebrow">AI INSIGHTS. REAL EXPERIENCE. YOUR DECISION.</div>
          <h1>Think Wider.<br/>Decide Smarter.<br/><em>Go Further.</em></h1>
          <p>Your AI partner for opportunities, products, people and possibilities — built from your experience, designed for what’s next.</p>
          <div className="actions"><button>New Opportunity →</button><button className="secondary">Chat with Phuc</button></div>
          <div className="principle">AI advises.<br/>Phuc decides.</div>
        </div>

        <div className="brain-stage">
          <div className="orbit orbit-a"/><div className="orbit orbit-b"/><div className="orbit orbit-c"/>
          <div className="core"><span>◉</span><b>Phuc<br/>AI Brain</b></div>
          {brains.map((brain) => <div className={`brain-node ${brain.cls}`} key={brain.name}><i/><div><b>{brain.name}</b><span>{brain.desc}</span></div></div>)}
          {Array.from({length: 26}).map((_,i)=><span className={`dot d${i+1}`} key={i}/>) }
          <img className="mascot" src="/phuc-sealion.png" alt="Cute sea lion mascot"/>
        </div>
      </section>

      <section className="cards">
        <article><strong>◎</strong><div><b>Evaluate Opportunities</b><span>Multi-dimensional analysis with strategic scenarios.</span></div><i>→</i></article>
        <article><strong>◇</strong><div><b>Explore Products</b><span>Deep product knowledge across your portfolio.</span></div><i>→</i></article>
        <article><strong>◉</strong><div><b>Understand Customers</b><span>Smarter insights from real project experience.</span></div><i>→</i></article>
        <article><strong>↗</strong><div><b>Learn & Improve</b><span>{reviewedLearningCount} reviewed learnings imported with source and classification.</span></div><i>→</i></article>
      </section>

      <footer><blockquote>“The important thing is not to stop questioning.”<small>— Albert Einstein</small></blockquote><div className="outcomes"><span>Stronger<br/>Decisions</span><span>Higher<br/>Win Rate</span><span>Healthier<br/>Business</span><span>A More<br/>Focused You</span></div></footer>
    </main>
  );
}

