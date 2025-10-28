import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Hackacast - Sistema de Perguntas Anônimas",
  description: "Envie suas perguntas anônimas para o podcast Hackacast",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Permanent+Marker&family=Oswald:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: "rgb(255 255 255)",
                color: "rgb(0 0 0)",
                border: "3px solid rgb(0 0 0)",
                fontFamily: "'Oswald', sans-serif",
                fontWeight: "bold",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
