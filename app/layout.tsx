import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ModeProvider } from "@/components/ModeContext";
import { Navigation } from "@/components/Navigation";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://cyber-lab-demo.vercel.app"),
  title: {
    default: "Cyber-Lab | Seguridad Web Educativa",
    template: "%s | Cyber-Lab",
  },
  description: "Demo educativa de seguridad web: compara implementaciones vulnerables vs seguras siguiendo estándares OWASP. Aprende sobre XSS, CSRF, autenticación y más.",
  keywords: ["seguridad web", "OWASP", "XSS", "CSRF", "autenticación", "educación", "desarrollo web", "cybersecurity"],
  authors: [{ name: "Cyber-Lab" }],
  creator: "Cyber-Lab",
  publisher: "Cyber-Lab",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://cyber-lab-demo.vercel.app",
    siteName: "Cyber-Lab",
    title: "Cyber-Lab | Seguridad Web Educativa",
    description: "Demo educativa de seguridad web: compara implementaciones vulnerables vs seguras siguiendo estándares OWASP.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Cyber-Lab - Seguridad Web Educativa",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cyber-Lab | Seguridad Web Educativa",
    description: "Demo educativa de seguridad web: compara implementaciones vulnerables vs seguras siguiendo estándares OWASP.",
    images: ["/og-image.png"],
    creator: "@cyberlab",
  },
  alternates: {
    canonical: "https://cyber-lab-demo.vercel.app",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Cyber-Lab",
    description: "Demo educativa de seguridad web: compara implementaciones vulnerables vs seguras siguiendo estándares OWASP",
    url: "https://cyber-lab-demo.vercel.app",
    applicationCategory: "EducationApplication",
    operatingSystem: "Web Browser",
    author: {
      "@type": "Organization",
      name: "Cyber-Lab",
      url: "https://cyber-lab-demo.vercel.app",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <html lang="es">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">
        <ModeProvider>
          <Navigation />
          {children}
        </ModeProvider>
      </body>
    </html>
  );
}