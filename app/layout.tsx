import './globals.css';

export const metadata = {
  title: 'Phuc Decision Advisor',
  description: 'Multi-dimensional strategic decision advisor for workplace projects.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
