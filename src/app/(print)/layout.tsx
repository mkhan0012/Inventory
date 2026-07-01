import "../globals.css";

export default function PrintLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div style={{ background: 'white', color: 'black', minHeight: '100vh', padding: '20px' }}>
      {children}
    </div>
  );
}
