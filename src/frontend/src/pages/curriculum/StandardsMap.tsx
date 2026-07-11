import {
  PageHeader,
  PageLayout,
  SectionCard,
} from "@/components/layout/PageLayout";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const STANDARDS = [
  {
    code: "CCSS.ELA-LITERACY.RI.9-10.1",
    description: "Cite textual evidence",
    covered: true,
  },
  {
    code: "CCSS.ELA-LITERACY.RI.9-10.2",
    description: "Determine central idea",
    covered: true,
  },
  {
    code: "CCSS.ELA-LITERACY.RI.9-10.5",
    description: "Analyze structure of text",
    covered: false,
  },
  {
    code: "CCSS.MATH.CONTENT.HSA.APR.A.1",
    description: "Perform polynomial operations",
    covered: true,
  },
  {
    code: "CCSS.MATH.CONTENT.HSA.CED.A.1",
    description: "Create equations in one variable",
    covered: true,
  },
  {
    code: "CCSS.MATH.CONTENT.HSF.TF.A.1",
    description: "Understand radian measure",
    covered: false,
  },
  {
    code: "NGSS.HS-LS1-1",
    description: "Construct an explanation for the role of DNA",
    covered: true,
  },
  {
    code: "NGSS.HS-LS3-2",
    description: "Apply concepts of probability to genetics",
    covered: false,
  },
  {
    code: "NGSS.HS-LS4-2",
    description:
      "Construct an explanation based on evidence for natural selection",
    covered: true,
  },
];

export default function StandardsMap() {
  const covered = STANDARDS.filter((s) => s.covered).length;
  const gap = STANDARDS.filter((s) => !s.covered).length;

  return (
    <PageLayout width="wide">
      <PageHeader
        title="Standards Map"
        subtitle={`${covered} standards covered · ${gap} gaps identified`}
      />
      <SectionCard>
        <Table className="text-sm" data-ocid="standards-map.table">
          <TableHeader>
            <TableRow>
              <TableHead>Standard Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Coverage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {STANDARDS.map((std, i) => (
              <TableRow key={std.code} data-ocid={`standards-map.row.${i + 1}`}>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {std.code}
                </TableCell>
                <TableCell className="text-foreground">
                  {std.description}
                </TableCell>
                <TableCell>
                  {std.covered ? (
                    <Badge variant="success">Covered</Badge>
                  ) : (
                    <Badge variant="warning">Gap</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </SectionCard>
    </PageLayout>
  );
}
