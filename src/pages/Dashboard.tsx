import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Clock,
  Target,
  Star,
  ArrowRight,
  BookOpen,
  Flame,
  BarChart2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { getRecentResults, getStatsOverview } from "@/db/queries";
import type { ExamResult } from "@/types";
import { getSubjectById } from "@/db/subjects";

export function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalExams: 0,
    averageScore: 0,
    bestScore: 0,
    totalTimeHours: 0,
  });
  const [recentResults, setRecentResults] = useState<ExamResult[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [s, r] = await Promise.all([
          getStatsOverview(),
          getRecentResults(8),
        ]);
        setStats(s);
        setRecentResults(r);
      } catch (e) {
        console.error("Dashboard load error:", e);
      }
    })();
  }, []);

  const chartData = recentResults
    .slice()
    .reverse()
    .map((r, i) => ({
      name: `#${i + 1}`,
      score: Math.round(r.percentage),
      exam: r.examType,
    }));

  const statCards = [
    {
      label: "Exams Taken",
      value: stats.totalExams,
      icon: BookOpen,
      color: "var(--accent-blue)",
      bg: "rgba(14,165,233,0.1)",
    },
    {
      label: "Average Score",
      value: `${stats.averageScore}%`,
      icon: TrendingUp,
      color: "var(--accent-green)",
      bg: "rgba(34,197,94,0.1)",
    },
    {
      label: "Best Score",
      value: `${stats.bestScore}%`,
      icon: Star,
      color: "var(--accent-amber)",
      bg: "rgba(245,158,11,0.1)",
    },
    {
      label: "Hours Studied",
      value: stats.totalTimeHours,
      icon: Clock,
      color: "var(--accent-purple)",
      bg: "rgba(139,92,246,0.1)",
    },
  ];

  return (
    <div className="p-8 max-w-5xl animate-in">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1
            className="text-2xl font-bold mb-1"
            style={{ fontFamily: "'Syne', sans-serif", color: "var(--text-primary)" }}
          >
            Welcome back 👋
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Your JAMB & WAEC preparation dashboard
          </p>
        </div>
        <button
          onClick={() => navigate("/select")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
          style={{
            background: "var(--accent-blue)",
            color: "white",
          }}
        >
          <Flame size={15} />
          Start Practice
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="glass-card p-4">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                style={{ background: card.bg }}
              >
                <Icon size={17} style={{ color: card.color }} />
              </div>
              <div
                className="text-xl font-bold mb-0.5"
                style={{ fontFamily: "'Syne', sans-serif", color: card.color }}
              >
                {card.value}
              </div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                {card.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart + Recent */}
      <div className="grid grid-cols-5 gap-6">
        {/* Chart */}
        <div className="col-span-3 glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 size={15} style={{ color: "var(--accent-blue)" }} />
            <span
              className="text-sm font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Score Trend
            </span>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(30,58,95,0.5)"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    color: "var(--text-primary)",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [`${value}%`, "Score"]}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="var(--accent-blue)"
                  strokeWidth={2}
                  dot={{ fill: "var(--accent-blue)", r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div
              className="h-44 flex flex-col items-center justify-center"
              style={{ color: "var(--text-muted)" }}
            >
              <Target size={28} className="mb-2 opacity-30" />
              <p className="text-sm">No exam history yet</p>
              <p className="text-xs mt-1">Complete your first exam to see your trend</p>
            </div>
          )}
        </div>

        {/* Recent results */}
        <div className="col-span-2 glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={15} style={{ color: "var(--accent-blue)" }} />
            <span
              className="text-sm font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Recent Exams
            </span>
          </div>
          {recentResults.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center h-40"
              style={{ color: "var(--text-muted)" }}
            >
              <BookOpen size={24} className="mb-2 opacity-30" />
              <p className="text-xs">No history yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentResults.slice(0, 5).map((result) => {
                const subjects = result.subjects
                  .split(",")
                  .map((s) => getSubjectById(s)?.name?.split(" ")[0] || s)
                  .join(", ");
                const pct = Math.round(result.percentage);
                const color =
                  pct >= 70
                    ? "var(--accent-green)"
                    : pct >= 50
                    ? "var(--accent-amber)"
                    : "var(--accent-rose)";
                return (
                  <div
                    key={result.id}
                    className="flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all hover:brightness-110"
                    style={{ background: "var(--bg-secondary)" }}
                    onClick={() => navigate(`/result/${result.id}`)}
                  >
                    <div>
                      <div
                        className="text-xs font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {result.examType}
                      </div>
                      <div
                        className="text-xs truncate max-w-[110px]"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {subjects}
                      </div>
                    </div>
                    <div
                      className="text-sm font-bold"
                      style={{ color, fontFamily: "'Syne', sans-serif" }}
                    >
                      {pct}%
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick start cards */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        {[
          {
            label: "JAMB Practice",
            desc: "4 subjects · 100 min · 40 questions each",
            color: "var(--accent-blue)",
            bg: "rgba(14,165,233,0.08)",
            border: "rgba(14,165,233,0.2)",
            examType: "JAMB",
          },
          {
            label: "WAEC Practice",
            desc: "Any subject · 150 min · 50 questions",
            color: "var(--accent-green)",
            bg: "rgba(34,197,94,0.08)",
            border: "rgba(34,197,94,0.2)",
            examType: "WAEC",
          },
        ].map((card) => (
          <button
            key={card.examType}
            onClick={() => navigate("/select", { state: { examType: card.examType } })}
            className="glass-card p-5 text-left transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-between"
            style={{
              background: card.bg,
              borderColor: card.border,
            }}
          >
            <div>
              <div
                className="font-bold text-sm mb-1"
                style={{
                  fontFamily: "'Syne', sans-serif",
                  color: card.color,
                }}
              >
                {card.label}
              </div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                {card.desc}
              </div>
            </div>
            <ArrowRight size={16} style={{ color: card.color }} />
          </button>
        ))}
      </div>
    </div>
  );
}
