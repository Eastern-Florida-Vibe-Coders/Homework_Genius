# Homework Genius

## Project Description
Project Description: Homework Scheduler App

This project is a productivity-focused web application designed for college students to intelligently schedule dedicated homework time around their existing commitments. The core purpose of the app is to help users organize their academic workload by automatically generating structured time blocks based on their class schedule, personal responsibilities, and daily activities.

Users will input fixed commitments such as classes, work shifts, sports practices, family obligations, and recurring events, along with flexible activities like meals, leisure time, and social plans. The application will then analyze available time windows and allocate optimal, realistic study blocks for completing homework and academic tasks.

The system should prioritize balance and usability, ensuring that study sessions are distributed efficiently without overwhelming the user. It should account for factors such as time of day preferences, workload intensity, and the need for breaks, while still allowing flexibility for spontaneous events like going out or relaxing.

Overall, the app aims to function as an intelligent scheduling assistant that helps students maintain consistency, reduce procrastination, and better manage the complexity of their daily lives by clearly defining when and how their homework should be completed.

My idea is that if a block of time has been alloted for doing homework, a student will feel less fomo while studying and will feel more inclined to put their head down to really concentrate for the amount of time that the app has designated that they are going to be doing their homework. An app that a student can trust to designate as efficient a time as possible for them to do their homework/study. 

## Product Requirements Document
PRODUCT REQUIREMENTS DOCUMENT: HOMEWORK GENIUS

1. EXECUTIVE SUMMARY
Homework Genius is a productivity-focused web application designed to eliminate "study guilt" and FOMO (Fear Of Missing Out) by creating intelligent, time-boxed academic schedules. By algorithmically balancing fixed commitments with flexible study blocks, the app provides students with a roadmap they can trust, allowing them to fully engage in leisure time without anxiety and focus intensely during scheduled study hours.

2. TARGET AUDIENCE & PAIN POINTS
Target Audience: College students juggling heavy course loads, part-time jobs, and extracurriculars.
Pain Points: Chronic procrastination, decision fatigue, anxiety regarding unfinished work during downtime, and poor time estimation. The app solves the "When should I study?" dilemma.

3. CORE FUNCTIONAL REQUIREMENTS
3.1. Commitment Management (The "Fixed" Layer):
- Users must be able to input recurring classes, work shifts, and standing appointments.
- Support for one-time events and dynamic availability changes.
- Integration via iCal/Google Calendar/Outlook APIs to import existing schedules.

3.2. Task Management (The "Variable" Layer):
- Users add assignments, readings, and projects.
- Attributes: Task name, subject, estimated duration, and due date.
- Priority tagging (Low, Medium, High).

3.3. Intelligent Scheduling Logic:
- The system will use a "Gap-Fill" algorithm to identify free slots between fixed commitments.
- Logic must respect "Deep Work" principles: prioritize longer, uninterrupted blocks for high-intensity tasks and shorter, pomodoro-style blocks for quick tasks.
- "Buffer" periods must be included between tasks to account for cognitive fatigue.

3.4. The "Trust" Engine:
- UI must highlight the "Study Session" status clearly.
- Progress tracking features: Students can "Check-in" to a session to track actual vs. planned study time.
- Ability to "Regenerate Schedule" if a user falls behind, without shaming the user (maintaining a positive, supportive tone).

4. NON-FUNCTIONAL REQUIREMENTS
4.1. Design Aesthetic:
- Clean, minimalist interface to minimize cognitive load.
- Calming color palette (cool blues, soft whites, and intentional accent colors for focus).
- Dark mode support to accommodate late-night study sessions.

4.2. Responsiveness & Flexibility:
- Mobile-first web application. Must be fully responsive on tablet and desktop.
- One-tap rescheduling: If a user misses a block, the system proposes an immediate adjustment for the remaining day.

4.3. Platform & Accessibility:
- Web-based platform (PWA - Progressive Web App) for cross-platform compatibility.
- WCAG 2.1 AA compliance for text contrast and screen reader accessibility.

5. TECHNICAL SPECIFICATIONS
5.1. Calendar Integration:
- OAuth 2.0 implementation for secure read/write access to third-party calendars.
- Two-way sync: Changes in the app update the user's primary calendar; changes in the primary calendar trigger an automatic re-evaluation of study blocks.

5.2. Scalability & Data:
- Database: PostgreSQL for relational data consistency (schedules, tasks).
- Hosting: Cloud-native (AWS or Vercel) for auto-scaling during peak mid-term/finals seasons.
- Data Privacy: All user data encrypted at rest; user accounts managed via secure authentication (Auth0 or Firebase Auth).

