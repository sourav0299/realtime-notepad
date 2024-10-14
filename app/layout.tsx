// app/layout.tsx
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Real-Time Notepad</title>
      </head>
      <body>
        <main className="min-h-screen bg-gray-100 text-gray-800">
          {children}
        </main>
      </body>
    </html>
  );
}
