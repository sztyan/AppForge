import type { FormSchema } from "./types";

export const DEFAULT_FORM_SCHEMA: FormSchema = {
  title: "Employee Registration",
  description: "Fill out the form below to register a new employee.",
  version: "1.0.0",
  layout: "form",
  fields: [
    {
      name: "fullName",
      label: "Full Name",
      type: "text",
      placeholder: "John Doe",
      required: true,
    },
    {
      name: "email",
      label: "Work Email",
      type: "email",
      placeholder: "john@company.com",
      required: true,
    },
    {
      name: "department",
      label: "Department",
      type: "select",
      required: true,
      options: ["Engineering", "Design", "Marketing", "HR", "Finance"],
    },
    {
      name: "yearsExp",
      label: "Years of Experience",
      type: "number",
      min: 0,
      max: 50,
      required: true,
    },
    {
      name: "bio",
      label: "Short Bio",
      type: "textarea",
      placeholder: "Tell us about yourself…",
      helpText: "Max 500 characters.",
    },
    {
      name: "terms",
      label: "I agree to the terms and conditions",
      type: "checkbox",
      required: true,
    },
  ],
  workflow: {
    onSubmit: [
      { id: "store", type: "store", enabled: true },
      { id: "notify", type: "notify", enabled: true, config: { message: "Registration received!" } },
    ],
  },
  i18n: {
    defaultLocale: "en",
    locales: {
      en: {
        title: "Employee Registration",
        description: "Fill out the form below to register a new employee.",
      },
      es: {
        title: "Registro de Empleados",
        description: "Complete el formulario para registrar un nuevo empleado.",
        fields: {
          fullName: { label: "Nombre Completo", placeholder: "Juan Pérez" },
          email: { label: "Correo Laboral", placeholder: "juan@empresa.com" },
          department: { label: "Departamento" },
          yearsExp: { label: "Años de Experiencia" },
          bio: { label: "Biografía Corta" },
          terms: { label: "Acepto los términos y condiciones" },
        },
      },
    },
  },
};

export const DASHBOARD_EXAMPLE_SCHEMA: FormSchema = {
  title: "Operations Dashboard",
  description: "Metadata-driven dashboard with forms, tables, and stats.",
  version: "1.0.0",
  layout: "dashboard",
  fields: [
    { name: "ticketId", label: "Ticket ID", type: "text", required: true },
    { name: "priority", label: "Priority", type: "select", options: ["Low", "Medium", "High"], required: true },
    { name: "notes", label: "Notes", type: "textarea" },
  ],
  tables: [
    {
      id: "tickets",
      title: "Open Tickets",
      csvImport: true,
      columns: [
        { key: "ticketId", label: "Ticket ID", type: "text" },
        { key: "priority", label: "Priority", type: "badge" },
        { key: "status", label: "Status", type: "text" },
      ],
      data: [
        { ticketId: "TKT-001", priority: "High", status: "Open" },
        { ticketId: "TKT-002", priority: "Medium", status: "In Progress" },
      ],
    },
  ],
  dashboard: {
    columns: 2,
    widgets: [
      { id: "stats", type: "stats", title: "Total Fields", statLabel: "Configured Fields", span: 1 },
      { id: "ticket-form", type: "form", title: "New Ticket", fieldNames: ["ticketId", "priority", "notes"], span: 1 },
      { id: "ticket-table", type: "table", title: "Ticket Queue", tableId: "tickets", span: 2 },
    ],
  },
  workflow: {
    onSubmit: [
      { id: "log", type: "log", enabled: true },
      { id: "notify", type: "notify", enabled: true, config: { message: "Ticket workflow triggered" } },
    ],
  },
};

export const DEFAULT_SCHEMA_JSON = JSON.stringify(DEFAULT_FORM_SCHEMA, null, 2);
export const DASHBOARD_SCHEMA_JSON = JSON.stringify(DASHBOARD_EXAMPLE_SCHEMA, null, 2);
