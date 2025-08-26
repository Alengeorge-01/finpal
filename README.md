# 💰 FinPal - Personal Financial Management App

A comprehensive financial management application built with Django, Next.js, and Supabase, featuring secure user authentication, transaction tracking, budgeting, investment monitoring, and AI-powered financial planning.

## 🏗️ Architecture

- **Backend**: Django REST API with PostgreSQL
- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Dual-provider support (Django JWT + Supabase Auth)
- **Deployment**: Docker containers with docker-compose

## ✨ Features

### 💳 Core Financial Management
- **Account Management**: Multiple account types (checking, savings, credit cards)
- **Transaction Tracking**: Income, expenses, and transfers with categorization
- **Budget Planning**: Category-based budgets with spending alerts
- **Investment Monitoring**: Portfolio tracking with holdings and performance
- **Loan Management**: Track loans, payments, and disbursements
- **Net Worth Tracking**: Historical snapshots and trend analysis

### 🤖 Smart Features
- **AI Financial Planner**: Personalized financial advice and planning
- **Subscription Tracking**: Monitor recurring payments
- **Debt Optimization**: Strategies for paying off debts efficiently
- **Cash Flow Forecasting**: Predict future financial positions
- **Round-up Savings**: Automatic micro-investments

### 🔒 Security & Authentication
- **Row Level Security (RLS)**: Database-level data isolation
- **Dual Authentication**: Support for both Django and Supabase auth
- **Strong Password Validation**: Enforced complexity requirements
- **OAuth Integration**: Google Sign-in with secure callbacks
- **Session Management**: Auto-refresh tokens and secure logout

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js 18+** and npm
- **Python 3.9+** and pip
- **Supabase account** (for database and auth)
- **Git** for version control

### Step 1: Clone and Setup Project
```bash
# Clone the repository
git clone https://github.com/yourusername/finpal.git
cd finpal

# Make scripts executable (if using Makefile)
chmod +x Makefile
```

