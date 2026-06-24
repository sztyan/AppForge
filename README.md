# AppForge

AppForge is a metadata-driven application builder built with Next.js, TypeScript, Prisma, Neon PostgreSQL, and NextAuth Google OAuth. It enables teams to design, preview, and run dynamic forms, dashboards, workflows, and data-driven applications without writing extensive custom frontend code.

## Project Overview

AppForge transforms a JSON-based schema into a full application experience. Users can define data models, forms, tables, workflows, and runtime behavior in a visual builder, then publish and run the generated app instantly.

The platform is designed for rapid prototyping, internal tools, business workflows, and configurable data entry systems.

## Architecture

AppForge is structured around a schema-driven architecture:

- Frontend: Next.js App Router with TypeScript
- UI Builder: JSON schema editor and live preview workspace
- Runtime Renderer: renders forms, tables, and dashboards from schema definitions
- Data Layer: Prisma ORM with Neon PostgreSQL for persistent application and submission storage
- Authentication: NextAuth with Google OAuth for secure sign-in and user-scoped access
- API Layer: dynamic API generation for applications and their data endpoints

### Core Flow

1. Define an application schema in the builder.
2. Preview the generated experience in real time.
3. Publish or run the application in runtime mode.
4. Persist app data and submissions in PostgreSQL.
5. Authenticate users through Google OAuth and scope content to the signed-in user.

## Features

- Metadata-driven app generation
- JSON schema builder
- Live preview
- Runtime renderer
- Dashboard support
- Table support
- CSV import
- Multi-language support
- Workflow automation
- Dynamic API generation
- PostgreSQL persistence
- Google Authentication
- User-scoped application ownership and access control

## Tech Stack

- Next.js
- TypeScript
- Prisma
- Neon PostgreSQL
- NextAuth
- Google OAuth
- Tailwind CSS
- shadcn/ui

## Setup Instructions

### Prerequisites

- Node.js 20 or later
- npm, pnpm, or yarn
- A Neon PostgreSQL database
- A Google Cloud OAuth application

### Installation

```bash
git clone https://github.com/your-username/appforge.git
cd appforge
npm install
```

### Database Setup

Generate the Prisma client and push the schema:

```bash
npx prisma generate
npx prisma db push
```

Optional seed and migration helpers:

```bash
npm run db:seed
npm run db:migrate-json
```

### Run the Development Server

```bash
npm run dev
```

Open http://localhost:3000 to view the app.

## Environment Variables

Create a .env.local file in the project root with the following variables:

```env
DATABASE_URL=postgresql://<user>:<password>@<host>/<database>?sslmode=require
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-long-random-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Notes

- NEXTAUTH_SECRET should be a long random string.
- GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET come from your Google Cloud Console OAuth credentials.
- DATABASE_URL should point to your Neon PostgreSQL instance.

## Google OAuth Setup

1. Create a project in Google Cloud Console.
2. Enable the Google OAuth consent screen.
3. Create OAuth 2.0 Client ID credentials.
4. Add the following redirect URI:
   - http://localhost:3000/api/auth/callback/google
5. Copy the client ID and client secret into your environment variables.

## Screenshots

Screenshots will be added here as the product UI evolves.

Suggested areas to capture:
- Builder workspace
- Live preview mode
- Runtime renderer
- Application dashboard
- Authentication sign-in flow

## Future Improvements

Planned enhancements include:

- Improved role-based access control (RBAC)
- Advanced workflow execution and monitoring
- Richer component library and visual editing experiences
- Export/import of application definitions
- Audit logs and activity tracking
- Deployment templates for production hosting
- Better analytics and reporting dashboards

## License

This project is currently under active development. Add your preferred license file if you plan to distribute or reuse it publicly.
