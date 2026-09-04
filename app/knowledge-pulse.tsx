import commercialRules from '../data/commercial-rules.json';
import learningImports from '../data/learning-imports.json';
import portfolio from '../data/portfolio.json';
import practicalExperience from '../data/practical-experience.json';

const knowledgeLabels: Record<string, string> = {
  fact: 'Fact',
  current_preference: 'Current Preference',
  experience: 'Practical Experience',
  judgment: 'Judgment',
  hard_rule: 'Hard Rule',
  temporary_context: 'Temporary Context',
};

export default function KnowledgePulse() {
  const reviewedImports = learningImports.filter((item) => item.reviewStatus === 'reviewed');
  const latest = reviewedImports.at(-1);
  const durableRecords = reviewedImports.flatMap((item) => item.records).filter((record) => record.knowledgeType !== 'temporary_context');
  const latestRecords = latest?.records.filter((record) => record.knowledgeType !== 'temporary_context') ?? [];
  const classificationCounts = durableRecords.reduce<Record<string, number>>((counts, record) => {
    counts[record.knowledgeType] = (counts[record.knowledgeType] ?? 0) + 1;
    return counts;
  }, { experience: practicalExperience.records.length });
  const updatedDate = latest
    ? new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${latest.importedAt}T00:00:00Z`))
    : 'No reviewed update yet';

  return (
    <section className="knowledge-pulse" id="knowledge">
      <div className="pulse-heading">
        <div><span>DAILY KNOWLEDGE PULSE</span><h2>See what the advisor knows—and when it learned it</h2></div>
        <div className="freshness"><i />Reviewed knowledge<br/><strong>Last updated {updatedDate}</strong></div>
      </div>

      <div className="pulse-stats">
        <article><strong>{reviewedImports.length}</strong><span>Reviewed source</span></article>
        <article><strong>{durableRecords.length}</strong><span>Durable learnings</span></article>
        <article><strong>{practicalExperience.records.length}</strong><span>Practical experience</span></article>
        <article><strong>{portfolio.rules.length}</strong><span>Portfolio preferences</span></article>
        <article><strong>{commercialRules.hard_rules.length}</strong><span>Commercial rule</span></article>
      </div>

      {latest && <div className="pulse-body">
        <div className="latest-update">
          <div className="update-title"><div><small>LATEST REVIEW</small><h3>{latest.sourceTitle}</h3></div><span>{latest.importedAt}</span></div>
          <p>{latest.summary}</p>
          <a href={latest.sourceUrl} target="_blank" rel="noreferrer">View original source ↗</a>
          <div className="experience-card">
            <small>PRACTICAL EXPERIENCE</small>
            {practicalExperience.records.map((record) => <article key={record.id}><b>{record.title}</b><p>{record.learning}</p><strong>Decision use</strong><p>{record.decisionUse}</p></article>)}
          </div>
        </div>
        <div className="change-feed">
          <small>WHAT CHANGED</small>
          {latestRecords.map((record) => <article key={record.id}>
            <div><span>{knowledgeLabels[record.knowledgeType]}</span><i>{record.domain}</i></div>
            <p>{record.statement}</p>
          </article>)}
        </div>
        <div className="classification-panel">
          <small>KNOWLEDGE SAFETY</small>
          <h3>Every item stays classified</h3>
          <p>Preferences never become hard rules. Practical experience informs scenarios but does not become universal truth.</p>
          <div>{Object.entries(classificationCounts).map(([type, count]) => <span key={type}><b>{count}</b>{knowledgeLabels[type]}</span>)}</div>
          <em>Freshness changes only after a real source or experience is reviewed and published.</em>
        </div>
      </div>}
    </section>
  );
}

