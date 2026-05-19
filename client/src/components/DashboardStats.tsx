import { Award, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import type { Interview } from "@/types/global";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DashboardStatsProps {
  interviews: Interview[];
}

export default function DashboardStats({ interviews }: DashboardStatsProps) {
  const completed = interviews.filter((i) => i.overallRating > 0);
  const ratings = completed.map((i) => i.overallRating);
  const avgRating =
    ratings.length > 0
      ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
      : "—";
  const inProgress = interviews.length - completed.length;

  const stats = [
    {
      label: "Total sessions",
      value: interviews.length,
      icon: Clock,
      color: "text-blue-400",
      iconBg: "bg-blue-500/10",
    },
    {
      label: "Completed",
      value: completed.length,
      icon: CheckCircle2,
      color: "text-emerald-400",
      iconBg: "bg-emerald-500/10",
    },
    {
      label: "In progress",
      value: inProgress,
      icon: TrendingUp,
      color: "text-amber-400",
      iconBg: "bg-amber-500/10",
    },
    {
      label: "Avg. rating",
      value: avgRating,
      icon: Award,
      color: "text-violet-400",
      iconBg: "bg-violet-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className="border-zinc-800 bg-zinc-900/80 transition hover:border-emerald-500/20"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              {stat.label}
            </CardTitle>
            <div className={`rounded-full p-2 ${stat.iconBg}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
