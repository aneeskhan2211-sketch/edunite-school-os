import {
  PageHeader,
  PageLayout,
  SectionCard,
} from "@/components/layout/PageLayout";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { StudentAvatar } from "@/components/ui/StudentAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useStaff } from "@/hooks/backend/students";
import type { Role } from "@/types";
import { Plus, Search, Users, X } from "lucide-react";
import { useState } from "react";

const ROLE_FILTERS = [
  "All",
  "Teacher",
  "Admin",
  "Counsellor",
  "SPED",
  "Dept Head",
];

const ROLE_MAP: Record<string, string> = {
  Teacher: "teacher",
  Admin: "schoolAdmin",
  Counsellor: "counsellor",
  SPED: "spedCoordinator",
  "Dept Head": "departmentHead",
};

const ROLE_BADGE_VARIANT: Record<
  string,
  "info" | "success" | "warning" | "neutral"
> = {
  teacher: "info",
  schoolAdmin: "neutral",
  counsellor: "success",
  spedCoordinator: "warning",
  departmentHead: "info",
};

export default function SchoolAdminStaff() {
  const { data: staff, isLoading } = useStaff();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    role: "teacher",
    department: "",
    email: "",
  });

  const filteredStaff =
    staff?.filter((s) => {
      const nameMatch = `${s.firstName ?? ""} ${s.lastName ?? ""}`
        .toLowerCase()
        .includes(search.toLowerCase());
      const roleMatch =
        roleFilter === "All" ||
        (s.roles ?? []).includes((ROLE_MAP[roleFilter] ?? "") as Role);
      return nameMatch && roleMatch;
    }) ?? [];

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <PageLayout width="wide">
      <PageHeader
        title="Staff"
        subtitle={`${staff?.length ?? 0} staff members`}
        actions={
          <Button
            size="default"
            onClick={() => setShowForm(!showForm)}
            data-ocid="school_admin_staff.add_staff_button"
          >
            <Plus className="h-4 w-4" aria-hidden /> Add staff member
          </Button>
        }
      />

      {/* Inline form */}
      {showForm && (
        <SectionCard title="Add New Staff Member" className="mb-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label
                htmlFor="staff-firstName"
                className="block text-xs font-medium text-muted-foreground mb-1"
              >
                First name
              </Label>
              <Input
                id="staff-firstName"
                value={form.firstName}
                onChange={(e) => updateForm("firstName", e.target.value)}
                className="w-full"
                data-ocid="school_admin_staff.first_name_input"
              />
            </div>
            <div>
              <Label
                htmlFor="staff-lastName"
                className="block text-xs font-medium text-muted-foreground mb-1"
              >
                Last name
              </Label>
              <Input
                id="staff-lastName"
                value={form.lastName}
                onChange={(e) => updateForm("lastName", e.target.value)}
                className="w-full"
                data-ocid="school_admin_staff.last_name_input"
              />
            </div>
            <div>
              <Label
                htmlFor="staff-role"
                className="block text-xs font-medium text-muted-foreground mb-1"
              >
                Role
              </Label>
              <Select
                value={form.role}
                onValueChange={(val) => updateForm("role", val)}
              >
                <SelectTrigger
                  id="staff-role"
                  className="w-full"
                  data-ocid="school_admin_staff.role_select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="counsellor">Counsellor</SelectItem>
                  <SelectItem value="sped">SPED</SelectItem>
                  <SelectItem value="departmentHead">Dept Head</SelectItem>
                  <SelectItem value="principal">Principal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label
                htmlFor="staff-department"
                className="block text-xs font-medium text-muted-foreground mb-1"
              >
                Department
              </Label>
              <Input
                id="staff-department"
                value={form.department}
                onChange={(e) => updateForm("department", e.target.value)}
                className="w-full"
                data-ocid="school_admin_staff.department_input"
              />
            </div>
            <div>
              <Label
                htmlFor="staff-email"
                className="block text-xs font-medium text-muted-foreground mb-1"
              >
                Email
              </Label>
              <Input
                id="staff-email"
                type="email"
                value={form.email}
                onChange={(e) => updateForm("email", e.target.value)}
                className="w-full"
                data-ocid="school_admin_staff.email_input"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              size="default"
              onClick={() => {
                setShowForm(false);
                setForm({
                  firstName: "",
                  lastName: "",
                  role: "teacher",
                  department: "",
                  email: "",
                });
              }}
              data-ocid="school_admin_staff.submit_button"
            >
              Submit
            </Button>
            <Button
              size="default"
              variant="secondary"
              onClick={() => setShowForm(false)}
              data-ocid="school_admin_staff.cancel_button"
            >
              <X className="h-4 w-4" aria-hidden /> Cancel
            </Button>
          </div>
        </SectionCard>
      )}

      {/* Role filter pills */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {ROLE_FILTERS.map((r) => (
          <Button
            key={r}
            type="button"
            size="sm"
            variant={roleFilter === r ? "default" : "outline"}
            onClick={() => setRoleFilter(r)}
            className="rounded-full"
            data-ocid={`school_admin_staff.role_filter.${r.toLowerCase().replace(/\s+/g, "_")}`}
          >
            {r}
          </Button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
          aria-hidden
        />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search staff…"
          className="w-full pl-9"
          data-ocid="school_admin_staff.search_input"
        />
      </div>

      <SectionCard title="Staff Directory">
        {isLoading ? (
          <Skeleton rows={5} rowHeight="h-12" />
        ) : !filteredStaff.length ? (
          <EmptyState icon={Users} title="No staff found" />
        ) : (
          <div
            className="divide-y divide-border"
            data-ocid="school_admin_staff.staff_list"
          >
            {filteredStaff.map((s, i) => (
              <div
                key={s.id}
                className="py-3 flex items-center justify-between"
                data-ocid={`school_admin_staff.staff.${i + 1}`}
              >
                <div className="flex items-center gap-3">
                  <StudentAvatar
                    name={`${s.firstName} ${s.lastName}`}
                    size="sm"
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {s.firstName} {s.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">{s.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {s.roles.map((r) => (
                    <StatusBadge
                      key={r}
                      variant={ROLE_BADGE_VARIANT[r] ?? "neutral"}
                      label={r}
                    />
                  ))}
                  <span className="text-xs text-muted-foreground">
                    {s.department ?? "—"}
                  </span>
                  <span className="text-xs text-muted-foreground">TBD</span>
                  <StatusBadge variant="success" label="Active" />
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-coral"
                  >
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </PageLayout>
  );
}
