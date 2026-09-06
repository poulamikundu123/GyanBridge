"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

interface SkillDataPoint {
  skillName: string;
  studentScore: number;
  requiredScore: number;
  category: string;
}

interface SkillChartsProps {
  radarData: Array<{ subject: string; studentScore: number; benchmark: number }>;
  comparisonData: SkillDataPoint[];
}

export default function SkillCharts({ radarData, comparisonData }: SkillChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Chart 1: Multi-Domain Radar */}
      <div className="ayush-card p-6 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">Competency Radar Spectrum</h3>
          <p className="text-xs text-slate-500 mb-4">
            Visualizing student verified proficiencies against the target role benchmark
          </p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "#475569", fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94a3b8" />
              <Radar
                name="Your Verified Score"
                dataKey="studentScore"
                stroke="#047857"
                fill="#10b981"
                fillOpacity={0.4}
              />
              <Radar
                name="Industry Benchmark"
                dataKey="benchmark"
                stroke="#d97706"
                fill="#f59e0b"
                fillOpacity={0.2}
              />
              <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Comparative Dual-Bar Chart */}
      <div className="ayush-card p-6 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">Direct Industry Gap Comparison</h3>
          <p className="text-xs text-slate-500 mb-4">
            Side-by-side view highlighting gaps where training or reassessment is needed
          </p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={comparisonData.slice(0, 6)}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis
                type="category"
                dataKey="skillName"
                width={120}
                tick={{ fontSize: 10, fill: "#334155" }}
              />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
              <Bar dataKey="studentScore" name="Your Score (%)" fill="#047857" radius={[0, 4, 4, 0]} />
              <Bar dataKey="requiredScore" name="Industry Requirement (%)" fill="#f59e0b" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
