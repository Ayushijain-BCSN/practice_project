import './globals.css';

export const metadata = {
  title: 'Digital Heroes | Play with Purpose',
  description: 'Track your golf performance, participate in monthly draws, and support your favorite charities.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
