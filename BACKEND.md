# Backend Specification — Proji

Текущее состояние клиента: все операции с данными идут через `src/lib/api.ts` поверх **localStorage**. Цель — заменить этот слой на реальный HTTP API + WebSocket-канал, не меняя интерфейс вызовов на клиенте (или меняя минимально).

---

## Стек (рекомендация)

| Слой | Выбор |
|------|-------|
| Runtime | Node.js 20+ (или Bun) |
| Framework | Fastify (или Express) |
| ORM | Prisma + PostgreSQL |
| Auth | JWT (RS256) — токены выдаёт сам бэкенд после верификации NextAuth-сессии, **или** бэкенд становится провайдером и NextAuth убирается |
| WebSocket | `ws` библиотека (или socket.io если нужны fallbacks) |
| AI прокси | уже реализован в `/api/ai` — оставить в Next.js, или перенести сюда |

---

## Аутентификация и авторизация

### Роли

```
manager   — доступ ко всем доменам и ресурсам, управление пользователями
employer  — доступ только к разрешённым доменам (allowedDomains[])
```

### Схема авторизации

1. Клиент логинится через `POST /auth/login` (email + password + lobbyKey).
2. Бэкенд проверяет пароль (bcrypt), lobbyKey, возвращает `accessToken` (15 мин) + `refreshToken` (8 ч).
3. Каждый запрос к API содержит `Authorization: Bearer <accessToken>`.
4. Middleware проверяет токен и добавляет в контекст `{ userId, role, allowedDomains }`.
5. Домен-специфичные роуты проверяют: `role === 'manager' || allowedDomains.includes(domain)`.

### Эндпоинты

```
POST   /auth/login          { email, password, lobbyKey } → { accessToken, refreshToken, user }
POST   /auth/refresh        { refreshToken } → { accessToken }
POST   /auth/logout         { refreshToken } → 200
GET    /auth/me             → { id, email, name, role, allowedDomains }
```

---

## Модели данных (Prisma)

```prisma
model User {
  id             String   @id @default(cuid())
  email          String   @unique
  passwordHash   String
  lobbyKey       String
  name           String
  role           Role     @default(EMPLOYER)
  allowedDomains String[] // ["all"] для manager
  createdAt      DateTime @default(now())

  projects       ProjectMember[]
  tasks          Task[]
  inbox          InboxItem[]     @relation("InboxTo")
  sentInbox      InboxItem[]     @relation("InboxFrom")
  reports        Report[]
  docs           Doc[]
}

enum Role { MANAGER EMPLOYER }

// ── Projects ──────────────────────────────────────────────────

model Project {
  id                  String        @id @default(cuid())
  name                String
  description         String        @default("")
  status              ProjectStatus @default(PLANNING)
  framework           String        // "Agile"|"Waterfall"|"Lean"|"Scrum"|"Hybrid"
  deadline            DateTime?
  startDate           DateTime?
  progress            Int           @default(0)
  budget              String        @default("")
  spent               String        @default("")
  taskObjective       String        @default("")
  strategicGoal       String        @default("")
  originResearch      String        @default("")
  riskLevel           RiskLevel     @default(LOW)
  priority            Priority      @default(P2)
  stakeholder         String        @default("")
  roi                 String        @default("")
  milestones          String[]
  complianceStatus    String        @default("None")
  resourceUtilization Int           @default(0)
  qualityMetric       String        @default("")
  scalabilityIndex    Int           @default(0)
  createdById         String
  lastEditedById      String
  createdAt           DateTime      @default(now())
  updatedAt           DateTime      @updatedAt

  team                ProjectMember[]
  tasks               ProjectTask[]
  reports             Report[]
  docs                Doc[]
  frameworks          ProjectFramework?
}

enum ProjectStatus { PLANNING IN_PROGRESS ON_HOLD COMPLETED }
enum RiskLevel     { LOW MEDIUM HIGH CRITICAL }
enum Priority      { P0 P1 P2 P3 }

model ProjectMember {
  projectId String
  userId    String
  project   Project @relation(fields: [projectId], references: [id])
  user      User    @relation(fields: [userId], references: [id])
  @@id([projectId, userId])
}

model ProjectFramework {
  id              String  @id @default(cuid())
  projectId       String  @unique
  swot            Json?   // { strengths, weaknesses, opportunities, threats, authors }
  stakeholders    Json?   // [{ name, role, influence, interest }]
  painPoints      Json?   // [{ point, impact, status }]
  project         Project @relation(fields: [projectId], references: [id])
}

// ── Tasks (project-level) ─────────────────────────────────────

model ProjectTask {
  id            String      @id @default(cuid())
  projectId     String
  title         String
  description   String      @default("")
  status        TaskStatus  @default(NEW)
  priority      TaskPriority @default(MEDIUM)
  deadline      DateTime?
  urgent        Boolean     @default(false)
  checklist     Json        @default("[]") // [{ text, done }]
  attachments   Json        @default("[]") // [{ name, type }]
  assignedById  String?
  declineReason String?
  reportText    String?
  createdAt     DateTime    @default(now())

  project       Project     @relation(fields: [projectId], references: [id])
}

enum TaskStatus   { NEW ACCEPTED REVIEW DECLINED COMPLETED }
enum TaskPriority { LOW MEDIUM HIGH }

// ── Global Tasks ──────────────────────────────────────────────

model Task {
  id             String           @id @default(cuid())
  userId         String
  title          String
  description    String?
  status         GlobalTaskStatus @default(PENDING)
  priority       TaskPriority     @default(MEDIUM)
  dueDate        DateTime?
  assignee       String?          // имя исполнителя (пока свободная строка)
  checklist      Json             @default("[]") // [{ text: string, done: boolean }]
  relatedToType  String?          // "Проект"|"Клиент"|"Оборудование"|...
  relatedToName  String?
  tags           String[]
  createdAt      DateTime         @default(now())

  user           User             @relation(fields: [userId], references: [id])
}

enum GlobalTaskStatus { PENDING COMPLETED CANCELLED }

// ── Reports ───────────────────────────────────────────────────

model Report {
  id          String   @id @default(cuid())
  projectId   String
  authorId    String
  description String
  tasks       String[]
  duration    String
  createdAt   DateTime @default(now())

  project     Project  @relation(fields: [projectId], references: [id])
  author      User     @relation(fields: [authorId], references: [id])
}

// ── Docs ──────────────────────────────────────────────────────

model Doc {
  id        String   @id @default(cuid())
  projectId String
  authorId  String
  title     String
  content   String   @default("")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  project   Project  @relation(fields: [projectId], references: [id])
  author    User     @relation(fields: [authorId], references: [id])
}

// ── Admin Tasks (broadcast) ───────────────────────────────────

model AdminTask {
  id           String          @id @default(cuid())
  title        String
  description  String
  priority     TaskPriority    @default(MEDIUM)
  deadline     DateTime?
  targetDomain String          // имя домена или "all"
  assignedById String
  status       AdminTaskStatus @default(ACTIVE)
  createdAt    DateTime        @default(now())
}

enum AdminTaskStatus { ACTIVE ARCHIVED }

// ── Inbox ─────────────────────────────────────────────────────

model InboxItem {
  id         String        @id @default(cuid())
  fromId     String
  toId       String
  type       InboxType
  title      String
  body       String
  priority   TaskPriority  @default(MEDIUM)
  project    String?
  status     InboxStatus   @default(NEW)
  files      Json          @default("[]") // [{ name, type, size }]
  sentAt     DateTime      @default(now())

  from       User          @relation("InboxFrom", fields: [fromId], references: [id])
  to         User          @relation("InboxTo",   fields: [toId],   references: [id])
}

enum InboxType   { TASK EVENT NOTE }
enum InboxStatus { NEW ACCEPTED REJECTED NEEDS_CHANGES ARCHIVED }

// ── Domain Credentials ────────────────────────────────────────

model DomainCredential {
  id       String @id @default(cuid())
  name     String @unique  // "Финансы", "Маркетинг", ...
  key      String
  password String
}
```

