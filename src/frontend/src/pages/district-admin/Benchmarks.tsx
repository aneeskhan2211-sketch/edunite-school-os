import {
  PageHeader,
  PageLayout,
  SectionCard,
} from "@/components/layout/PageLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const BENCHMARK_DATA = [
  { subject: "Mathematics", lincoln: 74, district: 72 },
  { subject: "Reading", lincoln: 71, district: 68 },
  { subject: "Science", lincoln: 78, district: 75 },
];

const YOY_TRENDS = [
  { year: "2023-24", math: 71, reading: 69, science: 75 },
  { year: "2024-25", math: 73, reading: 70, science: 77 },
  { year: "2025-26", math: 74, reading: 71, science: 78 },
];

export default function DistrictBenchmarks() {
  return (
    <PageLayout width="wide">
      <PageHeader
        title="Benchmarks"
        subtitle="Lincoln High vs. district averages — year over year"
        actions={
          <Button
            size="default"
            variant="secondary"
            data-ocid="district_benchmarks.export_button"
          >
            <Download className="h-4 w-4" aria-hidden /> Export CSV
          </Button>
        }
      />

      <div className="space-y-5">
        {/* Current year comparison */}
        <SectionCard title="2025–26: Lincoln High vs District Average">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={BENCHMARK_DATA}
                margin={{ top: 4, right: 8, bottom: 4, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0 0)" />
                <XAxis dataKey="subject" tick={{ fontSize: 12 }} />
                <YAxis domain={[60, 90]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="lincoln"
                  name="Lincoln High"
                  fill="oklch(0.55 0.2 270)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="district"
                  name="District Avg"
                  fill="oklch(0.75 0.12 270)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Quick summary badges */}
          <div className="flex flex-wrap gap-2 mt-4">
            {BENCHMARK_DATA.map((b) => (
              <div
                key={b.subject}
                className="rounded-lg border border-border bg-background px-3 py-2"
              >
                <p className="text-xs text-muted-foreground">{b.subject}</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">
                    {b.lincoln}%
                  </span>
                  <Badge
                    variant={b.lincoln >= b.district ? "success" : "warning"}
                  >
                    {b.lincoln >= b.district ? "+" : "−"}
                    {Math.abs(b.lincoln - b.district)} vs district
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Year-over-year */}
        <SectionCard title="Year-Over-Year Trends (Lincoln High)">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={YOY_TRENDS}
                margin={{ top: 4, right: 8, bottom: 4, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0 0)" />
                <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                <YAxis domain={[60, 85]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="math"
                  name="Math"
                  fill="oklch(0.55 0.2 270)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="reading"
                  name="Reading"
                  fill="oklch(0.55 0.2 140)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="science"
                  name="Science"
                  fill="oklch(0.55 0.2 220)"
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
