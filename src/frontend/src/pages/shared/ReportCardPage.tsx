import { PageLayout } from "@/components/layout/PageLayout";
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
import { useReportCard, useStudentTranscript } from "@/hooks/backend/gradebook";
import { useStudent } from "@/hooks/backend/students";
import { useParams } from "@tanstack/react-router";
import { Printer } from "lucide-react";

const TERM = "Spring 2026";
const SCHOOL = "Lincoln High School";

const num = (x: unknown) => Number((x as number) ?? 0);

export default function ReportCardPage() {
  const params = useParams({ strict: false }) as { studentId?: string };
  const studentId = params.studentId || "";

  const { data: student } = useStudent(studentId);
  const { data: report, isLoading: loadingReport } = useReportCard(
    studentId,
    TERM,
  );
  const { data: transcript, isLoading: loadingTranscript } =
    useStudentTranscript(studentId);

  const studentName =
    transcript?.studentName ||
    (student ? `${student.firstName} ${student.lastName}` : studentId);

  return (
    <PageLayout>
      <div className="no-print mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display">
            Report Card &amp; Transcript
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {studentName} · {TERM}
          </p>
        </div>
        <Button
          type="button"
          onClick={() => window.print()}
          data-ocid="report_card.print"
        >
          <Printer className="h-4 w-4" aria-hidden /> Save as PDF
        </Button>
      </div>

      <div className="print-area mx-auto max-w-3xl space-y-8">
        {/* Letterhead */}
        <div className="border-b border-border pb-4 text-center">
          <h2 className="text-xl font-bold text-foreground font-display">
            {SCHOOL}
          </h2>
          <p className="text-sm text-muted-foreground">Report Card — {TERM}</p>
          <p className="mt-2 text-base font-semibold text-foreground">
            {studentName}
          </p>
          {student ? (
            <p className="text-xs text-muted-foreground">
              Grade {student.grade} · Homeroom {student.homeroom ?? "—"}
            </p>
          ) : null}
        </div>

        {/* Term grades */}
        <section>
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            Course Grades
          </h3>
          {loadingReport ? (
            <Skeleton className="h-32 w-full" />
          ) : !report || report.courseSummaries.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No grades recorded for this term.
            </p>
          ) : (
            <Table className="text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead className="w-20 text-center">Grade</TableHead>
                  <TableHead className="w-16 text-center">Letter</TableHead>
                  <TableHead>Comment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.courseSummaries.map((c: any) => (
                  <TableRow key={c.courseId}>
                    <TableCell className="font-medium text-foreground">
                      {c.courseName}
                    </TableCell>
                    <TableCell className="text-center">
                      {num(c.finalGrade).toFixed(1)}
                    </TableCell>
                    <TableCell className="text-center font-semibold">
                      {c.letterGrade}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {c.teacherComment || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </section>

        {/* Attendance + behaviour */}
        {report ? (
          <section className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="mb-2 text-sm font-semibold text-foreground">
                Attendance
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Present: {num(report.attendanceSummary.present)}</li>
                <li>Absent: {num(report.attendanceSummary.absent)}</li>
                <li>Tardy: {num(report.attendanceSummary.tardy)}</li>
                <li className="text-foreground font-medium">
                  Rate: {Math.round(num(report.attendanceSummary.rate))}%
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold text-foreground">
                Behaviour
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Incidents: {num(report.behaviourSummary.incidents)}</li>
                <li>
                  Follow-ups complete:{" "}
                  {num(report.behaviourSummary.followUpsComplete)}
                </li>
              </ul>
            </div>
          </section>
        ) : null}

        {/* Transcript */}
        <section>
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            Academic Transcript
          </h3>
          {loadingTranscript ? (
            <Skeleton className="h-32 w-full" />
          ) : !transcript || transcript.terms.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No transcript history available.
            </p>
          ) : (
            <>
              <p className="mb-3 text-sm">
                Cumulative GPA:{" "}
                <span className="font-semibold text-foreground">
                  {num(transcript.cumulativeGpa).toFixed(2)}
                </span>{" "}
                · Total credits:{" "}
                <span className="font-semibold text-foreground">
                  {num(transcript.totalCredits)}
                </span>
              </p>
              {transcript.terms.map((t: any) => (
                <div key={t.term} className="mb-4">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">
                    {t.term} · GPA {num(t.termGpa).toFixed(2)}
                  </p>
                  <Table className="text-sm">
                    <TableBody>
                      {t.courses.map((c: any) => (
                        <TableRow key={c.courseId}>
                          <TableCell className="text-foreground">
                            {c.courseName}
                          </TableCell>
                          <TableCell className="w-16 text-center font-semibold">
                            {c.letterGrade}
                          </TableCell>
                          <TableCell className="w-20 text-right text-muted-foreground">
                            {num(c.credits)} cr
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </>
          )}
        </section>
      </div>
    </PageLayout>
  );
}
