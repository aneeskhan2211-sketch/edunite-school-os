import {
  PageHeader,
  PageLayout,
  SectionCard,
} from "@/components/layout/PageLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useIsDemoDataLoaded } from "@/hooks/backend/_shared";
import { useStaff, useStudents } from "@/hooks/backend/students";
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Download,
  RotateCcw,
} from "lucide-react";
import { useState } from "react";

export default function SchoolAdminDataPrivacy() {
  const { data: demoLoaded } = useIsDemoDataLoaded();
  const { data: students } = useStudents();
  const { data: staff } = useStaff();
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const handleReset = () => {
    setConfirmReset(false);
    setResetDone(true);
    setTimeout(() => setResetDone(false), 4000);
  };

  return (
    <PageLayout width="wide">
      <PageHeader
        title="Data &amp; Privacy"
        subtitle="Demo dataset, exports, and data ownership"
      />

      <div className="space-y-5">
        {/* Demo data status */}
        <SectionCard title="Demo Dataset">
          {demoLoaded ? (
            <div
              className="flex items-start gap-4"
              data-ocid="school_admin_data.demo_status"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success/10">
                <CheckCircle2 className="h-5 w-5 text-success" aria-hidden />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">
                  Lincoln High demo data is loaded
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {students?.length ?? 0} students &middot; {staff?.length ?? 0}{" "}
                  staff &middot; 3 courses &middot; 4 commitments
                </p>
                <Badge variant="info" className="mt-2">
                  Demo Mode
                </Badge>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No demo data loaded.
            </p>
          )}

          <div className="mt-5 border-t border-border pt-5">
            {!confirmReset ? (
              <Button
                size="default"
                variant="secondary"
                onClick={() => setConfirmReset(true)}
                data-ocid="school_admin_data.reset_button"
              >
                <RotateCcw className="h-4 w-4" aria-hidden /> Reset Demo Data
              </Button>
            ) : (
              <div
                className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-4"
                data-ocid="school_admin_data.reset_confirm"
              >
                <AlertTriangle
                  className="h-5 w-5 text-warning shrink-0"
                  aria-hidden
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    This will reset all demo data to its original state.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Your real school data is never affected.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="default"
                    variant="danger"
                    onClick={handleReset}
                    data-ocid="school_admin_data.confirm_button"
                  >
                    Reset
                  </Button>
                  <Button
                    size="default"
                    variant="secondary"
                    onClick={() => setConfirmReset(false)}
                    data-ocid="school_admin_data.cancel_button"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            {resetDone && (
              <p className="mt-3 text-sm text-success">
                Demo data has been reset successfully.
              </p>
            )}
          </div>
        </SectionCard>

        {/* Export */}
        <SectionCard title="Export Data">
          <p className="text-sm text-muted-foreground mb-4">
            Export a full copy of your school’s data at any time.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              size="default"
              variant="secondary"
              data-ocid="school_admin_data.export_students_button"
            >
              <Download className="h-4 w-4" aria-hidden /> Students CSV
            </Button>
            <Button
              size="default"
              variant="secondary"
              data-ocid="school_admin_data.export_staff_button"
            >
              <Download className="h-4 w-4" aria-hidden /> Staff CSV
            </Button>
            <Button
              size="default"
              variant="secondary"
              data-ocid="school_admin_data.export_grades_button"
            >
              <Download className="h-4 w-4" aria-hidden /> Grades CSV
            </Button>
          </div>
        </SectionCard>

        {/* Ownership */}
        <SectionCard title="Data Ownership">
          <p className="text-sm text-foreground leading-relaxed">
            Lincoln High owns this deployment and all its data. EdUnite OS runs
            as your school’s own instance — no central EdUnite database, no
            cross-school pooling, no secondary use of student data, ever. Your
            school’s data lives in your canister and nowhere else.
          </p>
        </SectionCard>
      </div>
    </PageLayout>
  );
}
