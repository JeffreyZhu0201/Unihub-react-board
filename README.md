# 🖥️ UniHub Web Board

![React Router](https://img.shields.io/badge/React_Router-v7-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![React](https://img.shields.io/badge/React-v19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

The comprehensive administrative dashboard for the **UniHub Campus Management System**. Built for **Counselors** and **Teachers** to manage organizations, monitor attendance, and streamline student requests.

---

## 🌟 Features

### 📊 Dashboard & Analytics
- **Data Screen**: Real-time intuitive overview of daily check-ins and student statuses.
- **Visual Statistics**: Interactive charts displaying attendance rates, leave trends, and anomaly detection.

### 🏢 Organization Management
- **Department Hub**: Counselors can create, manage, and monitor multiple departments.
- **Classroom Management**: Teachers can create classes and track student rosters.
- **Student Directory**: Detailed student lists with filtering access.

### 📍 Check-in Management (Dings)
- **Task Publishing**: Create geofenced Location checks or Dormitory checks with a few clicks.
- **Live Monitoring**: Track completion status in real-time.
- **Detailed Records**: Access full check-in logs including timestamps, GPS location, and status.

### 📝 Leave Workflow
- **Digital Approvals**: Streamlined audit process (Approve/Reject) for student leave requests.
- **Return Tracking**: Automatically monitor students eligible for return/销假.
- **History Logs**: Perpetual access to historical leave data.

### 🔔 Communication Center
- **Broadcasting**: Send targeted notifications to specific Departments or Classes instantly.

### 📥 Data Export
- **One-Click Export**: Generate Excel reports for check-in records filtered by date ranges.

---

## 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| **[React Router v7](https://reactrouter.com/)** | Framework Mode, SSR & Routing |
| **[React v19](https://react.dev/)** | UI Component Library |
| **[Tailwind CSS v4](https://tailwindcss.com/)** | Utility-First Styling Engine |
| **[Vite](https://vitejs.dev/)** | Next Generation Frontend Tooling |
| **TypeScript** | Type Safety & Developer Experience |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Active Backend Service (Running on port `8080`)

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```
   > Access the dashboard at `http://localhost:5173`.

### 📦 Build & Deploy

Create a production-ready build:
```bash
npm run build
```

Preview the production build locally:
```bash
npm start
```

---

## 📂 Project Structure

```text
app/
├── components/       # 🧩 UI Components (Alerts, Charts, Cards)
├── http/             # 🌐 API Layer (Auth.ts, Fetch Wrappers)
├── routes/           # 🚦 Application Routes (File-based)
│   ├── dashboard-layout.tsx  # Main Sidebar & Layout
│   ├── data-export.tsx       # Data Export Tool
│   ├── ding-list.tsx         # Check-in Manager
│   ├── leave-approval.tsx    # Leave Auditor
│   ├── organization.tsx      # Dept/Class Manager
│   └── home.tsx              # Dashboard Index
├── root.tsx          # 🌱 App Root & Global Context
└── routes.ts         # 🗺️ Route Configuration
```

## 🔑 Key Concepts

### Role-Based Access Control (RBAC)
- **👨‍🏫 Counselors**:
  - Can create Departments.
  - Approve Leaves for their students.
  - View Dept-wide stats.
- **👩‍🏫 Teachers**:
  - Can create Classrooms.
  - Publish Tasks to their classes.

### Data Architecture
- **Client-Side Data**: Uses `useEffect` and custom fetch wrappers for dynamic dashboard updates.
- **Server Export**: Leverages backend streaming to generate Excel files served via static resources.
