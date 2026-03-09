# Sprint Retrospective

## Overview

During the development of the JR Jardinage application, several iterations and improvements were made across both the backend and frontend. Each sprint helped refine the system architecture, improve the user experience, and solve real-world problems related to scheduling gardening services.

This retrospective summarizes what worked well, the main challenges encountered during development, and what could be improved in future iterations of the project.

---

## What Went Well

- The layered backend architecture (API → Services → Models) made the code easier to maintain and extend.
- Separating business logic from route handlers helped keep the project organized.
- The request‑based booking system better reflects how a real gardening service would operate.
- The interactive admin calendar made appointment management intuitive and efficient.
- The custom alert system in the frontend improved the user interface and removed browser default alerts.
- Adding automated emails (account creation, password reset, appointment updates) improved communication with clients.

---

## Challenges

- Managing authentication flows between the React frontend and the Flask backend required careful handling of tokens and session logic.
- Implementing a forced password reset system for new users required coordinating both frontend navigation and backend validation.
- Synchronizing the calendar interface with backend appointment logic required debugging multiple API endpoints.
- Refactoring the project structure mid‑development introduced temporary instability but ultimately improved maintainability.
- Ensuring that emails were triggered correctly when appointments were created, modified, or cancelled required careful service‑layer design.

---

## Improvements for Future Development

- Increase automated test coverage, particularly for edge cases in authentication and scheduling.
- Implement automated appointment reminder emails (for example 24 hours before the appointment).
- Improve mobile responsiveness of the frontend interface 
- Make sure the refrencment is the best it can be
- add emailconfirmations for signups by client.
- improve admin calendar
- Introduce containerization (Docker) to simplify deployment and environment consistency.

---

## Lessons Learned

This project highlighted the importance of designing a clear architecture early in development. Separating responsibilities between the API layer, service layer, and frontend components greatly improved maintainability and debugging.

Another key lesson was the importance of aligning technical implementation with real business workflows. Designing the booking system around appointment requests rather than direct scheduling made the application more realistic and flexible.

Finally, iterative development and continuous testing were essential in identifying issues early and progressively improving the system.