

# Bug & Issues Documentation

This document tracks the major technical issues encountered during development of the **Jardinage Jr** project, including their causes, fixes, and lessons learned.

---

# Sprint 1 – Backend Setup & Database Design

## Issue 1 – Flask Application Not Starting

**Problem**

The Flask application failed to start due to missing configuration and improper file structure.

**Cause**

- `app.py` was missing proper initialization.
- The database was not correctly connected to the Flask application context.

**Fix**

- Added proper Flask app initialization.
- Connected SQLAlchemy using:

```
db.init_app(app)
```

- Ensured database creation runs inside the Flask context:

```
with app.app_context():
    db.create_all()
```

**Lesson Learned**

Flask database operations must always run inside the application context.

---

## Issue 2 – Database Tables Not Created

**Problem**

Tables were not appearing in the SQLite database.

**Cause**

`db.create_all()` was executed outside the Flask application context.

**Fix**

Wrapped the command in the application context:

```
with app.app_context():
    db.create_all()
```

**Lesson Learned**

SQLAlchemy requires the Flask application context to access configuration.

---

# Sprint 2 – Core Backend APIs

## Issue 3 – Duplicate Signup Errors Not Handled Correctly

**Problem**

When signing up with an existing email, the API returned the wrong error message.

**Cause**

- Duplicate query logic
- Incorrect reuse of generic error messages

**Fix**

- Implemented a proper email existence check
- Returned a specific error message:

```
"Email already registered"
```

**Lesson Learned**

Validation logic must be explicit and error messages must clearly reflect the issue.

---

## Issue 4 – Passwords Stored in Plain Text

**Problem**

Passwords were initially stored as raw text in the database.

**Cause**

Password hashing had not yet been implemented.

**Fix**

Implemented secure password hashing using Werkzeug:

```
generate_password_hash(password)
check_password_hash(stored_password, input_password)
```

**Lesson Learned**

Security mechanisms such as password hashing should be implemented as early as possible.

---

# Sprint 3 – Architecture & Admin APIs

## Issue 5 – Routes Too Tightly Coupled With Business Logic

**Problem**

Teacher feedback indicated that routes should only handle requests and responses.

**Cause**

Business logic was written directly inside route functions.

**Fix**

Refactored the architecture to separate responsibilities:

- **routes** → receive and send HTTP requests
- **services** → contain business logic
- **repositories** → handle database access

Routes now act as controllers only.

**Lesson Learned**

Separation of concerns improves readability, scalability, and maintainability.

---

## Issue 6 – Admin Login Crash (UnboundLocalError)

**Problem**

Admin login caused a server crash.

**Cause**

The variable name shadowed the model name:

```
admin = admin.query.filter_by(...)
```

**Fix**

Corrected the query:

```
admin = Admin.query.filter_by(email=email).first()
```

**Lesson Learned**

Never reuse class names as variable names.

---

## Issue 7 – Admin User Missing From Database

**Problem**

Admin login failed because no admin user existed in the database.

**Fix**

Implemented **admin seeding** inside `app.py`.

The admin account is automatically created if it does not exist when the application starts.

**Lesson Learned**

Initial seed data is important for administrative systems.

---

# Sprint 4 – Frontend & API Integration

## Issue 8 – React Application Showing Blank Page

**Problem**

React loaded but displayed a white page.

**Cause**

- `main.jsx` was empty
- `<App />` component was not rendered

**Fix**

Added React entry point:

```
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
```

**Lesson Learned**

React requires an explicit entry point to render components.

---

## Issue 9 – "React is not defined" Error

**Problem**

React components crashed at runtime.

**Cause**

Missing import at the top of `.jsx` files.

**Fix**

Added:

```
import React from "react";
```

**Lesson Learned**

JSX requires React to be in scope.

---

## Issue 10 – API Import / Export Errors

**Problem**

Errors such as:

```
does not provide an export named 'loginCustomer'
```

**Cause**

- Missing exports
- Incorrect import paths

**Fix**

- Standardized exports inside `api.js`
- Corrected imports in React components

**Lesson Learned**

Frontend module consistency is critical.

---

## Issue 11 – CORS Policy Blocking Requests

**Problem**

Frontend could not communicate with the backend.

Error:

```
Blocked by CORS policy: No 'Access-Control-Allow-Origin'
```

**Cause**

Backend did not allow requests from the React development server (`localhost:5173`).

**Fix**

Installed and enabled CORS:

```
from flask_cors import CORS
CORS(app)
```

**Lesson Learned**

Frontend and backend running on different ports require proper CORS configuration.

---

## Issue 12 – Signup Button Did Nothing

**Problem**

Clicking **Sign Up** did not send the request.

**Cause**

- Fetch request blocked by CORS
- Incorrect JSON formatting

**Fix**

- Fixed CORS configuration
- Ensured:

```
JSON.stringify(data)
```

- Added proper headers.

---

