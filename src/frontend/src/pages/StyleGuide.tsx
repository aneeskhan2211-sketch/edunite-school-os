import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const BUTTON_VARIANTS = [
  "default",
  "secondary",
  "outline",
  "ghost",
  "destructive",
  "link",
] as const;
const COLOR_TOKENS = [
  ["primary", "bg-primary", "text-primary-foreground"],
  ["secondary", "bg-secondary", "text-secondary-foreground"],
  ["accent", "bg-accent", "text-accent-foreground"],
  ["muted", "bg-muted", "text-muted-foreground"],
  ["success", "bg-success", "text-success-foreground"],
  ["warning", "bg-warning", "text-warning-foreground"],
  ["info", "bg-info", "text-info-foreground"],
  ["destructive", "bg-destructive", "text-destructive-foreground"],
] as const;

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <Separator />
      {children}
    </section>
  );
}

export default function StyleGuide() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl space-y-12 px-6 py-12">
        <header className="space-y-2">
          <Badge variant="secondary">EdUnite Design System</Badge>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            Component Style Guide
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            The canonical EdUnite OS component set, rendered on a single page.
            This is the visual canvas for the premium / refined direction.
          </p>
        </header>

        <Section
          title="Typography"
          description="Plus Jakarta Sans display · Inter body"
        >
          <div className="space-y-3">
            <h1 className="font-display text-4xl font-bold tracking-tight">
              The quick brown fox
            </h1>
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              The quick brown fox jumps over the lazy dog
            </h2>
            <h3 className="font-display text-lg font-semibold">
              The quick brown fox jumps over the lazy dog
            </h3>
            <p className="text-base text-foreground">
              Body — The quick brown fox jumps over the lazy dog. 0123456789.
            </p>
            <p className="text-sm text-muted-foreground">
              Muted small — supporting copy, captions, and helper text.
            </p>
          </div>
        </Section>

        <Section
          title="Colour tokens"
          description="Semantic surfaces and their foregrounds"
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {COLOR_TOKENS.map(([name, bg, fg]) => (
              <div
                key={name}
                className={`flex h-20 flex-col justify-between rounded-lg border p-3 ${bg} ${fg}`}
              >
                <span className="text-xs font-medium capitalize">{name}</span>
                <span className="text-xs opacity-70">Aa</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Buttons" description="All variants, sizes, and states">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              {BUTTON_VARIANTS.map((v) => (
                <Button key={v} variant={v}>
                  {v}
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button disabled>Disabled</Button>
            </div>
          </div>
        </Section>

        <Section title="Badges">
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
          </div>
        </Section>

        <Section title="Form controls">
          <div className="grid max-w-md gap-4">
            <div className="space-y-2">
              <Label htmlFor="sg-name">Full name</Label>
              <Input id="sg-name" placeholder="Ada Lovelace" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sg-role">Role</Label>
              <Select>
                <SelectTrigger id="sg-role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="sg-check" />
              <Label htmlFor="sg-check">Send weekly summary</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="sg-switch" />
              <Label htmlFor="sg-switch">Enable notifications</Label>
            </div>
          </div>
        </Section>

        <Section title="Cards">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Attendance</CardTitle>
                <CardDescription>This week across all classes</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold tracking-tight">96.4%</p>
                <Progress value={96} className="mt-3" />
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm">
                  View report
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Roster</CardTitle>
                <CardDescription>Recently active students</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {["AL", "MK", "JS"].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{i}</AvatarFallback>
                    </Avatar>
                    <div className="text-sm">
                      <p className="font-medium text-foreground">Student {i}</p>
                      <p className="text-muted-foreground">
                        Grade 10 · Period 3
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </Section>

        <Section title="Alerts">
          <div className="space-y-3">
            <Alert>
              <AlertTitle>Heads up</AlertTitle>
              <AlertDescription>
                Report cards are due Friday at 5pm.
              </AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <AlertTitle>Action needed</AlertTitle>
              <AlertDescription>
                3 students fell below the attendance threshold this week.
              </AlertDescription>
            </Alert>
          </div>
        </Section>

        <Section title="Tabs">
          <Tabs defaultValue="overview" className="max-w-md">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="grades">Grades</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
            </TabsList>
            <TabsContent
              value="overview"
              className="pt-3 text-sm text-muted-foreground"
            >
              A calm summary of the class at a glance.
            </TabsContent>
            <TabsContent
              value="grades"
              className="pt-3 text-sm text-muted-foreground"
            >
              Grade distribution and recent assignments.
            </TabsContent>
            <TabsContent
              value="attendance"
              className="pt-3 text-sm text-muted-foreground"
            >
              Attendance trends and chronic-absence flags.
            </TabsContent>
          </Tabs>
        </Section>

        <Section title="Loading states">
          <div className="grid max-w-md gap-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-24 w-full" />
          </div>
        </Section>
      </div>
    </div>
  );
}
