import {
  PageHeader,
  PageLayout,
  SectionCard,
} from "@/components/layout/PageLayout";
import { Badge } from "@/components/ui/badge";
import { useStudents } from "@/hooks/backend/students";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const GRADE_DIST = [
  { range: "A (90-100)", count: 8 },
  { range: "B (80-89)", count: 14 },
  { range: "C (70-79)", count: 10 },
  { range: "D (60-69)", count: 5 },
  { range: "F (<60)", count: 2 },
];

const ATTENDANCE_TREND = [
  { week: "Wk 1", grade9: 97, grade10: 94, grade11: 91 },
  { week: "Wk 2", grade9: 96, grade10: 93, grade11: 90 },
  { week: "Wk 3", grade9: 95, grade10: 91, grade11: 89 },
  { week: "Wk 4", grade9: 96, grade10: 88, grade11: 87 },
];

const PATTERNS = [
  {
    label: "Grade 10 attendance dipping",
    trend: "warning" as const,
    detail: "Down from 94% to 88% over 4 weeks",
  },
  {
    label: "Grade 11 GPA improving",
    trend: "success" as const,
    detail: "Up 0.2 points this term",
  },
  {
    label: "Science consistently above benchmark",
    trend: "success" as const,
    detail: "78% vs district 75%",
  },
];

export default function DistrictPatterns() {
  return (
    <PageLayout width="wide">
      <PageHeader
        title="Patterns"
        subtitle="Attendance trends and grade distribution across Lincoln High"
      />

      <div className="space-y-5">
        {/* Notable patterns */}
        <SectionCard title="Notable Patterns">
          <div className="space-y-2" data-ocid="district_patterns.pattern_list">
            {PATTERNS.map((p) => (
              <div
                key={p.label}
                className="flex items-start gap-3 py-2"
                data-ocid={`district_patterns.pattern.${PATTERNS.indexOf(p) + 1}`}
              >
                <Badge variant={p.trend}>
                  {p.trend === "success" ? "\u2191" : "\u2193"}
                </Badge>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {p.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{p.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Attendance by grade */}
        <SectionCard title="Attendance by Grade (Weekly)">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={ATTENDANCE_TREND}
                margin={{ top: 4, right: 8, bottom: 4, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0 0)" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis domain={[80, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="grade9"
                  name="Grade 9"
                  stroke="oklch(0.55 0.2 220)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="grade10"
                  name="Grade 10"
                  stroke="oklch(0.55 0.2 270)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="grade11"
                  name="Grade 11"
                  stroke="oklch(0.55 0.2 140)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        {/* Grade distribution */}
        <SectionCard title="Grade Distribution">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={GRADE_DIST}
                margin={{ top: 4, right: 8, bottom: 4, left: 0 }}
              >
                <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar
                  dataKey="count"
                  name="Students"
                  fill="oklch(0.55 0.2 270)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>
    </PageLayout>
  );
}
