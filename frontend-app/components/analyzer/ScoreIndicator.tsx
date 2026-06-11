'use client';

interface ScoreIndicatorProps {
  score: number;
}

export function ScoreIndicator({ score }: ScoreIndicatorProps) {
  let colorClass = "text-red-500";
  let bgClass = "bg-red-500/10 border-red-500/20";
  let label = "Pobre";

  if (score >= 80) {
    colorClass = "text-green-500";
    bgClass = "bg-green-500/10 border-green-500/20";
    label = "Excelente";
  } else if (score >= 50) {
    colorClass = "text-yellow-500";
    bgClass = "bg-yellow-500/10 border-yellow-500/20";
    label = "Aceptable";
  }

  return (
    <div className={`flex flex-col items-center justify-center p-4 rounded-xl border ${bgClass}`}>
      <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Score de Optimización</span>
      <div className={`text-4xl font-bold ${colorClass}`}>
        {score} <span className="text-xl text-gray-500">/ 100</span>
      </div>
      <span className={`text-sm font-medium mt-1 ${colorClass}`}>{label}</span>
    </div>
  );
}
