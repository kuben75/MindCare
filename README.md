# MindCare-SaaS | Clinic Management & Booking SaaS

![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-626CD9?style=for-the-badge&logo=Stripe&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

A comprehensive, real-world SaaS platform engineered for a psychological clinic. It automates the entire patient lifecycle—from scheduling and secure payments to automated reminders—while providing a highly secure, FinTech-grade administrative dashboard.

## Key Features: For Patients (Public App)

* **Smart Booking Engine:** Real-time slot calculation combining weekly schedules with explicit time-blocks to prevent overbooking and concurrency conflicts.
* **Seamless Payments:** Integrated Stripe Checkout (Card, BLIK, Przelewy24) with robust webhook verification handling asynchronous payment confirmations.
* **Passwordless Management:** "Magic Links" securely sent via email allow patients to reschedule or cancel appointments (with automated Stripe refunds) without needing to create an account.
* **Waitlist System:** Automated enrollment for fully booked services.

## Key Features: For Administrators (Dashboard)

* **FinTech-Grade Security:** 2FA (Two-Factor Authentication) via Authenticator apps, IP/User-Agent anomaly detection with email alerts, and database-level Brute-Force protection.
* **Automated CRON Jobs:** Sweeps and releases unpaid pending reservations after 30 minutes, dispatches 24-hour appointment reminders, and generates daily morning briefings.
* **Full CMS & Financials:** Built-in blog engine, dynamic landing page builder, financial overviews, and detailed system logs.

## Architecture & Engineering Highlights

* **Data Integrity:** Heavy reliance on Prisma transactions to ensure database state consistency during complex, multi-step operations (e.g., webhook fulfillment, order sequencing).
* **Protected Routing:** Strict Next.js Middleware acts as a proxy, verifying JWT sessions before any administrative route or API endpoint is accessed.
* **Type Safety:** 100% end-to-end TypeScript integration, from Zod schema validation on the client to Prisma schema types on the database layer.

## Local Setup & Installation

Follow these steps to safely configure and launch the platform on your local machine:

1. **Clone the repository:** Execute `git clone https://github.com/YourUsername/MindCare-SaaS.git` and navigate into the folder using `cd MindCare-SaaS`.
2. **Install dependencies:** Run `npm install` to download all necessary packages.
3. **Configure environment:** Copy the example template using `cp .env.example .env` and securely populate it with your Stripe, Resend, NextAuth, and Database keys.
4. **Initialize database:** Ensure Docker is running your local PostgreSQL instance, then apply the Prisma schema by running `npx prisma db push`.
5. **Start application:** Execute `npm run dev` to launch the development server on localhost port 3000.