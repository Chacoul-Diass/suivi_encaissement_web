import { useEffect, useState } from "react";

interface DayCounterProps {
  initialDays: number;
}

const DayCounter: React.FC<DayCounterProps> = ({ initialDays }) => {
  const [days, setDays] = useState<number>(initialDays);

  useEffect(() => {
    const interval = setInterval(() => {
      setDays((prevDays) => prevDays + 1);
    }, 24 * 60 * 60 * 1000); // Ajouter 1 jour toutes les 24 heures

    return () => clearInterval(interval); // Nettoyer l'intervalle lors du démontage du composant
  }, []);

  return (
    <div
      className={`whitespace-nowrap ${
        days >= 5 ? "text-red-500" : "text-white-dark"
      }`}
    >
      Il y a {days} jour{days > 1 ? "s" : ""}
    </div>
  );
};

export default DayCounter;