---

## REST API — Эндпоинты

Все роуты, кроме `/auth/*`, требуют `Authorization: Bearer <token>`.  
Пагинация: `?page=1&limit=20` на list-роутах.

### Projects

```
GET    /projects                → Project[]
POST   /projects                { name, description, framework, ... } → Project
GET    /projects/:id            → Project (с team, frameworks)
PATCH  /projects/:id            { ...partial } → Project
DELETE /projects/:id            → 204
PATCH  /projects/:id/frameworks { swot?, stakeholders?, painPoints? } → ProjectFramework
```

### Project Tasks

```
GET    /projects/:pid/tasks              → ProjectTask[]
POST   /projects/:pid/tasks              { title, description, priority, deadline, urgent } → ProjectTask
PATCH  /projects/:pid/tasks/:id          { ...partial } → ProjectTask
DELETE /projects/:pid/tasks/:id          → 204
PATCH  /projects/:pid/tasks/:id/status   { status, declineReason?, reportText? } → ProjectTask
```

### Reports

```
GET    /projects/:pid/reports   → Report[]
POST   /projects/:pid/reports   { description, tasks[], duration } → Report
GET    /reports                 → Report[] (все проекты, только manager)
```

### Docs

```
GET    /projects/:pid/docs      → Doc[]
POST   /projects/:pid/docs      { title, content? } → Doc
PATCH  /projects/:pid/docs/:id  { title?, content? } → Doc
DELETE /projects/:pid/docs/:id  → 204
```

### Tasks (global)

```
GET    /tasks                                            → Task[] (фильтр по userId из токена)
GET    /tasks?status=pending&priority=high&overdue=true   → Task[] (опциональные фильтры)
POST   /tasks   { title, description?, priority, dueDate?, assignee?, checklist?, relatedToType?, relatedToName?, tags? } → Task
PATCH  /tasks/:id { status?, title?, description?, priority?, dueDate?, assignee?, checklist?, tags? } → Task
DELETE /tasks/:id                                        → 204
```

### Admin Tasks

