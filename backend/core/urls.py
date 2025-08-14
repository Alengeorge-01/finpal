from django.urls import path
from . import views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    # Account URLs
    path('accounts/', views.AccountList.as_view(), name='account-list'),
    path('accounts/create/', views.AccountCreate.as_view(), name='account-create'),
    path('accounts/<int:pk>/', views.AccountDetail.as_view(), name='account-detail'),
    
    path('auth/google/', views.GoogleLogin.as_view(), name='google_login'),
    
    # User URLs
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('profile/settings/', views.UserProfileSettingsView.as_view(), name='user-profile-settings'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change-password'),
    path('run-round-ups/', views.RunRoundUpsView.as_view(), name='run-round-ups'),

    # Transaction URLs
    path('transactions/', views.TransactionList.as_view(), name='transaction-list'),
    path('transactions/create/', views.TransactionCreate.as_view(), name='transaction-create'),
    path('transactions/<int:pk>/', views.TransactionDetail.as_view(), name='transaction-detail'),
    
    # CSV Upload URL
    path('transactions/bulk-upload/', views.TransactionBulkUploadView.as_view(), name='transaction-bulk-upload'),
    
    # Category URLs
    path('categories/', views.CategoryListCreate.as_view(), name='category-list-create'),
    path('categories/<int:pk>/', views.CategoryDetail.as_view(), name='category-detail'),
    
    # Budget URLs - one for the list, one for a single item
    path('budgets/', views.BudgetListCreate.as_view(), name='budget-list-create'),
    path('budgets/<int:pk>/', views.BudgetDetail.as_view(), name='budget-detail'),
    
    path('stock-price/', views.StockPriceView.as_view(), name='stock-price'),

    # Investment URLs
    path('investments/', views.InvestmentAccountListCreate.as_view(), name='investment-list-create'),
    path('investments/<int:pk>/', views.InvestmentAccountDetail.as_view(), name='investment-detail'),
    path('holdings/', views.HoldingListCreate.as_view(), name='holding-list-create'),
    path('holdings/<int:pk>/', views.HoldingDetail.as_view(), name='holding-detail'),
    
    # Loan URLs
    path('loans/', views.LoanListCreate.as_view(), name='loan-list-create'),
    path('loans/<int:pk>/', views.LoanDetail.as_view(), name='loan-detail'),
    
    # Loan Disbursement URLs
    path('loan-disbursements/', views.LoanDisbursementListCreate.as_view(), name='loan-disbursement-list-create'),
    path('loan-disbursements/<int:pk>/', views.LoanDisbursementDetail.as_view(), name='loan-disbursement-detail'),
    
    # Loan Payment URLs
    path('loan-payments/', views.LoanPaymentListCreate.as_view(), name='loan-payment-list-create'),
    path('loan-payments/<int:pk>/', views.LoanPaymentDetail.as_view(), name='loan-payment-detail'),
    
    # Net Worth URL 
    path('net-worth/', views.NetWorthView.as_view(), name='net-worth'),
    
    # Subscription URL
    path('subscriptions/', views.SubscriptionListCreate.as_view(), name='subscription-list-create'),
    path('subscriptions/<int:pk>/', views.SubscriptionDetail.as_view(), name='subscription-detail'),
    path('subscriptions/discover/', views.discover_subscriptions, name='subscription-discover'),
    
    # AI Goal Planner URL
    path('ai/generate-goal-plan/', views.AIGoalPlannerView.as_view(), name='ai-goal-planner'),
    # AI Category Suggester URL
    path('ai/suggest-category/', views.SuggestCategoryView.as_view(), name='ai-suggest-category'),
    
    # Upcoming Bills URL
    path('upcoming-bills/', views.UpcomingBillsView.as_view(), name='upcoming-bills'),
    
    # Cash Flow Forecast URL
    path('cash-flow-forecast/', views.CashFlowForecastView.as_view(), name='cash-flow-forecast'),
    
    # Debt Optimizer URL
    path('debt-optimizer/', views.DebtOptimizerView.as_view(), name='debt-optimizer'),
    
    # Spending Alerts URL
    path('spending-alerts/', views.SpendingAlertsView.as_view(), name='spending-alerts'),

    # Natural Language Query URL
    path('ai/natural-language-query/', views.AILanguageQueryView.as_view(), name='ai-language-query'),
    
    # Goal URLs - Add these lines
    path('goals/', views.GoalListCreate.as_view(), name='goal-list-create'),
    path('goals/<int:pk>/', views.GoalDetail.as_view(), name='goal-detail'),
    
    # Auth URLs
    path('register/', views.RegisterView.as_view(), name='register'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]