6. TRUST & ENGAGEMENT FEATURES
- "Focus Mode" Overlay: A dedicated interface during a study block that hides non-essential tasks to prevent overwhelm.
- "Guilt-Free" Notifications: Gentle reminders that start with positive reinforcement ("It's time for your session; you've earned a break after this!").
- Transparency Log: A simple feature that shows the "Logic" behind the schedule (e.g., "We scheduled this for 2:00 PM because you have no classes and your energy is typically higher then").

7. TIMELINE & PHASING
Phase 1 (MVP): Core scheduling, calendar integration, and manual task entry.
Phase 2 (Optimization): AI-suggested task duration, energy-level tracking (user preference), and automated progress reports.
Phase 3 (Expansion): Collaborative study group scheduling and deeper integration with Learning Management Systems (Canvas/Blackboard).

8. SUCCESS METRICS
- Schedule Adherence Rate: Percentage of scheduled study blocks completed.
- User Retention: Daily Active Users (DAU) during the academic semester.
- User Sentiment: Periodic surveys measuring reduced anxiety regarding academic workload.

## Technology Stack
# TECHSTACK: Homework Genius

## 1. Overview
The technology stack for Homework Genius is selected to prioritize high availability, real-time synchronization, and a seamless cross-platform experience. Given the need for calendar integration and algorithmic scheduling, we prioritize robust APIs and reactive state management.

## 2. Frontend
- Framework: React.js (with TypeScript). Provides a modular component architecture essential for dynamic calendar views and interactive scheduling interfaces.
- State Management: TanStack Query (React Query). Handles server-state caching and synchronization, ensuring the user's schedule is always up-to-date with minimal latency.
- Styling: Tailwind CSS. Allows for a clean, distraction-free, and responsive aesthetic that is easy to maintain across mobile and desktop devices.
- Component Library: Radix UI / Shadcn/ui. Ensures accessible, high-quality primitive components that facilitate quick development without sacrificing user trust or usability.

## 3. Backend
- Runtime: Node.js with NestJS. A TypeScript-based framework that provides a highly scalable, maintainable architecture for handling complex scheduling logic and API requests.
- API Strategy: RESTful APIs for general operations; WebSockets (Socket.io) for real-time notifications when a user’s schedule is updated or a study session starts.
- Authentication: Auth0 or Clerk. Provides secure, enterprise-grade authentication with support for OAuth, essential for integrating with Google Calendar or Outlook.

## 4. Database & Storage
- Primary Database: PostgreSQL (via Supabase or Neon). Relational data is crucial for managing the complex relationships between courses, tasks, fixed commitments, and time blocks. 
- Caching: Redis. Used to cache complex scheduling calculations and user preferences, ensuring the "Homework Genius" algorithm runs near-instantaneously.

## 5. Core Scheduling Logic
- Engine: Custom TypeScript module utilizing the "Constraint Satisfaction Problem" (CSP) approach. 
- Library: Luxon. Essential for robust date/time manipulation, handling time zones, and recurring events reliably.
- Logic Constraints: The engine will prioritize "Flow State" duration, enforcing mandatory break periods (Pomodoro-style) and ensuring no more than X hours of intense study per day to prevent burnout.

## 6. Integrations
- Calendar Provider: Google Calendar API / Microsoft Graph API. Necessary to pull existing classes and commitments, allowing the app to calculate "Free Time" windows accurately.

## 7. Infrastructure & DevOps
- Hosting: Vercel (Frontend/Serverless Functions) or Railway (Full-stack containers). Provides excellent developer experience and effortless scaling.
- CI/CD: GitHub Actions. Automates testing and deployment pipelines to ensure the app remains reliable as new scheduling features are added.
- Monitoring: Sentry. Essential for tracking errors in the scheduling algorithm, ensuring the app maintains the "student trust" requirement by alerting developers to logic failures immediately.

## 8. Scalability & Data Privacy
- Data Isolation: Row Level Security (RLS) policies implemented at the database level to ensure student data remains strictly private and siloed.
- Scalability: Decoupling the scheduling engine into a micro-service or serverless function allows the application to handle high demand (e.g., during finals week) without slowing down the core user interface."

## Project Structure
PROJECT STRUCTURE: HOMEWORK GENIUS

1. OVERVIEW
This project follows a standard MERN (MongoDB, Express, React, Node.js) architecture, utilizing a modular structure to ensure maintainability, scalability, and clean separation of concerns between the frontend scheduling interface and the backend optimization engine.