### Step 2: Database Setup (Supabase)
1. **Create Supabase Project**: Go to [supabase.com](https://supabase.com) and create a new project
2. **Get Credentials**: Copy your project URL and anon key from Settings > API
3. **Configure OAuth Redirects**: Go to Authentication → URL Configuration and add:
   - **Site URL**: `http://localhost:3000`
   - **Redirect URLs**: `http://localhost:3000/auth/callback`
4. **Apply Security Fixes**: Run the provided SQL script to secure your database

```bash
# Copy the contents of SUPABASE_FIX_ALL_RLS_ISSUES.sql
# Paste and run in your Supabase SQL Editor
# This fixes all 28 security and performance issues
```

**🔥 CRITICAL**: Without step 3, Google OAuth will fail!

### Step 3: Environment Variables Setup

**Backend Environment (`.env` in root directory):**
```bash
# Create environment file
touch .env

# Add your database credentials
echo "DB_HOST=aws-0-ap-southeast-2.pooler.supabase.com" >> .env
echo "DB_NAME=postgres" >> .env
echo "DB_USER=postgres.your-project-ref" >> .env
echo "DB_PASS=your-database-password" >> .env
echo "ALPHA_VANTAGE_API_KEY=your-api-key" >> .env
```

**Frontend Environment (`.env.local` in frontend directory):**
```bash
# Create frontend environment file
cd frontend
touch .env.local

# Add Supabase credentials
echo "NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co" >> .env.local
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key" >> .env.local
```

### Step 4: Backend Setup (Django)
```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Run database migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start Django development server
python manage.py runserver 8000
```

### Step 5: Frontend Setup (Next.js)
```bash
# Navigate to frontend directory (open new terminal)
cd frontend

# Install Node.js dependencies
npm install

# Build the project
npm run build

# Start Next.js development server
npm run dev
```

### Step 6: Verify Setup
```bash
# Check Django server
curl http://localhost:8000/api/

# Check Next.js server
curl http://localhost:3000

# Check Supabase connection in browser
# Visit http://localhost:3000 and try authentication
```

### Step 7: Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Django Admin**: http://localhost:8000/admin (if superuser created)

### 🐳 Alternative: Docker Setup
```bash
# Start all services with Docker
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🔧 Environment Configuration

### Backend (.env) - Root Directory
```bash
# Supabase Database Connection
DB_HOST=aws-0-ap-southeast-2.pooler.supabase.com
DB_NAME=postgres
DB_USER=postgres.your-project-ref
DB_PASS=your-database-password

# Django Settings
SECRET_KEY=your-django-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0

# External APIs
ALPHA_VANTAGE_API_KEY=your-alpha-vantage-key

# Optional: Supabase Service Role (for backend operations)
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Frontend (.env.local) - Frontend Directory
```bash
# Supabase Public Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxx
```

### 🔑 Where to Find Your Supabase Credentials
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Project API keys** → `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Go to **Settings** → **Database**
6. Copy connection string details for backend `.env`

### 🔐 Google OAuth Configuration (REQUIRED)
**In your Supabase Dashboard:**

1. **Enable Google Provider**:
   - Go to **Authentication** → **Providers**
   - Enable **Google**
   - Add your Google OAuth credentials (Client ID & Secret)

2. **Set Redirect URLs**:
   - Go to **Authentication** → **URL Configuration**
   - Set **Site URL**: `http://localhost:3000`
   - Add **Redirect URL**: `http://localhost:3000/auth/callback`

3. **For Production**: Replace `localhost:3000` with your domain

⚠️ **Without these settings, Google sign-in will redirect to wrong URLs!**

## 🛡️ Security Setup (CRITICAL)

### 🚨 Database Security - Row Level Security (RLS)
**⚠️ IMPORTANT**: You MUST run the security SQL script before using the app!

```bash
# 1. Open your Supabase Dashboard
# 2. Go to SQL Editor
# 3. Copy all contents from: SUPABASE_FIX_ALL_RLS_ISSUES.sql
# 4. Paste and run the script
# 5. Verify 0 security issues in dashboard
```

**What this script does:**
- ✅ Enables RLS on all 28 database tables
- ✅ Creates secure access policies
- ✅ Fixes all security and performance issues
- ✅ Protects user financial data

### 🔒 Protected Tables
**Financial Data Tables:**
- `core_account`, `core_transaction`, `core_category`
- `core_budget`, `core_investmentaccount`, `core_holding`
- `core_loan`, `core_loandisbursement`, `core_loanpayment`
- `core_networthsnapshot`, `core_subscription`, `core_goal`
- `core_userprofile`

**Authentication Tables:**
- `auth_user`, `auth_permission`, `auth_group`
- `account_emailaddress`, `socialaccount_socialaccount`
- All Django authentication and session tables

### 🔐 Authentication Flow
1. **Supabase Auth** (Recommended): Modern authentication with OAuth
2. **Django Auth**: Traditional JWT-based authentication
3. **Dual Support**: Seamless switching between providers

## 📱 API Endpoints

### Authentication
- `POST /dj-rest-auth/login/` - Django login
- `POST /dj-rest-auth/logout/` - Django logout
- `POST /dj-rest-auth/token/refresh/` - Refresh JWT token

### Financial Data
- `GET/POST /api/accounts/` - Account management
- `GET/POST /api/transactions/` - Transaction operations
- `GET/POST /api/budgets/` - Budget management
- `GET/POST /api/categories/` - Category management
- `GET/POST /api/goals/` - Financial goals
- `GET/POST /api/investments/` - Investment tracking

## 🎨 UI Components

Built with **shadcn/ui** components:
- Modern, accessible design system
- Dark/light mode support
- Responsive layouts
- Form validation
- Data visualization with Recharts

## 📊 Database Schema

### Core Models
- **User**: Django auth user model
- **UserProfile**: Extended user settings and preferences
- **Account**: Financial accounts (checking, savings, etc.)
- **Transaction**: Income/expense records
- **Category**: Transaction categorization
- **Budget**: Budget allocations and tracking
- **Goal**: Financial objectives and progress
- **Investment**: Portfolio and holdings management
- **Loan**: Debt tracking and payments

## 🧪 Development

### 🧪 Running Tests
```bash
# Backend tests
cd backend
python manage.py test

# Frontend tests
cd frontend
npm run test
npm run test:watch  # Watch mode
```

### 🎨 Code Quality
```bash
# Frontend linting and formatting
cd frontend
npm run lint          # ESLint check
npm run lint:fix      # Auto-fix linting issues
npm run type-check    # TypeScript validation
npm run format        # Prettier formatting

# Backend code quality
cd backend
python manage.py check     # Django system checks
black .                     # Python formatting
flake8 .                   # Python linting
```

### 🗄️ Database Management
```bash
# Create new migration (after model changes)
cd backend
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Show migration status
python manage.py showmigrations

# Reset database (development only - DANGER!)
python manage.py flush
python manage.py migrate
```

### 🚀 Quick Development Commands
```bash
# Start both servers simultaneously
# Terminal 1: Backend
cd backend && python manage.py runserver 8000

# Terminal 2: Frontend  
cd frontend && npm run dev

# Or using Docker (single command)
docker-compose up -d
```

## 🔄 Authentication Providers

### Using Django Authentication
```typescript
import { useAuthStore } from '@/store/auth-store';

const { login, logout, status } = useAuthStore();

// Login
await login(accessToken, refreshToken);

// Check status
if (status === 'authenticated') {
  // User is logged in with Django
}
```

### Using Supabase Authentication
```typescript
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth-store';

const { loginWithSupabase } = useAuthStore();

// Email/Password login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});

// Google OAuth
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google'
});

if (data.user) {
  loginWithSupabase(data.user);
}
```

## 🚢 Deployment

### Production Checklist
- [ ] Set `DEBUG=False` in Django settings
- [ ] Configure production database
- [ ] Set up proper CORS origins
- [ ] Configure environment variables
- [ ] Set up SSL certificates
- [ ] Configure domain and DNS
- [ ] Set up monitoring and logging

### Docker Production
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

## 📈 Performance Optimization

### Database
- Remove unused indexes after deployment
- Set up database connection pooling
- Configure read replicas for scaling

### Frontend
- Enable Next.js image optimization
- Configure CDN for static assets
- Implement code splitting and lazy loading

## 🐛 Troubleshooting

### Common Issues

**🔌 Supabase Connection Errors**
```bash
# Check environment variables are set
cd frontend
cat .env.local | grep SUPABASE

# Test if Supabase is accessible
curl https://your-project-ref.supabase.co

# Verify authentication setup
# Open browser console on login page for errors
```

**🗄️ Database Issues**
```bash
# Check Django can connect to Supabase
cd backend
python manage.py dbshell

# Reset migrations (development only - DANGER!)
python manage.py migrate core zero
python manage.py migrate

# Check migration status
python manage.py showmigrations
```

**🔐 Authentication Problems**
```bash
# Clear browser storage and cookies
# In browser console:
localStorage.clear()
sessionStorage.clear()

# Check Supabase auth settings:
# Dashboard → Authentication → URL Configuration
# Ensure redirect URLs are correct

# Test Django admin access
# Visit: http://localhost:8000/admin
```

**⚙️ Build Issues**
```bash
# Clear Next.js cache
cd frontend
rm -rf .next
npm run build

# Clear node modules
rm -rf node_modules
npm install

# Check for TypeScript errors
npm run type-check
```

**🐳 Docker Issues**
```bash
# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Check container logs
docker-compose logs frontend
docker-compose logs backend
```

### 🆘 Getting Help

**Security Issues (RLS not working):**
1. Verify you ran `SUPABASE_FIX_ALL_RLS_ISSUES.sql`
2. Check Supabase Dashboard → Database → Policies
3. All tables should show "RLS enabled"

**Performance Issues:**
1. Check Supabase Dashboard → Reports → Security
2. Should show 0 security warnings

**Connection Issues:**
1. Verify environment variables match Supabase dashboard
2. Check network connectivity
3. Ensure Supabase project is not paused

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Django](https://djangoproject.com/) - Backend framework
- [Next.js](https://nextjs.org/) - Frontend framework
- [Supabase](https://supabase.com/) - Database and authentication
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Recharts](https://recharts.org/) - Data visualization

---

## 📞 Support

For support, email support@finpal.app or create an issue in this repository.

**Happy Financial Planning! 💰**
