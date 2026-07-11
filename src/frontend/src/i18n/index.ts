export type Lang = "en" | "es";

const en = {
  "nav.today": "Today",
  "nav.gradebook": "Gradebook",
  "nav.attendance": "Attendance",
  "nav.behaviour": "Behaviour",
  "nav.classes": "Classes",
  "nav.assignments": "Assignments",
  "nav.curriculum": "Curriculum",
  "nav.messages": "Messages",
  "nav.reports": "Reports",
  "nav.handoff": "Handoff Log",
  "nav.grades": "Grades",
  "nav.schedule": "Schedule",
  "nav.children": "Children",
  "nav.events": "Events",
  "nav.slips": "Slips & Forms",
  "nav.conferences": "Conferences",
  "nav.dashboard": "Dashboard",
  "nav.enrolment": "Enrolment",
  "nav.staff": "Staff",
  "nav.timetables": "Timetables",
  "nav.settings": "Settings",
  "nav.data-privacy": "Data & Privacy",
  "nav.notification-matrix": "Notifications",
  "nav.department": "Department",
  "nav.teachers": "Teachers",
  "nav.curriculum-alignment": "Curriculum Alignment",
  "nav.morning-picture": "Morning Picture",
  "nav.needs-attention": "Needs Attention",
  "nav.district-dashboard": "District Dashboard",
  "nav.schools": "Schools",
  "nav.patterns": "Patterns",
  "nav.benchmarks": "Benchmarks",
  "nav.trends": "Trends",
  "nav.export": "Export",
  "nav.caseload": "Caseload",
  "nav.interventions": "Interventions",
  "nav.appointments": "Appointments",
  "nav.referrals": "Referrals",
  "nav.groups": "Groups",
  "nav.compliance-export": "Compliance Export",
  "nav.iep-caseload": "IEP Caseload",
  "nav.renewals": "Renewals",
  "nav.compliance": "Compliance",
  "nav.caseload-insight": "Caseload Insight",
  "nav.courses": "Courses",
  "nav.units": "Units",
  "nav.lessons": "Lessons",
  "nav.standards-map": "Standards Map",
  "nav.resource-library": "Resource Library",
  "nav.todays-classes": "Today's Classes",
  "nav.lesson-plans": "Lesson Plans",
  "nav.end-of-day": "End of Day",
  "nav.admin-inbox": "Admin Inbox",
  "nav.tools": "Tools",
  "action.save": "Save",
  "action.cancel": "Cancel",
  "action.edit": "Edit",
  "action.delete": "Delete",
  "action.view": "View",
  "action.add": "Add",
  "action.export": "Export",
  "action.submit": "Submit",
  "action.close": "Close",
  "action.retry": "Retry",
  "action.mark_present": "Mark Present",
  "action.mark_absent": "Mark Absent",
  "action.log_incident": "Log Incident",
  "action.add_grade": "Add Grade",
  "action.book_conference": "Book Conference",
  "status.present": "Present",
  "status.absent": "Absent",
  "status.excused": "Excused",
  "status.tardy": "Tardy",
  "status.logged": "Logged",
  "status.routed": "Routed",
  "status.under_review": "Under Review",
  "status.follow_up": "Follow-up",
  "status.closed": "Closed",
  "status.pending": "Pending",
  "status.due_soon": "Due Soon",
  "status.overdue": "Overdue",
  "status.completed": "Completed",
  "status.thriving": "Thriving",
  "status.steady": "Steady",
  "status.coasting": "Coasting",
  "status.slipping": "Slipping",
  "error.load_failed": "Failed to load data. Please try again.",
  "error.save_failed": "Failed to save. Please try again.",
  "error.network": "Network error. Check your connection.",
  "error.permission": "You do not have permission to view this.",
  "empty.students": "No students found",
  "empty.students.desc": "Students enrolled in this course will appear here.",
  "empty.incidents": "No incidents recorded",
  "empty.incidents.desc": "This is a good sign — no incidents on record.",
  "empty.messages": "No messages yet",
  "empty.messages.desc":
    "Start a conversation with any staff member or parent.",
  "empty.assignments": "No assignments yet",
  "empty.assignments.desc": "Create an assignment to get started.",
  "empty.commitments": "Nothing due",
  "empty.commitments.desc":
    "You're all caught up — no outstanding commitments.",
  "empty.signals": "Nothing needs you right now",
  "empty.signals.desc": "Everything looks good. This is a win.",
  "empty.courses": "No courses yet",
  "empty.courses.desc": "Add a course to begin building your curriculum.",
  "dev.role_switcher": "Dev Preview",
  "dev.switch_role": "Switch Role",
  "app.name": "EdUnite OS",
  "app.school": "Lincoln High School",
  "misc.loading": "Loading…",
  "misc.nothing_changed": "Nothing significant changed overnight.",
  "misc.all_clear": "You're up to date",
};

