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

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+ and pip
- Docker and Docker Compose
- Supabase account

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd finpal
```

### 2. Backend Setup (Django)
```bash
cd backend
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

### 3. Frontend Setup (Next.js)
```bash
cd frontend
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
npm run dev
```

### 4. Docker Setup (Recommended)
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

## 🔧 Environment Configuration

### Backend (.env)
```bash
# Database
DB_NAME=your_db_name
DB_USER=your_db_user
DB_HOST=your_db_host
DB_PASS=your_db_password

# Django
SECRET_KEY=your_django_secret_key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Optional: Supabase for backend integration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Frontend (.env.local)
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://itwpcyamstuhiyarrtyz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Analytics (Optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=your_ga_id
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
```

## 🛡️ Security Setup

### Database Security (CRITICAL)
Your database is secured with Row Level Security. The following tables are protected:
- `core_account`, `core_transaction`, `core_category`
- `core_budget`, `core_investmentaccount`, `core_holding`
- `core_loan`, `core_loandisbursement`, `core_loanpayment`
- `core_networthsnapshot`, `core_subscription`, `core_goal`
- `core_userprofile`

### Authentication Flow
1. **Django Auth**: Traditional JWT-based authentication
2. **Supabase Auth**: Modern auth with social providers
3. **Dual Support**: App works with both systems seamlessly

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

### Running Tests
```bash
# Backend tests
cd backend
python manage.py test

# Frontend tests
cd frontend
npm run test
```

### Code Quality
```bash
# Linting
npm run lint

# Type checking
npm run type-check

# Formatting
npm run format
```

### Database Migrations
```bash
# Create new migration
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Reset database (development only)
python manage.py flush
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

**Supabase Connection Errors**
```bash
# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Test connection
npm run test:supabase
```

**Database Migration Issues**
```bash
# Reset migrations (development only)
python manage.py migrate core zero
python manage.py migrate
```

**Authentication Problems**
```bash
# Clear browser storage
localStorage.clear()

# Check JWT token expiration
# Verify Supabase project settings
```

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
