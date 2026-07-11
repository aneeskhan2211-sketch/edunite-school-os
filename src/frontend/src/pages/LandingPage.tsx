import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Brain,
  Calendar,
  Check,
  ChevronRight,
  Lock,
  Shield,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const ROLES = [
  "Teacher",
  "Co-teacher",
  "Student",
  "Parent",
  "School admin",
  "Counsellor",
  "SPED coordinator",
  "Principal",
  "District admin",
  "Department head",
  "Curriculum coordinator",
  "Substitute",
];

const MODULES = [
  {
    icon: BookOpen,
    title: "Gradebook & trajectory",
    description:
      "Live grades, weighted averages, and trajectory signals that surface which students are rising or falling before the final.",
  },
  {
    icon: Calendar,
    title: "Attendance & patterns",
    description:
      "Daily attendance with automatic pattern detection — chronic absence, tardy clusters, and threshold alerts.",
  },
  {
    icon: AlertTriangle,
    title: "Behaviour & commitments",
    description:
      "Incident reporting linked to consequences and follow-up commitments, tracked from open to closed.",
  },
  {
    icon: Brain,
    title: "IEP & counselling",
    description:
      "IEP renewals, counselling caseloads, and intervention logs in one connected record with compliance tracking.",
  },
];

const SIGNALS = [
  {
    label: "Risk",
    example: "Maya's Algebra grade dropped 12 points in two weeks.",
    bg: "bg-destructive/10",
    border: "border-destructive/30",
    text: "text-destructive",
    icon: AlertTriangle,
  },
  {
    label: "Opportunity",
    example: "Jordan is on track for an A if he turns in the final project.",
    bg: "bg-info/10",
    border: "border-info/30",
    text: "text-info",
    icon: TrendingUp,
  },
  {
    label: "Workload",
    example: "Grade 11 has three major assessments due the same week.",
    bg: "bg-warning/15",
    border: "border-warning/30",
    text: "text-warning",
    icon: Brain,
  },
  {
    label: "Celebration",
    example: "Priya earned a perfect score on the Chemistry midterm.",
    bg: "bg-success/10",
    border: "border-success/30",
    text: "text-success",
    icon: Check,
  },
];

const SCATTERED_TOOLS = [
  "Gradebook app",
  "Attendance sheet",
  "Behaviour log",
  "IEP binder",
  "Spreadsheets",
];

