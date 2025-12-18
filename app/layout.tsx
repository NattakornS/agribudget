import { AuthProvider } from "@/contexts/AuthContext";
import LanguageProvider from "@/contexts/LanguageContext";
import "./App.css";
import "./globals.css";

export const metadata = {
  title: "AgriBudget",
  description: "Agricultural budget management application",
};
import { Itim } from "next/font/google";

// If loading a variable font, you don't need to specify the font weight
const itim = Itim({
  subsets:["thai"],
  weight: "400",
  style: "normal",
});
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={itim.className}>
      <body suppressHydrationWarning={true}>
        <LanguageProvider>
          <AuthProvider>{children}</AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
