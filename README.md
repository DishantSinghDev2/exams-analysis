# Exam Response Analyzer

A user-friendly web application designed to analyze exam response sheets with detailed subject-wise performance breakdowns.

## Features Overview

- **Student Interface**: Easily upload response sheets and receive detailed analysis.
- **Admin Dashboard**: Manage answer keys, approve submissions, and monitor statistics.
- **Blog System**: Create and manage SEO-friendly blog posts for exam preparation.
- **GitHub OAuth**: Secure admin authentication using GitHub accounts.
- **MySQL Database**: Reliable data storage powered by Prisma ORM.

---

## Video Demo
![Video](https://raw.githubusercontent.com/DishantSinghDev2/exams-analysis/refs/heads/main/Screen%20Recording%202025-06-26%20at%209.01.27%20PM%20(online-video-cutter.com).mp4)

## Getting Started

Follow these simple steps to set up and run the application:

### 1. Clone the Repository

Start by cloning the project repository and installing dependencies:

```bash
git clone https://github.com/DishantSinghDev2/exams-analysis.git
cd exam-analysis
npm install
```

---

### 2. Configure GitHub OAuth

Set up GitHub OAuth for secure admin authentication:

1. Log in to your GitHub account.
2. Navigate to **Settings > Developer settings > OAuth Apps**.
3. Create a new OAuth App with the following details:
    - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Copy the **Client ID** and **Client Secret** into the `.env` file.

---

### 3. Set Up the Database

Prepare the database configuration:

1. Copy the example environment file:
    ```bash
    cp .env.example .env
    ```
2. Open `.env` and update the following:
    - **DATABASE_URL**: Your database connection string.
    - **GitHub OAuth credentials**: Add the Client ID and Client Secret.

---

### 4. Initialize Prisma

Generate the Prisma client and seed sample data:

1. Update the `email` field in the `admins` table located in `prisma/seed.ts`.
2. Run the following command:
    ```bash
    npm run db:setup
    ```

---

### 5. Run the Application

Start the development server:

```bash
npm run dev
```

Visit `http://localhost:3000?mode=with_sample` to access the application. Adding `?mode=with_sample` enables sample data for testing.

---

## How to Use

### For Students

1. Enter exam details (e.g., date, shift, subject combination).
2. Upload the response sheet URL or paste its content.
3. View detailed analysis if the answer key is available.
4. Submit an answer key for approval if not available.

### For Admins

1. Log in using your authorized GitHub account.
2. Upload answer keys directly.
3. Review and approve student-submitted answer keys.
4. Manage marking schemes and monitor statistics.

---

### Blog Management

Create and manage blog posts for exam preparation:

1. Add markdown files in the `content/blog/[exam]/[year]/` directory.
2. Include proper frontmatter for metadata (e.g., title, date, tags).
3. Blog posts are automatically served at `/blog/[exam]/[year]/[filename]`.

---

## Features Implemented

### Student Interface
- Upload response sheets via URL or paste content.
- Real-time parsing and analysis.
- Subject-wise performance breakdown.
- Submit answer keys for approval.
- Detailed question-by-question analysis.

### Admin Dashboard
- GitHub OAuth authentication with email restrictions.
- Manage answer keys and pending approvals.
- View statistics and perform bulk operations.

### Blog System
- Markdown-based articles with SEO-friendly URLs.
- Organized by exam, year, and subject.
- Responsive design for all devices.

### Production Features
- Error handling and feedback mechanisms.
- Input validation and sanitization.
- Optimized database relationships and constraints.
- SEO enhancements for better visibility.

---

## API Endpoints Reference

### Public Endpoints
- `POST /api/analyze` - Analyze response sheets.
- `POST /api/submit-answer-key` - Submit answer keys for approval.
- `POST /api/parse-pdf` - Parse PDF files.

### Admin Endpoints (Authenticated)
- `GET /api/admin/stats` - View dashboard statistics.
- `GET /api/admin/pending-keys` - List pending answer keys.
- `POST /api/admin/manual-answer-key` - Upload answer keys manually.
- `POST /api/admin/approve-key` - Approve submitted answer keys.
- `POST /api/admin/reject-key` - Reject submitted answer keys.

---

## Troubleshooting Guide

### Common Issues
1. **Database Connection**: Ensure the `DATABASE_URL` in `.env` is correct.
2. **GitHub OAuth**: Verify the callback URL matches exactly.
4. **Admin Access**: Ensure your email is listed in the `admins` table.

### Performance Optimization
- Add database indexes for frequently queried fields.
- Optimize images using Next.js.
- Use static generation for blog posts.
- Cache answer keys for faster access.

---

## Screenshot

![Application Screenshot with sample data usage](https://freeimghost.vercel.app/i/5hQxQZCk/Screenshot-2025-06-26-at-8-39-49-PM-png.png)


