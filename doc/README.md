# JR Jardinage

## Professional Gardening Service Management Platform

JR Jardinage is a full-stack web application designed to manage gardening service requests, appointment scheduling, and customer administration for a local gardening business.

The platform replaces a basic time-slot booking system with a professional request-based scheduling workflow, reflecting how real gardening companies operate.

---

## Project Overview

JR Jardinage allows:

- Customers to request gardening services
- Admin to review and schedule appointments
- Full calendar management
- Multi-day scheduling
- Conflict detection with warning system
- Customer account management with temporary passwords
- Controlled appointment lifecycle

This system models real-world service business logic instead of simple slot booking.

---

## Architecture

The application follows a structured layered architecture.

### Backend (Flask)

- **Routes (Controllers)** – Handle HTTP requests and responses
- **Services (Business Logic)** – Core validation, workflow, scheduling rules
- **Repositories (Data Access Layer)** – Database communication via SQLAlchemy
- **Models** – SQLAlchemy ORM models

### Frontend (React + Vite)

- Component-based architecture
- Admin dashboard
- Interactive drag-and-drop calendar (React Big Calendar)
- State-driven workflow
- Centralized API communication layer

This separation of concerns improves maintainability, scalability, and readability.

---

## Technologies Used

### Backend

- Flask (Python)
- SQLAlchemy
- SQLite
- Flask-CORS
- JWT Authentication
- Werkzeug (password hashing)
- Flask-Mail (email notifications)

### Frontend

- React (Vite)
- React Big Calendar
- date-fns
- Drag & Drop Calendar Addon

### Database

- SQLite

---

## Authentication System

### Customer Authentication

- Email + Password
- Passwords hashed using `generate_password_hash`
- Temporary password system for admin-created accounts
- Forced password change on first login
- Password reset functionality via email token
- JWT-based authentication

### Admin Authentication

- Seeded admin account
- JWT role-based authentication

---

## Booking System Redesign

### Original Model

Customers could:

- Book exact time slots
- Overbook days
- Ignore job duration
- Create scheduling conflicts

This model did not reflect real gardening operations.

---

### Current Model – Request-Based Scheduling

#### Customer Workflow

1. Submit service request
2. Choose preferred date
3. Provide address and description
4. Status = `"pending"`

#### Admin Workflow

1. Review request
2. Estimate job duration
3. Assign start & end datetime
4. Status = `"scheduled"`
5. Appointment appears on calendar

---

### Appointment Lifecycle

| Status     | Meaning                  |
|------------|--------------------------|
| pending    | Waiting for admin review |
| scheduled  | Confirmed appointment    |
| cancelled  | Cancelled by admin       |
| completed  | (Future upgrade)         |

This introduces structured state management instead of simple CRUD operations.

---

## Calendar Features

- Drag & Drop appointment rescheduling
- Multi-day appointments supported
- Blocked dates (admin-controlled)
- Conflict warning (not forced blocking)
- Double-booking allowed with confirmation
- Appointment cancellation via modal
- Visual conflict indicators

---

## Project Structure

```
JR_Jardinage/
│
├── backend/
│   ├── routes/
│   │   ├── admin_routes.py
│   │   ├── appointment_routes.py
│   │   ├── customer_routes.py
│   │   └── service_request_routes.py
│   │
│   ├── services/
│   │   ├── admin_service.py
│   │   ├── appointment_service.py
│   │   └── customer_service.py
│   │
│   ├── repositories/
│   │   ├── admin_repository.py
│   │   ├── appointment_repository.py
│   │   └── customer_repository.py
│   │
│   ├── models.py
│   ├── app.py
│   └── config.py
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminCalendar.jsx
│   │   │   ├── Account.jsx
│   │   │   ├── Booking.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── ResetPassword.jsx
│   │   │   ├── RequestReset.jsx
│   │   │   ├── ChangePassword.jsx
│   │   │   └── Home.jsx
│   │   ├── gallery/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
└── README.md
```

---

## Installation (Local Development)

### Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate   # Mac/Linux
# venv\Scripts\activate    # Windows
pip install -r requirements.txt
python3 app.py
```

**Server runs on:**
```
http://127.0.0.1:5000
```

---

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

**Frontend runs on:**
```
http://localhost:5173
```

---

## Key Features

### Customer Portal

- Service request submission
- Appointment history view
- Account management
- Password change functionality
- Password reset via email

### Admin Dashboard

- Customer management (create, edit, delete)
- Service request review
- Appointment scheduling
- Interactive calendar with drag & drop
- Multi-day appointment support
- Conflict detection
- Temporary password generation and resend

### Security Features

- Password hashing with Werkzeug
- JWT authentication
- Secure password reset tokens
- Email verification for password reset
- Session management

---

## Key Engineering Decisions

**Separation of Concerns**  
Routes → Services → Repository layering

**State-Driven Workflow**  
Appointments controlled via lifecycle states

**Business-Realistic Model**  
Request-based instead of self-booked time slots

**Admin-Controlled Scheduling**  
Calendar reflects confirmed work only

**Security First**  
Password hashing and JWT authentication implemented early

---

## Future Improvements

- Email notification on appointment confirmation
- SMS reminders
- Invoice generation system
- Completed status tracking
- Enhanced customer dashboard
- Production deployment (Docker + Nginx)
- Role-based middleware protection
- Smart time-overlap conflict detection
- Advanced mobile UI optimization
- Payment integration
- Customer reviews and ratings

---

## System Evolution

The project evolved from:

**Basic slot booking**  
→ Duration-aware scheduling  
→ Request-based workflow  
→ Admin-controlled service management  
→ Multi-day calendar system  
→ Password reset functionality

This significantly improved:

- Architectural quality
- Business realism
- Scalability
- Code maintainability
- User experience

---

## Mobile Compatibility

The system is responsive and usable on mobile devices.  
Future iterations will include dedicated mobile UI optimization.

---

## Academic Context

This project demonstrates:

- Full-stack development
- Authentication systems
- Business workflow modeling
- Calendar integration
- State management
- Backend architecture layering
- Real-world problem solving
- Email integration
- Security best practices

---

## Author

**Omar Rouigui**  
Full Stack Development Student  
Holberton School

---

## Source Repository

The full project source code is available on GitHub:

https://github.com/omarrui/Jardinage_jr

The repository contains both the **frontend (React)** and **backend (Flask API)** code.  
Development was managed using **Git version control** with multiple branches for feature development, improvements, and fixes.

## License

This project is part of an academic portfolio.

---

## Contributing

This is an academic project, but feedback and suggestions are welcome!

---

**Last Updated:** March 2026