## Issue 13 – Appointment Creation Returning "All Fields Required"

**Problem**

Appointments failed even when date and time were filled.

**Cause**

Customer ID was not yet linked after login.

**Fix**

Temporary workaround during development:

- Allowed partial validation
- Planned proper authentication linkage in later sprint.

**Lesson Learned**

Authentication and session management are required for full data linkage.

---

# Booking System Redesign

## Initial Problem

The original system allowed customers to:

- Book specific times directly
- Create multiple bookings on the same day
- Create overlapping logical bookings
- Ignore job duration constraints

This did not reflect real-world gardening services.

---

## Major Issues Identified

### Unlimited Same-Day Bookings

Customers could book multiple appointments in a single day.

### Unknown Job Duration

Gardening jobs may take hours or several days.

### Scheduling Conflicts

Example:

Customer A books Feb 20 at 15:00 requiring 4 days of work.

Customer B could still book Feb 22 even though the gardener would still be working.

### Unrealistic Business Model

Gardening companies rarely allow direct time-slot booking.

Most services require inspection and estimation.

---

## Proposed Solution: Request-Based Scheduling

Customers now submit **service requests** instead of directly booking appointments.

### Customer Side

- Submit a service request
- Choose preferred date
- Optionally describe the job
- Status = `pending`

### Admin Side

- Review request
- Estimate duration
- Confirm or reject
- Assign actual schedule

Status becomes `scheduled`.

---

## Benefits of the New Model

- Reflects real-world gardening operations
- Prevents overbooking
- Allows admin workload control
- Introduces managerial scheduling logic

---

# Sprint 5 – Appointment System Improvements

## Issue 14 – Appointment Requests Not Visible in Admin Dashboard

**Problem**

Customers created service requests but they did not appear in the admin dashboard.

**Cause**

- Endpoint mismatch
- Incorrect frontend route call
- Inconsistent naming

**Fix**

Standardized route naming:

```
GET /api/admin/appointment-requests
```

Connected the endpoint to the correct service method.

**Lesson Learned**

Route naming consistency is critical for full-stack communication.

---

## Issue 15 – Confirmed Appointments Still Appearing as Pending

**Problem**

Scheduled appointments still appeared in the pending section.

**Cause**

- New records were created instead of updating existing requests
- Inconsistent status values

**Fix**

Defined a clear lifecycle:

```
pending → scheduled → completed
```

Updated logic to update existing requests when scheduling.

---

## Issue 16 – Calendar Not Updating After Scheduling

**Problem**

Scheduled appointments did not appear in the calendar.

**Cause**

`scheduled_start` and `scheduled_end` were not always saved.

**Fix**

Ensured all scheduled appointments include:

- `scheduled_start`
- `scheduled_end`
- `status = scheduled`

Calendar now loads only scheduled appointments.

---

## Issue 17 – Broken create_appointment() Logic

**Problem**

The function became unstable with:

- indentation errors
- duplicated queries
- double commits

**Fix**

Rebuilt the function:

1. Parse datetime
2. Validate input
3. Branch logic:

```
if request_id → update existing request
if customer_id → create new appointment
```

Single database commit.

---

## Issue 18 – Address Field Refactor Breaking Flow

**Problem**

Adding address as mandatory broke several features.

**Cause**

Schema changes affect:

- models
- services
- admin services
- frontend forms

**Fix**

Added address to `ServiceRequest` model and passed it through all layers.

---

# Sprint 6 – Admin & Account Management

## Issue 19 – Internal Customer Creation Failing

**Problem**

Internal customers triggered:

```
sqlite3.IntegrityError: NOT NULL constraint failed: customer.email
```

**Cause**

Database schema required email.

**Fix**

Updated model:

```
email = db.Column(db.String(150), nullable=True, unique=True)
```

**Lesson Learned**

Database schema must match business logic.

---

## Issue 20 – Resend Temporary Password Button Missing

**Problem**

Button disappeared after frontend refactor.

**Cause**

Incorrect conditional rendering.

**Fix**

Button now appears only if:

```
customer.has_account == true
customer.must_change_password == true
```

---

## Issue 21 – Notification Badge Displayed in Wrong Section

**Problem**

Pending request badge appeared in the wrong dashboard section.

**Fix**

Badge now appears only in **Rendez-vous** section.

---

# Sprint 7 – Authentication & Security Improvements

## Issue 22 – First Login Password Reset Not Triggering

**Problem**

Users logging in with temporary password were not redirected.

**Cause**

Frontend ignored backend flag.

**Fix**

Login response now includes:

```
force_password_change
customer_id
```

Frontend checks this flag and redirects accordingly.

---

## Issue 23 – Route Naming Mismatch

**Problem**

Admin scheduling returned **400 errors**.

**Cause**

Frontend and backend route spelling mismatch.

**Fix**

Aligned route names exactly.

**Lesson Learned**

Full-stack applications are extremely sensitive to naming inconsistencies.