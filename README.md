# SmartHR Nexus — AI Workforce Platform

AI-powered Human Resource Management System for enterprises supporting **5,000+ employees**.

![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20MongoDB%20%7C%20Gemini-6366f1?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## 🖥️ Project Overview

SmartHR Nexus is a state-of-the-art, full-stack HRMS with dedicated, role-based dashboards, real-time attendance tracking, payroll automation, candidate recruitment pipelines, and an advanced AI HR assistant (**ARIA**) powered by **Google Gemini**.

The platform is architected with React 18, Node.js, Express, MongoDB (Mongoose), Redis (for session management and caching), Socket.io (for real-time events), and Tailwind CSS for styling.

**Repository:** [github.com/adityakr1108/SmartHR-Nexus-AI-Workforce-Platform](https://github.com/adityakr1108/SmartHR-Nexus-AI-Workforce-Platform)

---

## 📸 Screenshots

### 🖥️ Admin Dashboard View
![Admin Dashboard](./screenshots/admin_dashboard.png)

### 🧑‍💻 Employee Dashboard View
![Employee Dashboard](./screenshots/employee_dashboard.png)

### 📅 Manager Leave Approvals View
![Manager Leave Approvals](./screenshots/manager_leaves.png)

### 🎯 HR Recruiter Candidate Pipeline View
![Candidate Pipeline](./screenshots/candidate_pipeline.png)

### 💬 ARIA — Floating AI HR Assistant View
![ARIA AI Assistant](./screenshots/aria_assistant.png)

---

## 👥 Role-Based Functionalities (Member Access Guide)

SmartHR Nexus implements a robust role-based access control (RBAC) system with 5 distinct roles. Each role is served a tailored dashboard and set of features:

### 1. 👑 Super Admin
* **System-wide Settings:** Access to global settings, theme preferences, active integrations, and system logs.
* **Access Control:** Promotes, demotes, or deactivates user accounts.
* **Infrastructure Management:** Monitors database and Redis connection health statistics.
* **Full CRUD Scope:** Holds override rights for all employee records, department structures, and financial logs.

### 2. 🛡️ Admin (HR Operations)
* **Employee Directory:** Perform CRUD operations on employee profiles (Add, Edit, View, and Soft Delete). Handles avatar uploads, education/experience logging, and skills tags.
* **Payroll Processing:** Calculates CTC, basic salaries, HRA, allowances, professional taxes, and PF deductions. Automates payslip generation (PDF format) and processes payouts.
* **Department Management:** Creates and manages organizational departments (Engineering, HR, Sales, Product, Marketing, Finance, Design, Operations), configures budgets, and assigns Department Heads.
* **Analytics & Reports:** Generates system-wide summaries, exportable attendance reports, and payroll histories.

### 3. 💼 Senior Manager
* **Team Dashboard:** Displays real-time attendance, daily check-in statuses, and overall performance ratings of direct reports.
* **Leave Approvals:** Real-time workflow (Approve/Decline) for team leave requests. Approving dynamically deducts from the employee's respective leave balance.
* **Performance Evaluations:** Submits quarterly/annual performance reviews, scores key metrics (technical, communication, teamwork, leadership, productivity), and triggers **AI Performance Insights** for recommendations.

### 4. 🎯 HR Recruiter
* **Job Listings:** Creates and manages public/internal job listings, outlining requirements, salary ranges, experience, and remote/hybrid work modes.
* **Visual Candidate Pipeline:** Interactive drag-and-drop pipeline board tracking applicants across 8 hiring stages (Applied, Screening, Shortlisted, HR Interview, Technical Interview, Offer Sent, Hired, Rejected).
* **AI Resume Screening:** Uploads PDF/Docx resumes and processes them through the **Gemini AI Engine**. Returns a compatibility score (0-100), key strengths, weaknesses, and a structured hiring recommendation.

### 5. 🧑‍💻 Employee (Self-Service)
* **Personal Dashboard:** View daily check-in times, upcoming leaves, pending performance reviews, and notifications.
* **Real-time Attendance:** One-click check-in and check-out tracking (Status: Present, Late, Absent, On Leave).
* **Leave Center:** Submits leave requests with date selectors and reason descriptions. Displays real-time balances for Annual, Sick, Casual, Maternity, Paternity, and Unpaid leaves.
* **My Payslips:** Securely view and download PDF payslips for previous pay cycles.
* **My Performance:** Completes self-assessments, views manager feedback, and tracks progress on personal goals.

---

## 🧠 Core System Concepts

### 1. AI Engine (Google Gemini Integration)
* **ARIA HR Chatbot:** A floating voice-and-text chatbot accessible from any dashboard. It provides answers to company policy questions, helps calculate leave balances, and interfaces with the database to retrieve user-specific information.
* **AI Resume Scorer:** Uses Gemini Flash/Pro to parse resumes, compare text against job descriptions, and output standard JSON evaluations (score, summary, strengths, weaknesses).
* **Performance Insights:** Generates actionable growth summaries and coaching points based on manager review scores.
* **Payroll Optimizer:** Recommends tax-efficient structures for allowances and deductions to optimize the employee's in-hand salary.

### 2. Security & Session Lifecycle
* **Dual-Token System:** Authenticates with a short-lived JSON Web Token (Access Token) passed via HTTP headers and a long-lived Refresh Token stored in a secure, `httpOnly` cookie.
* **Redis Token Blacklisting:** On sign-out, the user's access token is cached in Redis with a TTL matching the token expiry. Any subsequent request with a blacklisted token is rejected.
* **Account Lockout:** Locks accounts for 2 hours after 5 consecutive failed login attempts to prevent brute-force attacks.
* **Soft Delete:** The database uses schema pre-middlewares to automatically exclude records containing a `deletedAt` timestamp from standard query results.

### 3. Real-time Infrastructure (WebSockets)
* **Socket.IO Rooms:** Users are joined to rooms matching their role (`role:admin`, `role:senior_manager`, etc.) and individual ID (`user:<id>`).
* **Live Notifications:** Dispatches real-time pop-ups for attendance check-ins, leave submissions, and approval status changes.

---

## 📂 Project Structure

```
SmartHR/
├── frontend/                 # React 18 + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/       # Layouts, Sidebar, Header, AIAssistant
│   │   ├── pages/            # Auth, Admin, Manager, Recruiter, Employee pages
│   │   ├── store/            # Redux Toolkit slices (auth, ui, notifications)
│   │   └── services/         # Axios API Client + Gemini AI
│   └── vite.config.js
├── backend/                  # Node.js + Express REST API
│   ├── src/
│   │   ├── config/           # MongoDB Atlas, Upstash Redis
│   │   ├── controllers/      # Route controllers (auth, employee, leave, etc.)
│   │   ├── models/           # Mongoose schemas (User, Employee, Attendance, Leave)
│   │   ├── routes/           # Express routes
│   │   ├── middleware/       # JWT auth, rate limiter, security, error handling
│   │   ├── services/         # Gemini AI & Nodemailer SMTP services
│   │   └── utils/            # Winston logger, DB seeder, socket handlers
│   └── uploads/              # Local storage for avatars, resumes, documents
├── docker-compose.yml
└── package.json              # npm workspaces config
```

---

## 🚀 Quick Start

### Prerequisites
* Node.js 18+
* MongoDB 6+ (or Atlas connection string)
* Redis 7+ (or Upstash Redis)
* Google Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))

