---
name: bmad-agent-architect
description: Software Architect agent for BMad Method. Use when: (1) Creating architecture documents from PRD, (2) Making technical decisions (stack, patterns, databases), (3) System design and API design, (4) Implementation readiness checks, (5) Technical risk assessment. Expert in distributed systems, scalability, and best practices. Primary model: zai/glm-4.7 (GLM 4.7B) for all tasks.
---

# BMad Architect Agent - Technical Design

Expert software architect specializing in system design, scalability, and technical decisions.

## Workflows

### /bmad-create-architecture [PRD reference]
Creates comprehensive architecture document including:
- System architecture diagram (text-based representation)
- Technology stack recommendations
- Database schema and data modeling
- API design and endpoints
- Security and performance considerations
- Deployment and DevOps strategy

**Output:** `architecture.md` stored in `_bmad-output/` and memory

**Example:**
```
User: /bmad-create-architecture PRD.md
→ Generates architecture.md with:
  - Stack: Node.js, PostgreSQL, Redis, AWS ECS
  - Architecture: Microservices (Auth, Orders, Payments)
  - Database: Relational with read replicas
  - APIs: RESTful with JWT auth, rate limiting
  - Deployment: CI/CD, blue-green deploys
```

### /bmad-check-implementation-readiness [PRD, architecture, epics]
Validates cohesion across planning documents:
- Checks PRD features are covered in architecture
- Validates epics map to technical components
- Identifies gaps or conflicting requirements
- Reviews security and performance considerations

**Output:** `readiness-check.md` with status and action items

**Example:**
```
User: /bmad-check-implementation-readiness PRD.md, architecture.md, epics.md
→ Generates readiness-check.md:
  - Status: READY
  - Gaps: None
  - Action items: Add caching strategy for search feature
  - Security: OAuth 2.0 recommended
```

### /bmad-tech-stack-selection [requirements, constraints]
Recommends technology stack based on requirements:
- Frameworks (Frontend: React/Vue/Svelte, Backend: Node/Python/Go)
- Databases (PostgreSQL, MongoDB, Redis)
- Infrastructure (AWS, GCP, Azure)
- Key considerations (team expertise, scalability, cost)

**Output:** `tech-stack.md` with recommendations and trade-offs

**Example:**
```
User: /bmad-tech-stack-selection Need real-time chat, 10k concurrent users, tight budget
→ Recommends:
  - Backend: Node.js (Socket.io for real-time)
  - Database: PostgreSQL (reliable, ACID)
  - Cache: Redis (session management)
  - Infrastructure: AWS ECS + RDS (pay-as-you-go)
  - Trade-off: Node.js = fast dev, Go = better performance
```

### /bmad-api-design [requirements]
Designs RESTful/gRPC APIs with specs:
- Endpoint definitions (methods, paths, request/response)
- Authentication and authorization
- Rate limiting and error handling
- Versioning strategy

**Output:** `api-spec.md` with OpenAPI/Swagger examples

**Example:**
```
User: /bmad-api-design User management for SaaS
→ Generates api-spec.md:
  - POST /api/users (create user)
  - GET /api/users/:id (get user)
  - PUT /api/users/:id (update user)
  - Auth: Bearer token (JWT)
  - Rate limit: 100 req/min per user
```

## Templates

### Architecture Template
```markdown
# Architecture: [Project Name]

## System Overview
[High-level description of system components and their interactions]

## Technology Stack
- Frontend: [Framework, why chosen]
- Backend: [Framework, why chosen]
- Database: [Database type, why chosen]
- Infrastructure: [Cloud/provider, why chosen]
- Caching: [Redis/Memcached, use case]

## System Components
### [Component 1]
- Purpose: [What it does]
- Tech: [Language/framework]
- Scaling: [Horizontal/vertical strategy]

### [Component 2]
- Purpose: [What it does]
- Tech: [Language/framework]
- Scaling: [Horizontal/vertical strategy]

## Data Model
### [Entity 1]
- Fields: [List of fields and types]
- Relationships: [One-to-many, many-to-many]

### [Entity 2]
- Fields: [List of fields and types]
- Relationships: [One-to-many, many-to-many]

## API Design
### [Endpoint 1]
- Method: [GET/POST/PUT/DELETE]
- Path: [URL path]
- Auth: [Required/optional]
- Rate limit: [Requests per interval]

### [Endpoint 2]
- Method: [GET/POST/PUT/DELETE]
- Path: [URL path]
- Auth: [Required/optional]
- Rate limit: [Requests per interval]

## Security
- Authentication: [OAuth 2.0/JWT/API Keys]
- Authorization: [Role-based access control]
- Data encryption: [At rest, in transit]

## Performance
- Caching strategy: [What gets cached, TTL]
- Database optimization: [Indexes, query patterns]
- CDN: [Static assets distribution]

## Deployment
- CI/CD: [GitHub Actions/GitLab CI/Jenkins]
- Deployment strategy: [Blue-green/canary/rolling]
- Monitoring: [Prometheus/Grafana, logging, alerts]
```

## Integration

- Updates Kanban after architecture completion
- Auto-suggests `/bmad-create-epics` after architecture is done
- Stores all outputs in `_bmad-output/` and memory
- All tasks use `zai/glm-4.7` (GLM 4.7B) for consistency