```
GET    /admin/tasks             → AdminTask[] (manager only)
GET    /admin/tasks?domain=X    → AdminTask[] (employer — свой домен)
POST   /admin/tasks             { title, description, priority, deadline, targetDomain } → AdminTask (manager only)
PATCH  /admin/tasks/:id         { ...partial } → AdminTask (manager only)
DELETE /admin/tasks/:id         → 204 (manager only)
```

### Inbox

```
GET    /inbox                   → InboxItem[] (входящие текущего пользователя)
POST   /inbox                   { toId, type, title, body, priority, project?, files? } → InboxItem
PATCH  /inbox/:id/status        { status } → InboxItem
GET    /inbox/sent              → InboxItem[] (отправленные)
```

### Team / Users

```
GET    /users                   → User[] (manager: все; employer: своего домена)
GET    /users/:id               → User (профиль)
PATCH  /users/:id               { name?, allowedDomains? } → User (manager only)
```

### Domain Credentials

```
GET    /domains/credentials     → DomainCredential[] (manager only)
PATCH  /domains/:name           { key?, password? } → DomainCredential (manager only)
```

### Profile

```
GET    /me                      → User
PATCH  /me                      { name? } → User
```

---

## WebSocket

### Подключение

```
ws://host/ws?token=<accessToken>
```

Сервер верифицирует токен при handshake. При невалидном токене — `1008 Policy Violation`.

### Протокол сообщений

Все события — JSON-объекты:

```ts
// Клиент → Сервер
{ type: string; payload: unknown }

// Сервер → Клиент
{ type: string; payload: unknown; at: string /* ISO */ }
```

### События сервер → клиент

| Событие | Payload | Когда отправляется |
|---------|---------|-------------------|
| `inbox:new` | `InboxItem` | Кому-то пришёл новый элемент |
| `inbox:status_changed` | `{ id, status }` | Отправитель видит изменение статуса |
| `task:status_changed` | `{ projectId, taskId, status }` | Кто-то изменил статус задачи проекта |
| `project:updated` | `{ projectId, patch }` | Проект изменён другим пользователем |
| `notification` | `{ message, level }` | Системное уведомление (broadcast) |
| `admin_task:created` | `AdminTask` | Manager создал задачу для домена |

### Клиент → Сервер

| Событие | Payload | Когда отправляется |
|---------|---------|-------------------|
| `subscribe:project` | `{ projectId }` | Пользователь открыл страницу проекта |
| `unsubscribe:project` | `{ projectId }` | Пользователь покинул страницу проекта |
| `ping` | — | Keepalive (каждые 30 сек) |

### Комнаты (rooms)

- `project:<id>` — члены проекта получают live-обновления задач и статусов
- `domain:<name>` — пользователи домена получают `admin_task:created` и `notification`
- `user:<id>` — персональный канал (inbox, уведомления)

---

## Интеграция с клиентом

### Что изменить в `src/lib/api.ts`

Заменить все операции с `localStorage` на `fetch`:

```ts
// Было
function getAllProjects(): Project[] {
  return JSON.parse(localStorage.getItem('projects') ?? '[]')
}

// Станет
async function getAllProjects(): Promise<Project[]> {
  const r = await fetch('/api-proxy/projects', { headers: authHeader() })
  if (!r.ok) throw new Error(await r.text())
  return r.json()
}
```

Функция `authHeader()` берёт `accessToken` из cookie/localStorage и добавляет `Authorization`.

Бэкенд поднимается на отдельном порту (например, `3001`). В `next.config.ts` добавляется rewrite:

```ts
rewrites: async () => [
  { source: '/api-proxy/:path*', destination: 'http://localhost:3001/:path*' }
]
```

### WebSocket в клиенте

Добавить hook `useSocket()` в `src/hooks/`:

```ts
// При монтировании AppShell
const ws = new WebSocket(`ws://localhost:3001/ws?token=${accessToken}`)

ws.onmessage = (e) => {
  const { type, payload } = JSON.parse(e.data)
  switch (type) {
    case 'inbox:new':
      useAppStore.getState().addInboxItem(payload)
      toast(`Новое сообщение: ${payload.title}`)
      break
    case 'task:status_changed':
      // обновить задачу в store
      break
    case 'notification':
      toast(payload.message)
      break
  }
}
```

---

## Порядок реализации

1. **Auth** — `POST /auth/login`, `POST /auth/refresh`, middleware проверки токена
2. **Projects CRUD** — самый используемый ресурс (заменяет localStorage)
3. **Project Tasks** — воронка статусов (new → accepted → review → completed/declined)
4. **Inbox** — включая WebSocket событие `inbox:new`
5. **WebSocket сервер** — комнаты по проектам и доменам
6. **Admin Tasks** — broadcast от manager к домену
7. **Reports & Docs** — привязка к проектам
8. **Global Tasks** — простой CRUD
9. **Domain Credentials** — управление ключами доступа

---

## Переменные окружения (бэкенд)

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/proji
JWT_SECRET=<rs256-private-key>
JWT_PUBLIC=<rs256-public-key>
PORT=3001
GEMINI_API_KEY=...        # если AI-прокси переезжает на бэкенд
```
