# JR Jardinage Node.js Microservices

This branch replaces the Flask backend runtime with Node.js services.

The React frontend still calls the same API base URL:

```text
http://127.0.0.1:5000/api/...
```

The difference is that port `5000` is now an API gateway, not Flask.

## Service Split

### API Gateway

Path:

```text
node-services/api-gateway
```

Role:

- Receives frontend requests
- Keeps the public API shape stable
- Sends auth/customer routes to `auth-service`
- Sends booking/calendar routes to `appointment-service`

### Auth Service

Path:

```text
node-services/auth-service
```

Owns:

- customer signup
- customer login
- admin login
- password reset
- forced password change
- customer profile updates
- admin customer management

### Appointment Service

Path:

```text
node-services/appointment-service
```

Owns:

- public quote requests
- logged-in customer service requests
- customer appointment list
- customer cancellation
- admin service request list
- admin scheduling
- admin blocked dates

### Notification Service

Path:

```text
node-services/notification-service
```

Owns:

- SMTP setup
- sending email
- local no-op email mode when mail credentials are missing

Other services call it through:

```text
POST /internal/email
```

## Request Example

When a customer books a service:

1. React calls `POST /api/service-requests`.
2. The API gateway receives the request on port `5000`.
3. The gateway forwards it to `appointment-service`.
4. The appointment service validates the customer and creates a `service_requests` row.
5. The response goes back through the gateway to React.

## Why This Helps Scaling

In the Flask version, auth, customers, appointments, admin actions, and email all live in one backend process.

In this branch:

- appointment changes mostly stay inside `appointment-service`
- login/account changes mostly stay inside `auth-service`
- email changes mostly stay inside `notification-service`
- frontend API URLs stay stable because the gateway hides the internal split

## Run With Docker

From the project root:

```bash
docker compose up --build
```

Containers:

- `jardinage_api_gateway` on port `5000`
- `jardinage_auth_service` on port `3001` inside Docker
- `jardinage_appointment_service` on port `3002` inside Docker
- `jardinage_notification_service` on port `3003` inside Docker
- `jardinage_db` MySQL
- `jardinage_frontend` on port `5173`

Open:

```text
http://localhost:5173
```

## Important Migration Note

The new Node.js services use `bcryptjs` for password hashes.

The old Flask backend used Werkzeug password hashes. If you reuse an old database, existing customer passwords may not verify in Node.js. For a production migration, you would either:

- implement Werkzeug hash verification in Node.js during a transition period, or
- ask existing users to reset their passwords.

For learning and local testing, creating fresh users from the Node branch is the simplest path.
