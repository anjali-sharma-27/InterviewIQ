import { TrendingUp } from "lucide-react";
import type { Interview } from "@/types/global";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Dot,
} from "recharts";

interface ProgressChartProps {
  interviews: Interview[];
}

type InterviewWithDate = Interview & { createdAt?: string | Date };

interface ChartPoint {
  date: string;
  rating: number;
  role: string;
}

function formatChartDate(date?: string | Date): string {
  if (!date) return "—";
  const parsed = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

function toTimestamp(date?: string | Date): number {
  if (!date) return 0;
  const parsed = typeof date === "string" ? new Date(date) : date;
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
}

function buildChartData(interviews: InterviewWithDate[]): ChartPoint[] {
  return interviews
    .filter((i) => i.overallRating > 0)
    .sort((a, b) => toTimestamp(a.createdAt) - toTimestamp(b.createdAt))
    .map((i) => ({
      date: formatChartDate(i.createdAt),
      rating: i.overallRating,
      role: i.jobRole,
    }));
}

interface TooltipPayload {
  date: string;
  rating: number;
  role: string;
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: TooltipPayload }[];
}) {
  if (!active || !payload?.length) return null;
  const { date, rating, role } = payload[0].payload;
  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 shadow-lg">
      <p className="text-sm font-medium text-white">{date}</p>
      <p className="text-sm text-emerald-400">Rating: {rating}/10</p>
      <p className="text-xs text-zinc-400">{role}</p>
    </div>
  );
}

export default function ProgressChart({ interviews }: ProgressChartProps) {
  const chartData = buildChartData(interviews as InterviewWithDate[]);

  if (chartData.length < 2) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-6">
        <h3 className="text-lg font-semibold text-white">Your progress</h3>
        <p className="mt-1 text-sm text-zinc-400">
          Overall rating across completed sessions
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 py-10 text-center">
          <TrendingUp className="h-8 w-8 text-emerald-500" />
          <p className="max-w-xs text-sm text-zinc-400">
            Complete at least 2 interviews to see your progress chart
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-6">
      <h3 className="text-lg font-semibold text-white">Your progress</h3>
      <p className="mt-1 text-sm text-zinc-400">
        Overall rating across completed sessions
      </p>
      <div className="mt-6">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#3f3f46" strokeDasharray="4 4" />
            <XAxis
              dataKey="date"
              tick={{ fill: "#a1a1aa", fontSize: 12 }}
              axisLine={{ stroke: "#52525b" }}
              tickLine={{ stroke: "#52525b" }}
            />
            <YAxis
              domain={[0, 10]}
              ticks={[0, 2, 4, 6, 8, 10]}
              tick={{ fill: "#a1a1aa", fontSize: 12 }}
              axisLine={{ stroke: "#52525b" }}
              tickLine={{ stroke: "#52525b" }}
            />
            <Tooltip content={<ChartTooltip />} />
            <Line
              type="monotone"
              dataKey="rating"
              stroke="#10b981"
              strokeWidth={2}
              dot={<Dot r={4} fill="#10b981" stroke="#10b981" />}
              activeDot={{ r: 6, fill: "#10b981", stroke: "#10b981" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
