import { Inter } from "next/font/google";
import "./globals.css";
import ConditionalLayout from '../components/ConditionalLayout';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://konektly.ca'),
  title: "Konektly - Find Help Near You",
  description: "Real-time geo-based platform connecting clients with nearby skilled professionals on demand",
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: "Konektly - Find Help Near You",
    description: "Real-time geo-based platform connecting clients with nearby skilled professionals on demand",
    images: ['/logo.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Konektly - Find Help Near You",
    description: "Real-time geo-based platform connecting clients with nearby skilled professionals on demand",
    images: ['/logo.png'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} antialiased`}
        suppressHydrationWarning
      >
        <ConditionalLayout>
          {children}
        </ConditionalLayout>
      </body>
    </html>
  );
}
