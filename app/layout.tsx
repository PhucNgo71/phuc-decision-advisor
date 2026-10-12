import './globals.css';
import './decision-lab.css';
import './decision-lab-v2.css';
import './product-cost-calculator.css';
import './knowledge-map.css';
import './knowledge-pulse.css';

export const metadata = {
  title: 'Ergoer Agent',
  description: 'Multi-dimensional strategic decision advisor for workplace projects.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
