import { ThemeProvider } from '@/components/theme-provider';
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
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <main className="min-h-screen">
          {children}
        </main>
        </ThemeProvider>
      </body>
    </html>
  );
}