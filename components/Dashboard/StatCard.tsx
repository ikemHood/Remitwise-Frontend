interface StatCardProps {
  title: string;
  value: string;
  detail1?: string;
  detail1Color?: string;
  detail2?: string;
  icon: React.ReactNode;
  showTrend?: boolean;
}

import { TrendingUp } from "lucide-react";

export default function StatCard({
  title,
  value,
  detail1,
  detail1Color = "text-gray-500",
  detail2,
  icon,
  showTrend,
}: StatCardProps) {
  return (
    <div
      className="rounded-2xl shadow-md p-6 border border-[#FFFFFF14] hover:border-white/30 transition-colors duration-300"
      style={{ backgroundImage: "var(--card)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="text-gray-400 text-sm font-medium">{title}</div>
        <div className="p-2 rounded-lg bg-white/5 text-[var(--accent)]">
          {icon}
        </div>
      </div>
      <div className="space-y-1">
        <div className="text-3xl font-bold text-(--foreground)">{value}</div>
        <div className="flex items-center gap-2 text-sm">
          {detail1 && (
            <span className={`font-semibold ${detail1Color}`}>{detail1}</span>
          )}
          {showTrend && <TrendingUp className="w-4 h-4 text-green-500" />}
          {detail2 && <span className="text-gray-500">{detail2}</span>}
        </div>
      </div>
    </div>
  );
}
