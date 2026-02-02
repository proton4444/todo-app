# To-Do List Web App Architecture

## 1. Technology Stack Recommendation

Focus on simplicity, serverless architecture, and seamless Vercel integration:

- **Frontend Framework**: Next.js 14 (App Router) – Vercel's native framework. Supports static rendering, server-side rendering (SSR), and API routes in one repo.
- **Backend**: Next.js API Routes – No separate backend server needed. Serverless functions auto-scale on Vercel.
- **Database**: Vercel Postgres – Fully managed, serverless PostgreSQL. Branching for previews, scales to zero.
- **ORM**: Prisma – Type-safe database client with excellent Vercel integration (edge-compatible).
- **Authentication**: Auth.js (formerly NextAuth.js) – Built-in support for credentials, OAuth (Google/GitHub), and JWT sessions. Vercel Edge Runtime compatible.
- **UI/Styling**: Tailwind CSS + shadcn/ui – Rapid, customizable components.
- **State Management**: React Query (TanStack Query) – For optimistic updates, caching, and API synchronization.
- **Other**: Zod for validation, Lucide React for icons.

**Why this stack?**
- Single repo deployment to Vercel.
- Zero-config serverless scaling.
- Edge Runtime for low-latency global deploys.
- Total setup time: ~1 hour.

No separate backend or complex infra required.

## 2. System Architecture Diagram

```mermaid
graph TD
    subgraph Vercel["Vercel Edge Network"]
        User[User Browser]
        NextApp[Next.js App<br/>(Static + SSR + API Routes)]
        Auth[Auth.js<br/>JWT/Session]
        DB[Vercel Postgres<br/>Prisma ORM]
    end
    
    User -->|HTTPS| NextApp
    NextApp --> Auth
    NextApp -->|Queries/Mutations| DB
    Auth -.->|Sessions| DB
    
    style Vercel fill:#ffeb3b
```

**Components**:
- **Client**: React components fetch data via API routes (or Server Components).
- **API Routes**: Handle CRUD, auth middleware.
- **Database**: Stores users and tasks.

## 3. Data Model

Simple relational model using Prisma schema:

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  tasks     Task[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Task {
  id          String   @id @default(cuid())
  title       String
  description String?
  completed   Boolean  @default(false)
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
}
```

**Fields Explanation**:
- **Task**: Minimal fields for to-do (expandable: priority, dueDate).
- User-owned tasks with cascading deletes.

## 4. API Design

RESTful API via Next.js API Routes (`app/api/tasks/route.ts`). Protected by Auth.js middleware.

| Method | Endpoint       | Description                  | Body/Params                  | Auth |
|--------|----------------|------------------------------|------------------------------|------|
| GET    | `/api/tasks`   | List user's tasks            | `?completed=true/false`     | Yes  |
| POST   | `/api/tasks`   | Create task                  | `{ title, description? }`   | Yes  |
| PUT    | `/api/tasks/[id]` | Update task               | `{ title?, completed?, ... }`| Yes  |
| DELETE | `/api/tasks/[id]` | Delete task               | -                            | Yes  |
| GET    | `/api/tasks/[id]` | Get single task            | -                            | Yes  |

**Example (TypeScript + Zod validation)**:
```ts
// POST /api/tasks
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error('Unauthorized');
  
  const data = taskSchema.parse(await req.json()); // Zod
  
  const task = await prisma.task.create({
    data: { ...data, userId: session.user.id }
  });
  return Response.json(task);
}
```

Uses Server Actions or React Query for client calls.

## 5. Deployment Strategy for Vercel

1. **Repo Setup**:
   - Create GitHub repo with Next.js + Prisma boilerplate.
   - Add `vercel.json` for routing/headers.

2. **Vercel Integration**:
   - Import repo to Vercel dashboard.
   - Auto-deploys on git push (main/preview branches).
   - Environment vars: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`.

3. **Database**:
   - Create Vercel Postgres via dashboard (`vcpg_...` connection string).
   - Run `npx prisma db push` locally, then `vercel env pull` for prod.

4. **Build & Deploy**:
   ```
   vercel --prod
   ```
   - Edge Runtime: Low latency (<50ms TTFB).
   - Preview URLs for PRs.
   - Custom domain via Vercel DNS.

5. **CI/CD**: GitHub Actions optional; Vercel handles builds.

**Total Cost**: Free tier sufficient (hobby project).

## 6. Security Considerations

- **Authentication**: JWT sessions with secure cookies (HttpOnly, Secure, SameSite=Strict). No client-side tokens.
- **Authorization**: Server-side checks (userId matching).
- **Data Validation**: Zod schemas for all inputs (prevent SQLi/XSS).
- **CORS**: Vercel auto-handles; restrict origins.
- **Rate Limiting**: Vercel Edge Config or Upstash Redis (add-on).
- **Secrets**: Env vars only; no hardcoding.
- **HTTPS**: Enforced by Vercel.
- **Database**: Row-level security via Prisma queries; no direct client access.
- **Headers**: Add CSP, X-Frame-Options via `next.config.js`.
- **Auditing**: Vercel Logs + Sentry for errors.
- **Common Risks Mitigated**: No SSR vulnerabilities (use Server Components), prepared statements via Prisma.

**Next Steps**: Clone a Next.js + Prisma + Auth template (e.g., from T3 Stack), customize for tasks.

**Technical Decisions Summary**:
- Fullstack Next.js for simplicity.
- Vercel Postgres for persistence.
- Multi-user ready with minimal overhead.
- Production-ready in <100 lines of core code.
