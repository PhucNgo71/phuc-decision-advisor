import './procurement.css';

export default function ProcurementLayout({ children }: { children: React.ReactNode }) {
  return <div className="proc"><header><a className="logo" href="/"><img src="/phuc-sealion.png" alt="P mascot"/><span>P Decision Advisor</span></a><nav><a href="/">Decision Advisor</a><a className="active" href="/procurement">Procurement Governance</a></nav></header>{children}</div>;
}
