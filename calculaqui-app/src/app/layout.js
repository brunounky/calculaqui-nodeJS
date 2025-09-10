import { Inter } from "next/font/google"; 
import Navbar from "@/components/Navbar";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans", 
});

export const metadata = {
  title: "Calculaqui | Por Bruno Unky Dev",
  description: "Uma ferramenta moderna para calcular o custo médio de produtos a partir de notas de entrada.",
};

function Footer() {
    return (
      <footer className="w-full max-w-5xl mx-auto py-6 text-center text-zinc-500 dark:text-zinc-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Bruno Unky Developer. Todos os direitos reservados.</p>
      </footer>
    );
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} bg-background text-foreground antialiased font-sans`}>
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}