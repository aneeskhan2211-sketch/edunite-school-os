import {
  PageHeader,
  PageLayout,
  SectionCard,
} from "@/components/layout/PageLayout";
import { EmptyState } from "@/components/ui/EmptyState";
import { TrendIndicator } from "@/components/ui/TrendIndicator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCourses } from "@/hooks/backend/courses";
import { useGradebookSummary } from "@/hooks/backend/gradebook";
import { useStudents } from "@/hooks/backend/students";
import { useRoleStore } from "@/store/roleStore";
import { BookOpen } from "lucide-react";
import { useState } from "react";

export default function CoTeacherGradebook() {
  const { currentUser } = useRoleStore();
  const { data: courses } = useCourses(currentUser?.id);
  const [courseId, setCourseId] = useState("");
  const cid = courseId || courses?.[0]?.id || "";
  const { data: summary, isLoading } = useGradebookSummary(cid);
  const { data: students } = useStudents();
  const getStudent = (id: string) => students?.find((s) => s.id === id);

  return (
    <PageLayout width="wide">
      <PageHeader
        title="Gradebook (Contribution)"
        subtitle="Your grading contribution — lead teacher owns the final record"
      />
      <div className="flex gap-2 mb-5">
        {courses?.map((c, i) => (
          <Button
            key={c.id}
            type="button"
            size="sm"
            variant={cid === c.id ? "default" : "outline"}
            onClick={() => setCourseId(c.id)}
            data-ocid={`co_gradebook.course_tab.${i + 1}`}
          >
            {c.name}
          </Button>
        ))}
      </div>
      {isLoading ? (
        <Skeleton rows={5} rowHeight="h-10" />
      ) : !summary ? (
        <EmptyState icon={BookOpen} title="Select a course" />
      ) : (
        <SectionCard title="Student Contributions">
          <Table>
            <TableHeader className="bg-muted/60">
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead className="text-right">Grade</TableHead>
                <TableHead>Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.studentSummaries.map((ss, i) => {
                const s = getStudent(ss.studentId);
                return (
                  <TableRow
                    key={ss.studentId}
                    data-ocid={`co_gradebook.row.${i + 1}`}
                  >
                    <TableCell>
                      {s ? `${s.firstName} ${s.lastName}` : ss.studentId}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={
                          ss.letterGrade.startsWith("A") ? "success" : "neutral"
                        }
                      >
                        {ss.letterGrade}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <TrendIndicator trend={ss.trend} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </SectionCard>
      )}
    </PageLayout>
  );
}
