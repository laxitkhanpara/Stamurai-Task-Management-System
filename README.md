# Stamurai-Task-Management-System
A full-stack web application for small teams to manage tasks efficiently. Built with Next.js (frontend), Node.js (Express,backend), and MongoDB(database). Features include user authentication, task assignment, team collaboration, real-time notifications, search/filtering, and a personalized dashboard.

# 📝 TaskFlow - Team Task Management System

TaskFlow is a full-stack task management application built for small teams to collaborate efficiently. It enables users to create, assign, track, and manage tasks with features like authentication, dashboards, filters, and more.

## 🚀 Tech Stack

| Layer        | Technology           |
|--------------|----------------------|
| Frontend     | Next.js              |
| Backend      | Node.js (Express/NestJS) |
| Database     | MongoDB or PostgreSQL |
| Deployment   | Vercel (Frontend), Render/Railway (Backend) |
| Auth         | JWT-based Authentication |
| Styling      | Tailwind CSS / CSS Modules |
| Notifications| (Optional) WebSockets (Socket.IO) |

---

## ✨ Features

- 🔐 **User Authentication** (Register/Login with secure password hashing)
- 📋 **Task CRUD**: Create, Read, Update, Delete tasks
- 👥 **Assign Tasks**: Assign to other registered users
- 🔔 **Notifications**: Alert when a task is assigned (optional real-time)
- 📊 **Dashboard**:
  - Tasks assigned to the user
  - Tasks created by the user
  - Overdue tasks
- 🔍 **Search & Filter**:
  - Search by title or description
  - Filter by status, priority, or due date

---

## 📦 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/taskflow.git
cd taskflow




Breakdown of feat(server):
feat: This is the type of change. Common types include:

feat: a new feature

fix: a bug fix

chore: tooling or maintenance (not user-facing)

docs: documentation-only changes

style: formatting, linting, etc. (no code changes)

refactor: code refactoring (not adding features or fixing bugs)

test: adding or editing tests

(server): This is the scope — the specific part of the codebase affected. In your case, it means the server or backend logic.

: message: The message that describes what the commit does.