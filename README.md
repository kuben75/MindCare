# MindCare | Custom Clinic Management Platform

![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-626CD9?style=for-the-badge&logo=Stripe&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-729B1B?style=for-the-badge&logo=vitest&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-black?style=for-the-badge&logo=framer&logoColor=blue)

A comprehensive, bespoke B2B platform engineered specifically for a private psychological clinic. It automates the entire patient lifecycle—from smart scheduling and secure payments to automated reminders—while providing a highly secure, FinTech-grade administrative dashboard and built-in CMS.

## Business Value & Real-World Application

This platform was not built just as a technical showcase; it was engineered to solve high-cost business problems in the medical and therapeutic industry.

* **Eliminating "No-Shows" & Revenue Loss:** By enforcing upfront payments via Stripe (Card, BLIK, Przelewy24) and utilizing background CRON jobs to clear unpaid 30-minute holds, the clinic's calendar is protected from empty, unpaid slots. Automated 24h reminders further maximize attendance.
* **Medical-Grade Data Protection (GDPR/RODO Ready):** Patient data is highly sensitive. The application goes beyond standard authentication by implementing FinTech-style security: Two-Factor Authentication (2FA), remote session termination, detailed audit logs (IPs, User-Agents), and Brute-Force lockout mechanisms.
* **Operational Independence:** The built-in CMS (Blog) and customizable landing page builder eliminate the need for third-party tools like WordPress. The clinic owner can manage their entire digital presence, financials, and schedule from a single, secure dashboard.
* **Scalable Architecture:** Using a modern Next.js + Prisma stack ensures the platform is extremely fast, SEO-friendly, and easy to maintain or expand with new features in the future.

## Screenshots

<img width="2505" height="1291" alt="image" src="https://github.com/user-attachments/assets/f8fd15f0-3a00-41f7-9ba8-c64ffa2bf783" />

<img width="2517" height="1292" alt="image" src="https://github.com/user-attachments/assets/43db934b-3ea2-4306-9d3f-84a2a706b368" />

<img width="2514" height="1287" alt="image" src="https://github.com/user-attachments/assets/7041f6ae-47dc-4995-b478-abf2924b58dd" />

<img width="2521" height="1287" alt="image" src="https://github.com/user-attachments/assets/7a02d150-6863-4566-b084-73b0830310a9" />

<img width="2517" height="1291" alt="image" src="https://github.com/user-attachments/assets/878d0f74-b331-40f8-b0fd-8e48dbcdbe00" />

<img width="394" height="848" alt="image" src="https://github.com/user-attachments/assets/2078be34-e56e-47c0-86f1-9614d4529c50" />

<img width="2508" height="1289" alt="image" src="https://github.com/user-attachments/assets/b50a8559-2f43-46d3-8c81-7a2c212664d8" />

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

1. **Clone the repository:** Execute `git clone https://github.com/username/MindCare.git` and navigate into the folder using `cd MindCare`.
2. **Install dependencies:** Run `npm install` to download all necessary packages.
3. **Configure environment:** Copy the example template using `cp .env.example .env` and securely populate it with your Stripe, Resend, NextAuth, and Database keys.
4. **Initialize database:** Ensure Docker is running your local PostgreSQL instance, then apply the Prisma schema by running `npx prisma db push`.
5. **Start application:** Execute `npm run dev` to launch the development server on localhost port 3000.
6. Navigate to `http://localhost:3000` to view the public application, or `http://localhost:3000/admin/login` for the dashboard.