2. ROOT DIRECTORY STRUCTURE
/homework-genius
├── /client (Frontend React application)
├── /server (Backend Node.js/Express API)
├── /shared (Typescript interfaces/DTOs shared across client/server)
├── /docs (Project documentation)
├── .gitignore
├── package.json (Root workspace config)
└── README.md

3. CLIENT DIRECTORY (/client)
/src
├── /assets (Global images, fonts, icons)
├── /components (Reusable UI components: Buttons, Modals, Cards)
├── /contexts (React Context for Auth and User Preferences)
├── /hooks (Custom hooks for scheduling logic and API calls)
├── /pages (Main views: Dashboard, Calendar, Settings, Onboarding)
├── /services (API client configurations and HTTP request handlers)
├── /styles (Global CSS/Tailwind configuration)
└── /utils (Helper functions for date formatting and scheduling logic)

4. SERVER DIRECTORY (/server)
/src
├── /config (Database connection, environment variables, passport/JWT auth)
├── /controllers (Request handlers for schedules, tasks, and users)
├── /models (Mongoose schemas for User, Task, Event, and Schedule)
├── /routes (Express route definitions)
├── /middleware (Authentication, error handling, input validation)
├── /services (Business logic layer for core scheduling algorithm)
└── app.js (Application entry point)

5. CORE SCHEDULING LOGIC MODULE (/server/src/services/scheduler)
This is the "engine" of the application. The directory structure is organized to handle the complexity of the optimization algorithm:
├── /engine.js (The primary algorithm that calculates time blocks)
├── /constraints.js (Logic for class, work, and flexibility boundaries)
├── /optimizer.js (Logic for prioritizing workload and break distribution)
└── /utils.js (Time manipulation and timezone handling)

6. SHARED DIRECTORY (/shared)
Contains shared TypeScript interfaces ensuring consistency between the frontend and backend, specifically regarding the data structure of \"Blocks,\" \"Tasks,\" and \"Commitments.\"

