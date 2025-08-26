# Contributing to FinPal 🤝

Thank you for your interest in contributing to FinPal! This document provides guidelines for contributing to the project.

## 📋 Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)

## 📜 Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

- **Be respectful**: Treat all contributors with respect and kindness
- **Be collaborative**: Work together to improve the project
- **Be constructive**: Provide helpful feedback and suggestions
- **Be inclusive**: Welcome contributors from all backgrounds

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+ and pip
- Docker and Docker Compose
- Git

### Setup Development Environment
```bash
# Clone the repository
git clone <repository-url>
cd finpal

# Run initial setup
make setup

# Start development servers
make dev
```

## 🔄 Development Workflow

### 1. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes
- Follow the coding standards below
- Add tests for new functionality
- Update documentation as needed

### 3. Test Your Changes
```bash
# Run all tests
make test

# Check linting
cd frontend && npm run lint
```

### 4. Commit Your Changes
```bash
git add .
git commit -m "feat: add your feature description"
```

Use conventional commit messages:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

## 🔀 Pull Request Process

1. **Update Documentation**: Ensure README.md is updated if needed
2. **Add Tests**: Include tests for any new functionality
3. **Check Build**: Ensure `make build` passes
4. **Create PR**: Submit a pull request with:
   - Clear description of changes
   - Reference to any related issues
   - Screenshots for UI changes

### PR Template
```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes
```

## 📝 Coding Standards

### Frontend (Next.js/TypeScript)
- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Use functional components with hooks
- Implement proper error handling
- Use semantic HTML and accessibility features

```typescript
// Good
interface UserProps {
  id: string;
  name: string;
}

const UserCard: React.FC<UserProps> = ({ id, name }) => {
  return (
    <div className="user-card">
      <h3>{name}</h3>
    </div>
  );
};

// Bad
const UserCard = (props: any) => {
  return <div>{props.name}</div>;
};
```

### Backend (Django/Python)
- Follow PEP 8 style guidelines
- Use type hints where possible
- Implement proper error handling
- Write docstrings for functions and classes
- Use Django best practices

```python
# Good
from typing import List, Optional
from django.db import models

class Transaction(models.Model):
    """Model representing a financial transaction."""
    
    amount: models.DecimalField = models.DecimalField(
        max_digits=10, 
        decimal_places=2
    )
    
    def calculate_total(self) -> float:
        """Calculate the total transaction amount."""
        return float(self.amount)

# Bad
class Transaction(models.Model):
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    def calculate_total(self):
        return self.amount
```

### Database
- Use meaningful table and column names
- Include appropriate indexes
- Implement Row Level Security (RLS) for user data
- Write migration scripts for schema changes

## 🧪 Testing Guidelines

### Frontend Testing
```typescript
// Component testing with React Testing Library
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TransactionForm } from './TransactionForm';

test('should submit transaction form', async () => {
  const mockSubmit = jest.fn();
  render(<TransactionForm onSubmit={mockSubmit} />);
  
  await userEvent.type(screen.getByLabelText(/amount/i), '100');
  await userEvent.click(screen.getByRole('button', { name: /submit/i }));
  
  expect(mockSubmit).toHaveBeenCalledWith({ amount: 100 });
});
```

### Backend Testing
```python
# Django testing
from django.test import TestCase
from django.contrib.auth.models import User
from .models import Transaction

class TransactionModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass'
        )
    
    def test_transaction_creation(self):
        transaction = Transaction.objects.create(
            user=self.user,
            amount=100.00,
            description='Test transaction'
        )
        self.assertEqual(transaction.amount, 100.00)
        self.assertEqual(str(transaction), 'Test transaction')
```

## 🐛 Reporting Issues

When reporting issues, please include:

1. **Clear Title**: Descriptive title of the issue
2. **Environment**: OS, browser, versions
3. **Steps to Reproduce**: Detailed steps
4. **Expected Behavior**: What should happen
5. **Actual Behavior**: What actually happens
6. **Screenshots**: If applicable
7. **Logs**: Any relevant error messages

## 💡 Feature Requests

For new features:

1. **Check Existing Issues**: See if already requested
2. **Describe the Problem**: What problem does this solve?
3. **Propose Solution**: How should it work?
4. **Consider Alternatives**: Other possible solutions
5. **Additional Context**: Any other relevant information

## 🏆 Recognition

Contributors will be recognized in:
- Project README.md
- Release notes
- Hall of Fame section (coming soon)

## 📞 Getting Help

Need help? Reach out:
- **GitHub Issues**: For bugs and feature requests
- **Discussions**: For questions and general discussion
- **Email**: support@finpal.app

Thank you for contributing to FinPal! 🎉