### 1. Clone and Install Dependencies
```bash
git clone https://github.com/adityakr1108/SmartHR-Nexus-AI-Workforce-Platform.git
cd SmartHR-Nexus-AI-Workforce-Platform

# Install root, frontend, and backend packages
npm run install:all
```

### 2. Configure Backend Environment
```bash
cd backend
cp .env.example .env
```
Open `backend/.env` and configure at minimum:
* `MONGODB_URI` — MongoDB connection string.
* `REDIS_URL` — Redis server URI.
* `JWT_SECRET` & `JWT_REFRESH_SECRET` — Long random strings.
* `GEMINI_API_KEY` — Your Gemini API Key.

### 3. Configure Frontend Environment
```bash
cd ../frontend
cp .env.example .env
```
* Keep `VITE_API_URL=/api/v1` for Vite proxies.
* Add your `VITE_GEMINI_API_KEY` for client-side chat widgets.

### 4. Run the Development Servers
From the repository root, run both servers concurrently:
```bash
npm run dev
# → Frontend: http://localhost:3000
# → Backend:  http://localhost:5000
```

### 5. Seed the Database
Seed mock departments, profiles, attendance records, payslips, leaves, and applications:
```bash
cd backend
node src/utils/seeder.js --reset
```

---

## 🔑 Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@demo.com` | `Admin@1234` |
| **Senior Manager** | `manager@demo.com` | `Manager@1234` |
| **HR Recruiter** | `hr@demo.com` | `HR@12345` |
| **Employee** | `employee@demo.com` | `Employee@1234` |

---

## 🛠️ API Reference

Base URL: `http://localhost:5000/api/v1`

### Authentication
* `POST /auth/login` — Sign in.
* `POST /auth/register` — Register a new account.
* `GET /auth/me` — Retrieve logged-in user profile.
* `POST /auth/logout` — Blacklist token and clear cookies.
* `POST /auth/refresh-token` — Rotate JWT access token.

### Employee Directory
* `GET /employees` — Fetch directory listing.
* `POST /employees` — Create new profile.
* `GET /employees/:id` — Get employee details.
* `PUT /employees/:id` — Update profile.
* `DELETE /employees/:id` — Soft-delete employee.

### Attendance Flow
* `POST /attendance/checkin` — Check-in.
* `POST /attendance/checkout` — Check-out.
* `GET /attendance/today` — Fetch today's check-in status.
* `GET /attendance` — History (filters: employeeId, date ranges).

### Leave Management
* `GET /leaves` — Fetch leaves history (filtered by employee).
* `POST /leaves` — Request a leave.
* `PATCH /leaves/:id/approve` — Approve request (Manager/Admin).
* `PATCH /leaves/:id/reject` — Decline request (Manager/Admin).

### Payroll Management
* `GET /payroll` — Fetch payroll logs.
* `POST /payroll/process` — Auto-calculate monthly salaries.
* `PATCH /payroll/:id/approve` — Approve payslip and lock database record.

### Recruitment & AI Screening
* `GET /recruitment/jobs` — Fetch job postings.
* `POST /recruitment/jobs` — Post job requirements.
* `POST /recruitment/applications` — Submit application with resume.
* `PATCH /recruitment/applications/:id/stage` — Update candidate stage.

---

## 🐳 Docker Deployment

To build and run the entire application containerized:
```bash
# Set production variables in .env
docker-compose up -d --build
```
* **Frontend:** [http://localhost](http://localhost)
* **Backend API:** [http://localhost:5000](http://localhost:5000)

---

## 📄 License
MIT © SmartHR Nexus 2026