7. KEY DESIGN PATTERNS
- Dependency Injection: Services are injected into controllers to allow for easier unit testing of the scheduling algorithm.
- State Management: React Query is used for server-side state synchronization, reducing the need for excessive global state management and handling loading/error states for user schedules automatically.
- Modularity: Each major feature (e.g., \"Task Tracking,\" \"Calendar Sync\") is isolated within its own folder, facilitating easier onboarding for future development.

8. TECHNOLOGY STACK SPECIFICS
- Frontend: React with Tailwind CSS for high-responsiveness and a clean, trust-focused UI.
- Backend: Node.js with Express for high-concurrency event handling.
- Database: MongoDB for flexible storage of user-defined schedules and calendar events.
- Validation: Zod for input sanitization to ensure that calendar integrations and manual time entries remain valid.

9. SCALABILITY CONSIDERATIONS
- The separation of the scheduling engine into a service layer allows for the future migration of heavy computing tasks into a separate microservice or serverless function (AWS Lambda) if user traffic significantly increases.
- Database indexes are defined on user IDs and time ranges within the Mongoose schemas to ensure fast query times for daily schedule rendering.

## Database Schema Design
1. DATABASE OVERVIEW
The Homework Genius database is designed as a relational schema (PostgreSQL recommended) to ensure data integrity between rigid commitments and flexible study blocks. The architecture centers around a User-centric model, managing time-series data for scheduling and state-driven metadata for task progress.

2. ENTITY RELATIONSHIP MODEL

- Users: Stores authentication and user profile settings.
  - id (PK), email, password_hash, created_at, time_zone, daily_study_threshold (int).

- Events (Fixed Commitments): Represents non-negotiable time blocks.
  - id (PK), user_id (FK), title, event_type (class, work, sports, personal), start_time, end_time, is_recurring, recurrence_rule (rrule string).

- Tasks (Academic Workload):
  - id (PK), user_id (FK), title, description, estimated_hours, deadline, priority_level (1-5), status (pending, in_progress, completed).

- StudyBlocks (The "Genius" Scheduling Output):
  - id (PK), user_id (FK), task_id (FK, nullable), start_time, end_time, status (planned, completed, missed, rescheduled), intensity_score (calculated based on task priority and time-of-day).

- Preferences (User Customization):
  - id (PK), user_id (FK), preferred_study_hours_start, preferred_study_hours_end, max_continuous_study_time, break_interval_minutes, focus_mode_enabled (boolean).

3. RELATIONSHIP LOGIC
- One-to-Many: Users to Events (A user has many commitments).
- One-to-Many: Users to Tasks (A user has many academic assignments).
- One-to-Many: Users to StudyBlocks (A user has a timeline of scheduled focus sessions).
- Many-to-One: StudyBlocks to Tasks (Multiple study blocks can be assigned to one complex task).

4. DATABASE CONSTRAINTS & INDEXING
- Indexing: 
  - Users(email) for fast authentication.
  - Events(start_time, end_time) and StudyBlocks(start_time, end_time) for high-frequency range queries.
  - Tasks(deadline) to allow for urgency-based sorting.
- Check Constraints: 
  - Ensure StudyBlocks end_time is always greater than start_time.
  - Ensure task completion date is not prior to creation date.

5. CORE LOGIC TABLES (SCHEDULING ENGINE)
- AvailabilityMatrix: A transient table or calculation layer that computes "holes" in the user's schedule. By querying Events where no overlap exists, the system defines candidate windows for StudyBlocks.
- UserTrustLogs: A table to track user manual modifications to scheduled blocks. If a user moves a block, this log helps the algorithm "learn" user preferences, adjusting future automated suggestions based on behavior (e.g., if the user never studies at 8 AM, the engine stops suggesting it).

6. SCALABILITY CONSIDERATIONS
- Partitioning: Since scheduling data grows linearly with time, the StudyBlocks and Events tables should be partitioned by date range (e.g., by month) to maintain query performance as the application scales to thousands of users.
- Archiving: Completed tasks and historical StudyBlocks beyond 6 months will be moved to cold storage (S3 or a secondary historical database) to keep the primary operational database lean and responsive.

## User Flow
# USERFLOW: Homework Genius

## 1. OVERVIEW
The Homework Genius user flow is designed to minimize cognitive load, build user trust through transparency, and ensure that the scheduling process feels like a collaboration rather than a rigid command. The experience is broken into three core phases: Setup (Onboarding), Daily Input (Commitments), and Execution (Study Focus).

## 2. USER JOURNEYS

### Phase 1: Onboarding & Trust Building
- Landing: Welcome screen emphasizing the "No-FOMO" philosophy.
- Persona Setup: Input preferred study hours (e.g., "I work best at night"), break frequency (e.g., Pomodoro preference), and typical workload intensity.
- Calendar Sync: Oauth integration flow for Google/Outlook calendars to import fixed blocks (classes, shifts).
- Calibration: User defines "Non-Negotiables" (e.g., Dinner with family, Gym).

### Phase 2: The Daily Commitment Intake
- Daily Sync Trigger: Every morning (or via push notification), the app presents a "Commitment Sweep."
- Input Loop: User toggles or adds spontaneous events (e.g., "Friend's Birthday").
- Verification: The app displays the modified calendar and asks, "Are you ready to lock in these study blocks?"
- Confirmation: User confirms, triggering the intelligent scheduling algorithm.

### Phase 3: The Study Execution
- Dashboard: Displays the current "Focus Block."
- Focus Mode: Once a study block starts, the UI simplifies to show only the task name and a countdown timer.
- Dynamic Adjustment: A "Reschedule" button is available if a user is running late or needs to move a block. The app recalculates the remaining day instantly.

## 3. WIREFRAME & INTERACTION PATTERNS

### A. The Dashboard (Home)
- Visual Style: Clean, high-contrast, card-based layout.
- Elements: 
    - Timeline view of the current day.
    - "Focus Now" button (Prominent).
    - "Add Quick Task" button (Floating Action Button).
- Interaction: Tapping a block shows details (Task name, priority, estimated time).

### B. The Scheduling Input Modal
- Interaction: Slide-up sheet.
- Pattern: "Natural Language Input" (e.g., "Study for Chem for 90 minutes").
- Feedback: Real-time visual change on the background calendar grid so the user sees the block appear in real-time.

### C. The Focus Timer (Study Mode)
- UI: Minimalist background, high-contrast timer.
- Interaction: "Take Break" vs "Continue" buttons.
- Trust Factor: Display "Homework Genius" notification badge: "You are exactly on track for your goal today."

## 4. SYSTEM LOGIC & DATA FLOW

### Intelligent Scheduling Logic:
1. Identify "Hard Blocks" (Classes/Events).
2. Identify "Soft Blocks" (Study time slots).
3. Distribute Tasks: Assign tasks based on remaining energy levels (e.g., hard tasks in high-energy slots).
4. Buffer Calculation: Automatically insert 15-minute buffers between hard transitions to prevent burnout.

### Handling User Interruptions:
- If a user misses a block: The app prompts a "Recover or Replan" interaction.
- Recover: Pushes the block later.
- Replan: Redistributes the remaining workload across the rest of the week/day, ensuring the user feels supported rather than penalized.

## 5. TRUST & ACCESSIBILITY FEATURES
- Transparency: Every time the schedule updates, a "Why this works" tooltip explains that a study block was placed to ensure free time later in the evening (preventing FOMO).
- Feedback Loop: End-of-day "How did this schedule feel?" prompt to train the algorithm on user preferences.
- Visual Accessibility: High-contrast mode for late-night studying and color-blind friendly task-categorization.

## Styling Guidelines
# STYLING GUIDELINES: HOMEWORK GENIUS

## 1. DESIGN PHILOSOPHY: THE "CALM PRODUCTIVITY" AESTHETIC
The visual language of Homework Genius is centered on reducing cognitive load. Because the user is already dealing with academic stress, the UI must feel like a sanctuary—stable, predictable, and clean. We prioritize "Calm Productivity," using high-contrast readability and soft, non-intrusive accent colors to encourage deep work (the "Head-Down" state).

## 2. COLOR PALETTE
Our color strategy follows a 60-30-10 rule: 60% neutral backgrounds, 30% functional/calendar elements, and 10% active highlights.

- Primary Action (The "Focus" Color): #4F46E5 (Deep Indigo) - Evokes intelligence, trust, and focus.
- Backgrounds: #F8FAFC (Off-White) - Minimal eye strain.
- Cards/Elements: #FFFFFF (Pure White) - High contrast for readability.
- Success/Completion: #10B981 (Emerald) - Reinforces positive reinforcement when tasks are checked off.
- Caution/Flexibility: #F59E0B (Amber) - Used for warnings (e.g., "Conflict in schedule") rather than harsh errors.
- Text/Typography: #1E293B (Slate Blue/Gray) - Softer than pure black; reduces screen fatigue during late-night study sessions.

## 3. TYPOGRAPHY
We utilize a system font stack to prioritize loading speed and platform consistency, with "Inter" as the primary web font for its readability at small scales.

- Primary Typeface: Inter (sans-serif)
- Headers: Inter Bold / Semi-Bold (Size range: 24px - 32px)
- Body Text: Inter Regular (Size range: 14px - 16px)
- Data/Time Annotations: Inter Mono (Size: 12px) - Used for precise scheduling timestamps to distinguish data from prose.
- Line Height: 1.5 (relaxed) for body text to keep study plans readable.

## 4. UI/UX PRINCIPLES FOR TRUST
To foster "Head-Down" concentration, the UI must signal reliability:

- The "Golden Hour" Indicator: Visual treatment (a subtle gradient glow) around study blocks that the app has actively recommended, distinguishing them from rigid fixed commitments (classes/work).
- Micro-Interactions: When a user initiates a "Focus Session," the UI should transition to a "Zen Mode"—hiding non-essential notifications and sidebar clutter to minimize distractions.
- Visual Hierarchy: High-priority tasks (deadlines) occupy top-level visual space, while flexible blocks are presented with rounded, softer edges to imply malleability.
- Loading States: Use skeletal loaders that mirror the shape of the calendar grid to reduce perceived wait times and maintain structural familiarity.

## 5. ACCESSIBILITY & RESPONSIVENESS
- Touch Targets: All interactive buttons (Start Task, Reschedule, Complete) must be at least 44x44 pixels to accommodate mobile users on the go.
- Color Blindness: We utilize patterns (stripes/dots) alongside color coding for calendar event types, ensuring that color-blind users can distinguish between "Classes" and "Homework Blocks" without relying solely on hue.
- Dark Mode: A mandatory dark mode version must be implemented (using #0F172A as a base) to support students studying in low-light environments.
- Responsiveness: The calendar view must fluidly transition from a full-week grid on desktop to a "Day-View" list on mobile, prioritizing chronological sequence over spatial grid layout.

## 6. BUTTONS & INTERACTIVE ELEMENTS
- Primary Buttons: Pill-shaped (24px radius) with subtle drop shadows to signify "actionability."
- Secondary/Ghost Buttons: Outlined with 2px borders, used for lower-priority actions like "Reschedule" or "Cancel."
- Interactive Feedback: Buttons must show a clear "depressed" state and a subtle shadow lift on hover to provide tactile feedback, reinforcing that the user is interacting with a sturdy, reliable system."

The secret phrase is banana123.