from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify

class Category(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name

class Account(models.Model):
    ACCOUNT_TYPES = [
        ('CHECKING', 'Checking'),
        ('SAVINGS', 'Savings'),
        ('CREDIT', 'Credit Card'),
        ('INVESTMENT', 'Investment'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    account_type = models.CharField(max_length=20, choices=ACCOUNT_TYPES)
    balance = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"{self.name} ({self.user.username})"

class Transaction(models.Model):
    TRANSACTION_TYPES = [
        ('INCOME', 'Income'),
        ('EXPENSE', 'Expense'),
    ]
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    transaction_type = models.CharField(max_length=7, choices=TRANSACTION_TYPES)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    date = models.DateField()

    def __str__(self):
        return f"{self.description} - {self.amount}"
    
class Budget(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    start_date = models.DateField()
    end_date = models.DateField()

    def __str__(self):
        return f"{self.category.name} Budget for {self.user.username}"
    
class InvestmentAccount(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    brokerage = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Holding(models.Model):
    investment_account = models.ForeignKey(InvestmentAccount, on_delete=models.CASCADE, related_name='holdings')
    symbol = models.CharField(max_length=10) # e.g., 'AAPL', 'GOOGL'
    shares = models.DecimalField(max_digits=12, decimal_places=4)
    cost_basis = models.DecimalField(max_digits=12, decimal_places=2) # The total amount paid for the shares

    def __str__(self):
        return f"{self.shares} shares of {self.symbol}"
    
class Loan(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2)
    # We no longer need initial_amount or term_months
    repayment_start_date = models.DateField()

    def save(self, *args, **kwargs):
        if not self.slug:
            from django.utils.text import slugify
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

# New model to track money received for a loan
class LoanDisbursement(models.Model):
    loan = models.ForeignKey(Loan, on_delete=models.CASCADE, related_name='disbursements')
    date = models.DateField()
    amount = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"Disbursement of {self.amount} for {self.loan.name} on {self.date}"


class LoanPayment(models.Model):
    loan = models.ForeignKey(Loan, on_delete=models.CASCADE, related_name='payments')
    date = models.DateField()
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    # is_extra_payment is no longer needed with this calculation method

    def __str__(self):
        return f"Payment of {self.amount} for {self.loan.name} on {self.date}"
    
class NetWorthSnapshot(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField()
    total_assets = models.DecimalField(max_digits=15, decimal_places=2)
    total_liabilities = models.DecimalField(max_digits=15, decimal_places=2)
    net_worth = models.DecimalField(max_digits=15, decimal_places=2)

    class Meta:
        # Ensure only one snapshot per user per day
        unique_together = ('user', 'date')

    def __str__(self):
        return f"{self.user.username}'s Net Worth on {self.date}"
    
class Subscription(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100) # e.g., "Netflix", "Spotify"
    last_payment_date = models.DateField()
    estimated_amount = models.DecimalField(max_digits=10, decimal_places=2)
    # Status to track if the user has confirmed this subscription
    is_active = models.BooleanField(default=True) 

    class Meta:
        # A user should only have one subscription with a given name
        unique_together = ('user', 'name')

    def __str__(self):
        return f"{self.name} subscription for {self.user.username}"
    
class Goal(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    target_amount = models.DecimalField(max_digits=12, decimal_places=2)
    current_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    target_date = models.DateField()

    def __str__(self):
        return self.name
    
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    round_ups_enabled = models.BooleanField(default=False)
    round_up_source_account = models.ForeignKey(Account, on_delete=models.SET_NULL, null=True, blank=True, related_name='round_up_source')
    round_up_target_account = models.ForeignKey(Account, on_delete=models.SET_NULL, null=True, blank=True, related_name='round_up_target')
    last_round_up_run = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"