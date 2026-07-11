import {
  PageHeader,
  PageLayout,
  SectionCard,
} from "@/components/layout/PageLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Bell, Settings } from "lucide-react";
import { useState } from "react";

type Tier = "critical" | "important" | "informational";

const _TIERS: Tier[] = ["critical", "important", "informational"];
const TIER_BADGE: Record<Tier, "danger" | "warning" | "info"> = {
  critical: "danger",
  important: "warning",
  informational: "info",
};

const EVENTS = [
  {
    id: "grade_posted",
    label: "Grade posted",
    tier: "informational" as Tier,
    roles: ["student", "parent"],
  },
  {
    id: "attendance_flagged",
    label: "Attendance flagged",
    tier: "important" as Tier,
    roles: ["teacher", "counsellor", "parent"],
  },
  {
    id: "iep_due",
    label: "IEP renewal due",
    tier: "critical" as Tier,
    roles: ["spedCoordinator", "principal"],
  },
  {
    id: "incident_routed",
    label: "Incident routed",
    tier: "important" as Tier,
    roles: ["principal", "counsellor"],
  },
  {
    id: "conference_booked",
    label: "Conference booked",
    tier: "informational" as Tier,
    roles: ["teacher", "parent"],
  },
  {
    id: "commitment_due",
    label: "Commitment follow-up due",
    tier: "important" as Tier,
    roles: ["counsellor", "spedCoordinator"],
  },
  {
    id: "assignment_submitted",
    label: "Assignment submitted",
    tier: "informational" as Tier,
    roles: ["teacher"],
  },
];

export default function SchoolAdminSettings() {
  const [schoolName, setSchoolName] = useState("Lincoln High School");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <PageLayout width="wide">
      <PageHeader
        title="Settings"
        subtitle="School configuration, notifications, and preferences"
      />

      <div className="space-y-5">
        {/* School info */}
        <SectionCard title="School Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label
                className="block text-xs font-medium text-muted-foreground mb-1"
                htmlFor="school-name"
              >
                School Name
              </Label>
              <Input
                id="school-name"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full"
                data-ocid="school_admin_settings.school_name_input"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <Button
              size="default"
              onClick={handleSave}
              data-ocid="school_admin_settings.save_button"
            >
              Save Changes
            </Button>
            {saved && <span className="text-sm text-success">Saved!</span>}
          </div>
        </SectionCard>

        {/* Notification matrix */}
        <SectionCard title="Notification Matrix">
          <p className="text-xs text-muted-foreground mb-4">
            39 event types · 3 priority tiers · 12 roles
          </p>
          <Table aria-label="Notification matrix">
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Notified Roles</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody data-ocid="school_admin_settings.notification_matrix">
              {EVENTS.map((ev, i) => (
                <TableRow
                  key={ev.id}
                  data-ocid={`school_admin_settings.notification_row.${i + 1}`}
                >
                  <TableCell className="font-medium text-foreground">
                    {ev.label}
                  </TableCell>
                  <TableCell>
                    <Badge variant={TIER_BADGE[ev.tier]}>{ev.tier}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {ev.roles.map((r) => (
                        <Badge key={r} variant="neutral">
                          {r}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </SectionCard>
      </div>
    </PageLayout>
  );
}
