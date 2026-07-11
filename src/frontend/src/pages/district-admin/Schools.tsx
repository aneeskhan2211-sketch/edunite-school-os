import {
  PageHeader,
  PageLayout,
  SectionCard,
} from "@/components/layout/PageLayout";
import { KPICard } from "@/components/ui/KPICard";
import { Badge } from "@/components/ui/badge";
import { useCourses } from "@/hooks/backend/courses";
import { useStaff, useStudents } from "@/hooks/backend/students";
import { School } from "lucide-react";
import { useState } from "react";

export default function DistrictSchools() {
  const { data: students } = useStudents();
  const { data: staff } = useStaff();
  const { data: courses } = useCourses();
  const [expanded, setExpanded] = useState(false);

  return (
    <PageLayout width="wide">
      <PageHeader title="Schools" subtitle="All schools in the district" />

      <div className="space-y-4">
        {/* Lincoln High card */}
        <div
          className="rounded-xl border border-border bg-card"
          data-ocid="district_schools.school.1"
        >
          <button
            type="button"
            className="w-full flex items-center justify-between p-5 text-left min-h-[44px]"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            data-ocid="district_schools.school_expand_button"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <School className="h-5 w-5 text-primary" aria-hidden />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Lincoln High School
                </p>
                <p className="text-xs text-muted-foreground">
                  {students?.length ?? 0} students · {staff?.length ?? 0} staff
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="success">Health: 82</Badge>
              <Badge variant="info">Active</Badge>
            </div>
          </button>

          {expanded && (
            <div className="border-t border-border p-5">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard label="Students" value={students?.length ?? 0} />
                <KPICard label="Staff" value={staff?.length ?? 0} />
                <KPICard label="Courses" value={courses?.length ?? 0} />
                <KPICard label="Health Score" value="82/100" trend="up" />
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Grade Distribution
                  </p>
                  {[9, 10, 11, 12].map((g) => {
                    const count =
                      students?.filter((s) => s.grade === g).length ?? 0;
                    return (
                      <div key={g} className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-foreground w-14">
                          Grade {g}
                        </span>
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{
                              width: `${(count / (students?.length || 1)) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-6">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
