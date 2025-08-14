from django.contrib import admin
from .models import Account, Transaction, Category, Budget, InvestmentAccount, Holding, Loan, LoanPayment, NetWorthSnapshot, Subscription, Goal, UserProfile

admin.site.register(Account)
admin.site.register(Transaction)
admin.site.register(Category)
admin.site.register(Budget)
admin.site.register(InvestmentAccount)
admin.site.register(Holding)
admin.site.register(Loan)
admin.site.register(LoanPayment)
admin.site.register(NetWorthSnapshot)
admin.site.register(Subscription)
admin.site.register(Goal)
admin.site.register(UserProfile)