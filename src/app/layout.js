import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navigation />
        <div className="pt-20">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
