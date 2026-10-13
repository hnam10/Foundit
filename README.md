# Foundit

## Seneca Campus Lost & Found System

> A centralized digital platform that helps Seneca students recover lost items faster and with less confusion.

## Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Solution](#solution)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Team](#team)
- [Contributing](#contributing)
- [License](#license)

## Overview

**Foundit** is a web platform for Seneca Polytechnic that lets students report, browse, and match lost and found items across campus. It replaces fragmented manual processes with a single, searchable system.

### Background

Seneca is a large campus with multiple buildings and shared spaces, which increases the likelihood of lost items. Today, students often rely on:

- Manual processes through campus security
- Unofficial group chats and social media

These approaches are fragmented, time-consuming, and often ineffective.

## Problem Statement

There is **no centralized, accessible system** for reporting and searching lost and found items at Seneca Polytechnic.

### Who is Affected?

- **Students** — lose valuable or essential items such as student IDs, headphones, and water bottles
- **Campus Security** — faces increased manual workload managing lost items
- **Campus Community** — experiences frustration and inefficiency in item recovery

Reference: [Seneca Service Hub - Lost and Found](https://theservicehub.senecapolytechnic.ca/s/article/Lost-and-found)

## Solution

A web-based platform that provides:

- Centralized item reporting and searching
- Improved speed and success rate of item recovery
- Reduced confusion and reliance on informal methods
- Efficient matching between lost and found items

## Features

### Core

- **Item Posting** — Report lost or found items with detailed descriptions
- **Search & Filter** — Find items quickly with advanced search
- **Item Status Tracking** — Real-time updates on item status
- **User Authentication** — Secure login for students, security staff, and admins
- **Database Management** — Robust backend for storing item and claim data

### Advanced

- **Semi-Automated Matching** — Suggestions to link lost claims with found items
- **Gratitude Wall** — Share success stories and express thanks
- **Content Moderation** — Report inappropriate content
- **Performance Optimization** — Fast, reliable system behavior
- **Responsive Design** — Mobile-friendly interface

## Tech Stack

| Layer    | Technologies                          |
| -------- | ------------------------------------- |
| Frontend | Next.js, React, Chakra UI, TypeScript |
| Backend  | Express, TypeScript, Prisma           |
| Database | PostgreSQL (Docker)                   |
| Auth     | JWT (access + refresh tokens)         |
| Email    | Nodemailer (SMTP)                     |

## Project Structure

```
Foundit/
├── foundit-ui/     # Next.js frontend
├── backend/        # Express API + Prisma
├── database/       # Docker Compose for PostgreSQL + pgAdmin
└── README.md
```

For deeper documentation, see:

- [Backend setup & API](./backend/README.md)
- [Database setup & schema](./database/README.md)

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm 11+
- Docker (for PostgreSQL)

### 1. Clone the repository

```bash
git clone https://github.com/86unj/Foundit.git
cd Foundit
```

### 2. Start the database

```bash
cd database
docker compose up -d
```

### 3. Set up the backend

```bash
cd backend
pnpm install
cp .env.example .env
```

Edit `.env` with your database URL, JWT secrets, and SMTP settings. See [backend/README.md](./backend/README.md) for details.

Apply migrations and seed data:

```bash
pnpm exec prisma migrate dev
NODE_ENV=development pnpm exec prisma db seed
```

Start the API server:

```bash
pnpm run dev
```

The backend runs at `http://localhost:3001`. Verify with:

```bash
curl http://localhost:3001/api/health
```

### 4. Set up the frontend

In a new terminal:

```bash
cd foundit-ui
pnpm install
cp .env.example .env   # if present
pnpm run dev
```

The frontend runs at `http://localhost:3000`.

## Team

Hansol Nam, Yunjeong Choi, Shu-Ting Hsu, Rendell Velasco, Hsiao-Kang Chang

## Contributing

This project is maintained by the Foundit team. If you are a team member, open a pull request with a clear description of your changes and follow the existing code style.

## License

To be determined.

## Contact

For questions or feedback, contact any team member listed above.

---

**Seneca Polytechnic — Foundit**
