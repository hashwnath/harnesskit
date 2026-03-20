# TaskFlow API — MVP Feature Spec

## User Stories

### Authentication
- As a developer, I can register with email/password so I can access the API
- As a developer, I can login with GitHub OAuth2 so I don't need another password
- As an API consumer, I receive JWT tokens so I can make authenticated requests

### Project Boards
- As a team lead, I can create a project board so my team has a shared workspace
- As a team lead, I can customize workflow columns so they match our process
- As a developer, I can view all my projects so I can switch between them

### Tasks
- As a developer, I can create tasks with priority, labels, and assignees
- As a developer, I can move tasks between columns to track progress
- As a developer, I can search tasks by keyword so I can find related work
- As a developer, I can add subtasks to break down complex work
- As a developer, I can see the activity log to understand task history

### Real-time
- As a team member, I see task updates in real-time without refreshing
- As a team member, I can see who else is viewing the board (presence)

## API Endpoints Summary

| Priority | Method | Path | Feature |
|----------|--------|------|---------|
| P0 | POST | `/auth/register` | Registration |
| P0 | POST | `/auth/login` | Login |
| P0 | POST | `/auth/refresh` | Token refresh |
| P0 | GET | `/auth/github` | OAuth2 |
| P0 | GET | `/projects` | List projects |
| P0 | POST | `/projects` | Create project |
| P0 | GET | `/projects/:id` | Get project |
| P0 | PATCH | `/projects/:id` | Update project |
| P0 | DELETE | `/projects/:id` | Soft-delete project |
| P0 | GET | `/projects/:id/tasks` | List tasks |
| P0 | POST | `/projects/:id/tasks` | Create task |
| P0 | GET | `/tasks/:id` | Get task |
| P0 | PATCH | `/tasks/:id` | Update task |
| P0 | PATCH | `/tasks/:id/move` | Move task |
| P0 | DELETE | `/tasks/:id` | Soft-delete task |
| P0 | WS | `/ws` | Real-time events |
| P1 | POST | `/github/webhook` | GitHub sync |
| P1 | GET | `/notifications` | Notification center |
