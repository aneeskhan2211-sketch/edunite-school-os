import {
  PageHeader,
  PageLayout,
  SectionCard,
} from "@/components/layout/PageLayout";
import { KPICard } from "@/components/ui/KPICard";
import { Badge } from "@/components/ui/badge";
import { useDistrictHealthSummary } from "@/hooks/backend/dashboards";
import { useStudents } from "@/hooks/backend/students";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const BENCHMARKS = [
  { subject: "Math", lincoln: 74, district: 72 },
  { subject: "Reading", lincoln: 71, district: 68 },
  { subject: "Science", lincoln: 78, district: 75 },
];

const SCHOOLS = [
  { name: "Lincoln High", students: 0, healthScore: 82, grade: "B+" },
];

export default function DistrictDashboard() {
  const { data: students } = useStudents();
  const { data: summary } = useDistrictHealthSummary();

  const avgGpa = summary ? summary.averageGPA.toFixed(2) : "—";
  const avgAttendance = summary ? Math.round(summary.attendanceRate) : 0;
  const enrollment = summary ? Number(summary.enrollmentCount) : 0;

  return (
    <PageLayout width="wide">
      <PageHeader
        title="District Dashboard"
        subtitle="Cross-school health, benchmarks, and patterns"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <KPICard label="Schools" value={1} />
        <KPICard label="Students" value={enrollment} />
        <KPICard label="Avg GPA" value={avgGpa} />
        <KPICard
          label="Avg Attendance"
          value={`${avgAttendance}%`}
          trend="stable"
        />
      </div>

      {/* School health scores */}
      <SectionCard title="School Health Scores" className="mb-5">
        <div
          className="divide-y divide-border"
          data-ocid="district_dashboard.school_list"
        >
          {SCHOOLS.map((school, i) => (
            <div
              key={school.name}
              className="py-4 flex items-center justify-between"
              data-ocid={`district_dashboard.school.${i + 1}`}
            >
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {school.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {students?.length ?? 0} students
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-foreground font-display">
                  {school.healthScore}
                </span>
                <Badge variant="success">{school.grade}</Badge>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Benchmark comparison */}
      <SectionCard title="Benchmark Comparison: Lincoln vs District">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={BENCHMARKS}
              margin={{ top: 4, right: 8, bottom: 4, left: 0 }}
            >
              <XAxis dataKey="subject" tick={{ fontSize: 12 }} />
              <YAxis domain={[60, 90]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar
                dataKey="lincoln"
                name="Lincoln High"
                fill="oklch(0.55 0.2 270)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="district"
                name="District Avg"
                fill="oklch(0.75 0.1 270)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>
    </PageLayout>
  );
}
