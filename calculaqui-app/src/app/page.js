import CalculadoraCusto from "@/components/CalculadoraCusto";
import styles from './page.module.css';

export default function Home() {
  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8"> 
      <div className={styles.titleWrapper}>
        <h1 className={styles.title}>Calculaqui</h1>
        <p className={styles.subtitle}>
          Calcule o custo médio ponderado dos seus produtos de forma simples e rápida a partir dos dados da nota fiscal de entrada.
        </p>
      </div>
      
      <CalculadoraCusto />
    </div>
  );
}