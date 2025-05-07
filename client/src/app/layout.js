import Providers from "./providers";
import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.png" />
        <title>Stamurai</title>
        <meta name="description" content="Task Management App" />

      </head>
      <body suppressHydrationWarning>
      <Providers>
        {children}
        </Providers>
      </body>
    </html>
  );
}