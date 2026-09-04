import './globals.css';
import './decision-lab.css';
import './knowledge-pulse.css';

export const metadata = {
  title: 'P Decision Advisor',
  description: 'Multi-dimensional strategic decision advisor for workplace projects.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}