function DemoForm({ onClose }: { onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !schoolName.trim() || !email.trim()) {
      setError("All fields are required.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="rounded-xl border bg-card p-8 shadow-lg">
        <div className="flex items-center gap-3 text-success">
          <Check className="h-6 w-6" />
          <h3 className="text-lg font-semibold">Request received</h3>
        </div>
        <p className="mt-2 text-muted-foreground">
          Thanks, {name}. We'll be in touch at {email} to schedule your demo.
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={onClose}
          data-ocid="demo.close_button"
        >
          Close
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Request a demo</h3>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Close form"
          data-ocid="demo.close_button"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <Label htmlFor="demo-name" className="mb-1 block text-sm font-medium">
            Name
          </Label>
          <Input
            id="demo-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full"
            placeholder="Your name"
            data-ocid="demo.name_input"
          />
        </div>
        <div>
          <Label
            htmlFor="demo-school"
            className="mb-1 block text-sm font-medium"
          >
            School name
          </Label>
          <Input
            id="demo-school"
            type="text"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            className="w-full"
            placeholder="Lincoln High School"
            data-ocid="demo.school_input"
          />
        </div>
        <div>
          <Label
            htmlFor="demo-email"
            className="mb-1 block text-sm font-medium"
          >
            Email
          </Label>
          <Input
            id="demo-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full"
            placeholder="you@school.edu"
            data-ocid="demo.email_input"
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            className="bg-brand-deep text-white hover:bg-brand-darker"
            data-ocid="demo.submit_button"
          >
            Send request
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            data-ocid="demo.cancel_button"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function LandingPage() {
  const [showForm, setShowForm] = useState(false);

  const [activeSection, setActiveSection] = useState<string>("hero");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      {
        root: null,
        rootMargin: "-40% 0px -40% 0px",
        threshold: 0,
      },
    );

    const sections = ["hero", "modules", "roles", "privacy"];
    for (const id of sections) {
      const el = document.getElementById(id);
      if (el) {
        sectionRefs.current[id] = el;
        observer.observe(el);
      }
    }

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const navLinkClass = (id: string) =>
    `text-sm transition-colors duration-200 ${
      activeSection === id ? "text-white" : "text-white/80 hover:text-white"
    } ${activeSection === id ? "relative after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-[2px] after:rounded-full after:bg-white/80" : ""}`;

  return (
    <div className="snap-y snap-mandatory overflow-y-scroll scroll-smooth">
      {/* Sticky Nav */}
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-brand-deep/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 text-white">
            <Shield className="h-6 w-6" />
            <span className="font-display text-lg font-bold tracking-tight">
              EdUnite OS
            </span>
          </div>
          <div className="hidden items-center gap-6 md:flex">
            <Button
              type="button"
              variant="link"
              onClick={() => scrollTo("modules")}
              className={`h-auto p-0 ${navLinkClass("modules")}`}
              data-ocid="nav.product_link"
            >
              Product
            </Button>
            <Button
              type="button"
              variant="link"
              onClick={() => scrollTo("roles")}
              className={`h-auto p-0 ${navLinkClass("roles")}`}
              data-ocid="nav.roles_link"
            >
              Roles
            </Button>
            <Button
              type="button"
              variant="link"
              onClick={() => scrollTo("privacy")}
              className={`h-auto p-0 ${navLinkClass("privacy")}`}
              data-ocid="nav.privacy_link"
            >
              Privacy
            </Button>
            <a
              href="/teacher/today"
              className="text-sm text-white/80 hover:text-white"
              data-ocid="nav.signin_link"
            >
              Sign in
            </a>
            <a href="/teacher/today" data-ocid="nav.demo_button">
              <Button className="bg-white text-brand-deep hover:bg-white/90">
                Try the live demo
              </Button>
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section
        id="hero"
        className="relative flex min-h-screen snap-start items-center justify-center bg-brand-deep px-6 pt-20"
      >
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/60">
            K–12 School Operating System
          </p>
          <h1 className="font-display text-4xl font-extrabold leading-tight text-white md:text-6xl">
            A school that understands itself
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-white/80">
            Replace the tangle of gradebooks, attendance sheets, IEP binders,
            and spreadsheets with one connected system that knows every student
            and surfaces what needs your attention.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a href="/teacher/today" data-ocid="hero.demo_button">
              <Button className="bg-white px-6 py-3 text-base font-semibold text-brand-deep hover:bg-white/90">
                Try the live demo
              </Button>
            </a>
            <Button
              variant="outline"
              className="border-brand-mid bg-transparent px-6 py-3 text-base font-semibold text-brand-light hover:bg-brand-mid/20 hover:text-brand-light"
              onClick={() => setShowForm(true)}
              data-ocid="hero.request_button"
            >
              Request a demo
            </Button>
          </div>
          {showForm && (
            <div className="mt-8 flex justify-center">
              <div className="w-full max-w-md">
                <DemoForm onClose={() => setShowForm(false)} />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Problem */}
      <section
        id="problem"
        className="flex min-h-screen snap-start items-center bg-background px-6 py-20"
      >
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            Your school already knows. The knowledge is just scattered.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Staff are the human glue between disconnected tools. Every
            spreadsheet, binder, and app holds a piece of the picture — but no
            one sees the whole student.
          </p>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            {SCATTERED_TOOLS.map((tool) => (
              <span
                key={tool}
                className="relative inline-block rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground line-through"
              >
                {tool}
              </span>
            ))}
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
            <span className="inline-block rounded-full bg-brand-deep px-5 py-2 text-sm font-semibold text-white">
              One connected record
            </span>
          </div>
        </div>
      </section>

      {/* Understanding Layer */}
      <section
        id="understanding"
        className="flex min-h-screen snap-start items-center bg-muted/30 px-6 py-20"
      >
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center font-display text-3xl font-bold text-foreground md:text-4xl">
            It doesn't just store the data — it surfaces the decision.
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SIGNALS.map((s) => (
              <div
                key={s.label}
                className={`rounded-xl border ${s.border} ${s.bg} p-6`}
              >
                <div className="flex items-center gap-2">
                  <s.icon className={`h-5 w-5 ${s.text}`} />
                  <span className={`text-sm font-semibold ${s.text}`}>
                    {s.label}
                  </span>
                </div>
                <p className="mt-3 text-sm text-foreground">{s.example}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section
        id="roles"
        className="flex min-h-screen snap-start items-center bg-background px-6 py-20"
      >
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            One system. Every role sees its own view.
          </h2>
          <div className="mt-12 flex flex-wrap justify-center gap-3">
            {ROLES.map((role) => (
              <span
                key={role}
                className="rounded-full border border-coral-mid bg-coral-bg px-4 py-2 text-sm font-medium text-coral dark:border-coral-dark dark:bg-coral-dark/20 dark:text-coral-light"
              >
                {role}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Modules */}
      <section
        id="modules"
        className="flex min-h-screen snap-start items-center bg-muted/30 px-6 py-20"
      >
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center font-display text-3xl font-bold text-foreground md:text-4xl">
            Four core modules. One connected model.
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {MODULES.map((m) => (
              <div
                key={m.title}
                className="rounded-xl border bg-card p-6 shadow-sm transition-smooth hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-deep text-white">
                  <m.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                  {m.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {m.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section
        id="privacy"
        className="flex min-h-screen snap-start items-center bg-background px-6 py-20"
      >
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-deep text-white">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="mt-6 font-display text-3xl font-bold text-foreground md:text-4xl">
            Your school owns its data. Full stop.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Each school runs on its own isolated infrastructure. No central
            database. No cross-school pooling. No secondary use of student data.
            FERPA-safe, least-access by role.
          </p>
          <div className="mt-10 grid gap-4 text-left sm:grid-cols-2">
            {[
              "Isolated per-school infrastructure",
              "No cross-school data pooling",
              "No secondary use of student data",
              "FERPA-safe by design",
              "Least-access enforced by role",
              "Full audit trail on every record",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-coral dark:text-coral-light" />
                <span className="text-sm text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section
        id="cta"
        className="flex min-h-screen snap-start items-center bg-brand-deep px-6 py-20"
      >
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
            Bring your whole school into one place.
          </h2>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a href="/teacher/today" data-ocid="cta.demo_button">
              <Button className="bg-white px-6 py-3 text-base font-semibold text-brand-deep hover:bg-white/90">
                Try the live demo
              </Button>
            </a>
            <Button
              variant="outline"
              className="border-brand-mid bg-transparent px-6 py-3 text-base font-semibold text-brand-light hover:bg-brand-mid/20 hover:text-brand-light"
              onClick={() => setShowForm(true)}
              data-ocid="cta.request_button"
            >
              Request a demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="snap-start bg-muted/40 px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 text-foreground">
            <Shield className="h-5 w-5" />
            <span className="font-display font-semibold">EdUnite OS</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Built for schools · Owned by schools
          </p>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()}. Built with love using{" "}
            <a
              href="https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=edunite"
              className="underline"
              target="_blank"
              rel="noreferrer"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
