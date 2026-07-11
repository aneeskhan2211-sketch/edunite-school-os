import {
  PageHeader,
  PageLayout,
  SectionCard,
} from "@/components/layout/PageLayout";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";

type CoverageStatus = "covered" | "partial" | "gap";

interface StandardEntry {
  code: string;
  label: string;
  status: CoverageStatus;
}

const STANDARDS: StandardEntry[] = [
  { code: "NGSS.LS1", label: "From Molecules to Organisms", status: "covered" },
  { code: "NGSS.LS2", label: "Ecosystems", status: "covered" },
  { code: "NGSS.LS3", label: "Heredity", status: "partial" },
  { code: "NGSS.LS4", label: "Biological Evolution", status: "gap" },
  {
    code: "NGSS.ESS1",
    label: "Earth's Place in the Universe",
    status: "covered",
  },
  { code: "NGSS.ESS2", label: "Earth's Systems", status: "partial" },
  { code: "NGSS.PS1", label: "Matter and its Interactions", status: "covered" },
  { code: "NGSS.PS2", label: "Motion and Stability", status: "gap" },
];

const STATUS_BADGE: Record<CoverageStatus, "success" | "warning" | "danger"> = {
  covered: "success",
  partial: "warning",
  gap: "danger",
};

export default function DepartmentHeadCurriculumAlignment() {
  const covered = STANDARDS.filter((s) => s.status === "covered").length;
  const gaps = STANDARDS.filter((s) => s.status === "gap").length;

  return (
    <PageLayout>
      <PageHeader
        title="Curriculum Alignment"
        subtitle="Standards coverage map — Science Department"
      />

      <div className="flex gap-4 mb-5">
        <div className="rounded-lg border border-border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">Standards Covered</p>
          <p className="text-2xl font-bold text-foreground font-display">
            {covered}/{STANDARDS.length}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">Gaps Identified</p>
          <p className="text-2xl font-bold text-foreground font-display">
            {gaps}
          </p>
        </div>
      </div>

      <SectionCard title="Standards Coverage Map">
        <div
          className="divide-y divide-border"
          data-ocid="dept_head_alignment.standards_list"
        >
          {STANDARDS.map((std, i) => (
            <div
              key={std.code}
              className="py-3 flex items-center justify-between"
              data-ocid={`dept_head_alignment.standard.${i + 1}`}
            >
              <div>
                <p className="text-sm font-medium text-foreground">
                  {std.code}
                </p>
                <p className="text-xs text-muted-foreground">{std.label}</p>
              </div>
              <Badge variant={STATUS_BADGE[std.status]}>{std.status}</Badge>
            </div>
          ))}
        </div>
      </SectionCard>
    </PageLayout>
  );
}
