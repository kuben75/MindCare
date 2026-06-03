# MindCare-SaaS | Clinic Management & Booking SaaS

![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-626CD9?style=for-the-badge&logo=Stripe&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-729B1B?style=for-the-badge&logo=vitest&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-black?style=for-the-badge&logo=framer&logoColor=blue)

A comprehensive, real-world SaaS platform engineered for a psychological clinic. It automates the entire patient lifecycle—from scheduling and secure payments to automated reminders—while providing a highly secure, FinTech-grade administrative dashboard.

## Screenshots
<img width="1862" height="928" alt="image" src="https://github.com/user-attachments/assets/2711caba-dbe7-41a3-9863-b9ca79cae88f" />

<img width="1878" height="928" alt="image" src="https://github.com/user-attachments/assets/f3d9cbfe-fbdb-481c-a34d-a78e4d34dbd1" />

<img width="1871" height="925" alt="image" src="https://github.com/user-attachments/assets/97000b7e-41fd-4441-83b2-e15e5dfb4fca" />

## Key Features: For Patients (Public App)

* **Smart Booking Engine:** Real-time slot calculation combining weekly schedules with explicit time-blocks to prevent overbooking and concurrency conflicts.
* **Seamless Payments:** Integrated Stripe Checkout (Card, BLIK, Przelewy24) with robust webhook verification handling asynchronous payment confirmations.
* **Passwordless Management:** "Magic Links" securely sent via email allow patients to reschedule or cancel appointments (with automated Stripe refunds) without needing to create an account.
* **Waitlist System:** Automated enrollment for fully booked services.

## Key Features: For Administrators (Dashboard)

* **UI/UX & Dark Mode:** A desktop-class interface engineered with Framer Motion. Features kinetic page transitions, "magic pill" layout animations, glassmorphism effects, and full Dark Mode support.
* **Context-Aware Help System:** Custom-built, globally portaled tooltips with smart collision detection (auto-adapting into bottom sheets on mobile devices) to guide the clinic owner through complex business logic (e.g., LTV calculations, 2FA setup, manual IBAN workflows).
* **FinTech-Grade Security:** 2FA (Two-Factor Authentication) via Authenticator apps, active device session management with remote logout, IP/User-Agent anomaly detection, and database-level Brute-Force protection.
* **Automated CRON Jobs:** Sweeps and releases unpaid pending reservations after 30 minutes, dispatches 24-hour appointment reminders, and generates daily morning briefings.
* **Full CMS & Financials:** Built-in blog engine, dynamic landing page builder, financial overviews, and detailed system logs.

## Testing & Quality Assurance (QA)

To ensure maximum reliability, the core business logic is covered by automated unit tests using **Vitest**.
* **Calendar Engine Tests:** Simulates timezone behaviors and verifies that the `api/slots` engine successfully drops past times, honors vacation blocks, and strictly prevents overbooking.
* **DOM & UI Interaction Tests:** Mocks browser APIs (e.g., `scrollIntoView`, `scrollBy`) to validate complex custom hooks like `useCalendarLogic` in simulated JSDOM environments.
* **Security & Auth Tests:** Validates the robust parsing of incoming User-Agent strings and logical constraints for the 15-minute brute-force lockout window.
* **Payment Endpoint Tests:** Mocks Prisma and Stripe SDK to ensure malicious payloads cannot manipulate service prices during the Stripe Checkout session generation.

## Architecture & Engineering Highlights

* **Timezone Normalization:** The database operates strictly in UTC, while the dashboard and public booking engine safely normalize all interactions to `Europe/Warsaw`, preventing timezone drift regardless of the administrator's physical location.
* **Data Integrity:** Heavy reliance on Prisma transactions to ensure database state consistency during complex, multi-step operations (e.g., webhook fulfillment, order sequencing).
* **Protected Routing:** Strict Next.js Middleware acts as a proxy, verifying JWT sessions before any administrative route or API endpoint is accessed.
* **Type Safety:** 100% end-to-end TypeScript integration, from Zod schema validation on the client to Prisma schema types on the database layer.

## Local Setup & Installation

Follow these steps to safely configure and launch the platform on your local machine:

1. **Clone the repository:** Execute `git clone https://github.com/username/MindCare-SaaS.git` and navigate into the folder using `cd MindCare-SaaS`.
2. **Install dependencies:** Run `npm install` to download all necessary packages.
3. **Configure environment:** Copy the example template using `cp .env.example .env` and securely populate it with your Stripe, Resend, NextAuth, and Database keys.
4. **Initialize database:** Ensure Docker is running your local PostgreSQL instance, then apply the Prisma schema by running `npx prisma db push`.
5. **Start application:** Execute `npm run dev` to launch the development server on localhost port 3000.
6. Navigate to `http://localhost:3000` to view the public application, or `http://localhost:3000/admin/login` for the dashboard.

## License
This project is proprietary software developed for a specific client. All rights reserved.