# Exam Response Analyzer

A comprehensive web application for analyzing exam response sheets with subject-wise performance breakdown.

## Features

- **Student Interface**: Upload response sheets and get detailed analysis
- **Admin Dashboard**: Manage answer keys and approve submissions
- **Blog System**: SEO-friendly blog posts for exam preparation
- **GitHub OAuth**: Secure admin authentication
- **MySQL Database**: Robust data storage with Prisma ORM

## Setup Instructions

### 1. Clone and Install

\`\`\`bash
git clone <repository-url>
cd exam-response-analyzer
npm install
\`\`\`

### 2. Database Setup

\`\`\`bash
# Create MySQL database
mysql -u root -p < scripts/init-database.sql

# Configure environment variables
cp .env.example .env
# Edit .env with your database credentials
\`\`\`

### 3. Prisma Setup

\`\`\`bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push
\`\`\`

### 4. GitHub OAuth Setup

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL to: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Client Secret to `.env`

### 5. Admin Configuration

Update the `scripts/init-database.sql` file with your GitHub email address to grant admin access.

### 6. Run the Application

\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000` to access the application.

## Usage

### For Students

1. Enter exam details (date, shift, subject combination)
2. Upload response sheet URL or paste content
3. Get detailed analysis if answer key is available
4. Submit answer key for approval if not available

### For Admins

1. Login with authorized GitHub account
2. Upload answer keys directly
3. Review and approve student-submitted answer keys
4. Manage marking schemes

### Blog Management

1. Create markdown files in `content/blog/[exam]/[year]/`
2. Use proper frontmatter for metadata
3. Files are automatically served at `/blog/[exam]/[year]/[filename]`

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Database Hosting

- Use PlanetScale, Railway, or any MySQL hosting service
- Update `DATABASE_URL` in environment variables

## Environment Variables

\`\`\`env
DATABASE_URL="mysql://username:password@host:port/database"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-secret-key"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
\`\`\`

## API Endpoints

- `POST /api/analyze` - Analyze response sheet
- `POST /api/submit-answer-key` - Submit answer key for approval
- `GET /api/admin/pending-keys` - Get pending answer keys (admin)
- `POST /api/admin/upload-answer-key` - Upload answer key (admin)
- `POST /api/admin/approve-key` - Approve answer key (admin)
- `POST /api/admin/reject-key` - Reject answer key (admin)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License

## Production Deployment Checklist

### Pre-deployment
- [ ] Update admin emails in `scripts/seed-database.sql`
- [ ] Set up MySQL database (PlanetScale, Railway, etc.)
- [ ] Configure GitHub OAuth app
- [ ] Set up environment variables
- [ ] Test all functionality locally

### Environment Variables
\`\`\`env
# Required for production
DATABASE_URL="mysql://username:password@host:port/database"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-secret-key-min-32-chars"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
\`\`\`

### Database Setup
\`\`\`bash
# Initialize database
npm run db:push

# Seed with sample data
npm run db:seed

# Reset database (development only)
npm run db:reset
\`\`\`

### Features Implemented

✅ **Complete Student Interface**
- Response sheet URL/paste/PDF upload
- Real-time parsing and analysis
- Subject-wise performance breakdown
- Answer key submission for approval
- Detailed question-by-question analysis

✅ **Complete Admin Interface**
- GitHub OAuth authentication with email restrictions
- Answer key upload and management
- Pending approval workflow
- Admin statistics dashboard
- Bulk operations support

✅ **Complete Blog System**
- Markdown-based articles
- SEO-friendly URLs
- Organized by exam/year/subject
- Automatic content discovery
- Responsive design

✅ **Production Features**
- Error boundaries and handling
- Loading states and feedback
- Input validation and sanitization
- Database relationships and constraints
- Responsive design
- SEO optimization

### API Endpoints Reference

#### Public Endpoints
- `POST /api/analyze` - Analyze response sheet
- `POST /api/submit-answer-key` - Submit answer key for approval
- `POST /api/parse-pdf` - Parse PDF file

#### Admin Endpoints (Authenticated)
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/pending-keys` - Get pending answer keys
- `POST /api/admin/upload-answer-key` - Upload answer key
- `POST /api/admin/approve-key` - Approve pending answer key
- `POST /api/admin/reject-key` - Reject pending answer key

### Troubleshooting

#### Common Issues
1. **Database Connection**: Ensure DATABASE_URL is correct
2. **GitHub OAuth**: Check callback URL matches exactly
3. **PDF Parsing**: Large files may timeout, use paste method
4. **Admin Access**: Verify email is in admin table

#### Performance Optimization
- Database indexes on frequently queried fields
- Image optimization with Next.js
- Static generation for blog posts
- Caching for answer keys