const es: Partial<typeof en> = {
  "nav.today": "Hoy",
  "nav.gradebook": "Calificaciones",
  "nav.attendance": "Asistencia",
  "nav.behaviour": "Comportamiento",
  "nav.classes": "Clases",
  "nav.assignments": "Tareas",
  "nav.curriculum": "Curr\u00edculo",
  "nav.messages": "Mensajes",
  "nav.reports": "Informes",
  "nav.handoff": "Registro de Traspaso",
  "nav.grades": "Notas",
  "nav.schedule": "Horario",
  "nav.children": "Mis Hijos",
  "nav.events": "Eventos",
  "nav.slips": "Permisos",
  "nav.conferences": "Conferencias",
  "nav.dashboard": "Panel",
  "nav.enrolment": "Matr\u00edcula",
  "nav.staff": "Personal",
  "nav.timetables": "Horarios",
  "nav.settings": "Configuraci\u00f3n",
  "nav.tools": "Herramientas",
  "action.save": "Guardar",
  "action.cancel": "Cancelar",
  "action.edit": "Editar",
  "action.delete": "Eliminar",
  "action.view": "Ver",
  "action.add": "Agregar",
  "action.export": "Exportar",
  "action.submit": "Enviar",
  "action.close": "Cerrar",
  "action.retry": "Reintentar",
  "status.present": "Presente",
  "status.absent": "Ausente",
  "status.excused": "Justificado",
  "status.tardy": "Tarde",
  "error.load_failed": "Error al cargar datos. Por favor intente de nuevo.",
  "error.save_failed": "Error al guardar. Por favor intente de nuevo.",
  "error.network": "Error de red. Verifique su conexi\u00f3n.",
  "error.permission": "No tiene permiso para ver esto.",
  "empty.students": "Sin estudiantes",
  "empty.students.desc":
    "Los estudiantes matriculados aparecer\u00e1n aqu\u00ed.",
  "empty.signals": "Nada requiere su atenci\u00f3n",
  "empty.signals.desc": "Todo se ve bien. Esto es una victoria.",
  "app.name": "EdUnite OS",
  "app.school": "Lincoln High School",
  "misc.loading": "Cargando…",
};

export type TranslationKey = keyof typeof en;

let currentLang: Lang =
  (typeof localStorage !== "undefined"
    ? (localStorage.getItem("edunite-lang") as Lang)
    : null) || "en";

export function getLang(): Lang {
  return currentLang;
}

export function setLang(lang: Lang) {
  currentLang = lang;
  if (typeof localStorage !== "undefined")
    localStorage.setItem("edunite-lang", lang);
}

export function t(key: string, lang?: Lang): string {
  const l = lang ?? currentLang;
  if (l === "es")
    return (
      (es as Record<string, string>)[key] ?? en[key as TranslationKey] ?? key
    );
  return en[key as TranslationKey] ?? key;
}

export function useTranslation() {
  return {
    t: (key: string) => t(key, currentLang),
    lang: currentLang,
    setLang,
  };
}
