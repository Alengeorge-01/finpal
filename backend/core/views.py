import os # This was the missing import
import requests
from django.db.models import Sum, Count,Avg, StdDev
from rest_framework import generics
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from django.contrib.auth.models import User
from collections import defaultdict
import csv
import io
from decimal import Decimal, InvalidOperation
from rest_framework.decorators import api_view, permission_classes

from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView

from datetime import date, timedelta, datetime, timezone
from dateutil.relativedelta import relativedelta

from .models import (
    Account, Transaction, Category, Budget,
    InvestmentAccount, Holding, Loan, LoanPayment,
    LoanDisbursement, NetWorthSnapshot, Subscription, Goal, UserProfile
)
from .serializers import (
    AccountSerializer, UserSerializer, RegisterSerializer, TransactionSerializer,
    CategorySerializer, BudgetSerializer, InvestmentAccountSerializer,
    HoldingSerializer, LoanSerializer, LoanPaymentSerializer,
    LoanDisbursementSerializer, NetWorthSnapshotSerializer, SubscriptionSerializer, ChangePasswordSerializer,
    TransactionBulkCreateSerializer, GoalSerializer, UserProfileSerializer
)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    # Use the specific serializer for registration
    serializer_class = RegisterSerializer

# ...   

class UserProfileView(generics.RetrieveUpdateAPIView):
    # This view correctly uses the UserSerializer
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
    
class AccountCreate(generics.CreateAPIView):
    serializer_class = AccountSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class AccountList(generics.ListAPIView):
    serializer_class = AccountSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Account.objects.filter(user=self.request.user)
    
class AccountDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AccountSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Ensure that users can only access their own accounts
        return Account.objects.filter(user=self.request.user)

class UserProfileSettingsView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        # Get or create the profile for the user
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        return profile

class ChangePasswordView(generics.UpdateAPIView):
    """
    An endpoint for changing password.
    """
    serializer_class = ChangePasswordSerializer
    model = User
    permission_classes = [IsAuthenticated]

    def get_object(self, queryset=None):
        return self.request.user

    def update(self, request, *args, **kwargs):
        self.object = self.get_object()
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            # Check old password
            if not self.object.check_password(serializer.data.get("old_password")):
                return Response({"old_password": ["Wrong password."]}, status=status.HTTP_400_BAD_REQUEST)
            # set_password hashes the password
            self.object.set_password(serializer.data.get("new_password"))
            self.object.save()
            return Response({"status": "password set"}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TransactionList(generics.ListAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(account__user=self.request.user).order_by('-date')

class TransactionCreate(generics.CreateAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Ensure the user owns the account they're assigning the transaction to.
        account = serializer.validated_data.get('account')
        if account.user != self.request.user:
            raise PermissionDenied("You do not have permission to modify this account.")
        serializer.save()
        
class TransactionDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Ensure that users can only access their own transactions
        return Transaction.objects.filter(account__user=self.request.user)
    
class TransactionBulkUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        csv_file = request.FILES.get('file')
        account_id = request.data.get('account_id')

        if not csv_file:
            return Response({'error': 'A CSV file is required.'}, status=400)
        if not account_id:
            return Response({'error': 'An account ID is required.'}, status=400)

        try:
            account = Account.objects.get(id=account_id, user=request.user)
        except Account.DoesNotExist:
            return Response({'error': 'Account not found or you do not have permission.'}, status=404)

        try:
            decoded_file = csv_file.read().decode('utf-8')
            io_string = io.StringIO(decoded_file)
            reader = csv.DictReader(io_string)

            transactions_to_create = []
            for row in reader:
                amount = Decimal(row.get('Amount', 0))
                transaction_data = {
                    'description': row.get('Description'),
                    'amount': abs(amount),
                    'transaction_type': 'INCOME' if amount > 0 else 'EXPENSE',
                    'date': row.get('Date'),
                    'category_name': row.get('Category', '').strip(),
                    'account': account.id,
                }
                transactions_to_create.append(transaction_data)

            serializer = TransactionBulkCreateSerializer(data=transactions_to_create, many=True, context={'request': request})

            if serializer.is_valid(raise_exception=True):
                serializer.save()
                return Response({'message': f'{len(serializer.data)} transactions uploaded successfully.'}, status=201)

        except Exception as e:
            return Response({'error': str(e)}, status=400)
        
class CategoryListCreate(generics.ListCreateAPIView):
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        
class CategoryDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)
        
class BudgetListCreate(generics.ListCreateAPIView):
    serializer_class = BudgetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# This view handles updating and deleting a single budget
class BudgetDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = BudgetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user)

class StockPriceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        symbol = request.query_params.get('symbol')
        # This line will now work because 'os' is imported
        api_key = os.environ.get('ALPHA_VANTAGE_API_KEY') 
        
        if not symbol:
            return Response({'error': 'A stock symbol must be provided.'}, status=400)

        url = f'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol}&apikey={api_key}'
        
        try:
            response = requests.get(url)
            data = response.json()
            
            if "Global Quote" in data and "05. price" in data["Global Quote"]:
                price = data["Global Quote"]["05. price"]
                return Response({'symbol': symbol, 'price': float(price)})
            else:
                return Response({'error': 'Invalid symbol or API limit reached.'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=500)
            
class InvestmentAccountListCreate(generics.ListCreateAPIView):
    serializer_class = InvestmentAccountSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return InvestmentAccount.objects.filter(user=self.request.user)
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class InvestmentAccountDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = InvestmentAccountSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return InvestmentAccount.objects.filter(user=self.request.user)

class HoldingListCreate(generics.ListCreateAPIView):
    serializer_class = HoldingSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return Holding.objects.filter(investment_account__user=self.request.user)
    def perform_create(self, serializer):
        account_id = self.request.data.get('investment_account')
        try:
            account = InvestmentAccount.objects.get(id=account_id, user=self.request.user)
            serializer.save(investment_account=account)
        except InvestmentAccount.DoesNotExist:
            raise PermissionDenied("You do not own this investment account.")

class HoldingDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = HoldingSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return Holding.objects.filter(investment_account__user=self.request.user)
    
# --- Loan Views ---
class LoanListCreate(generics.ListCreateAPIView):
    serializer_class = LoanSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Loan.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class LoanDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = LoanSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Loan.objects.filter(user=self.request.user)

# --- Loan Payment Views ---
class LoanPaymentListCreate(generics.ListCreateAPIView):
    serializer_class = LoanPaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return LoanPayment.objects.filter(loan__user=self.request.user)

    def perform_create(self, serializer):
        loan_id = self.request.data.get('loan')
        try:
            loan = Loan.objects.get(id=loan_id, user=self.request.user)
            serializer.save(loan=loan)
        except Loan.DoesNotExist:
            raise PermissionDenied("You do not have permission to add a payment to this loan.")

class LoanPaymentDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = LoanPaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return LoanPayment.objects.filter(loan__user=self.request.user)
    
# --- LoanDisbursement Views ---
class LoanDisbursementListCreate(generics.ListCreateAPIView):
    serializer_class = LoanDisbursementSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return LoanDisbursement.objects.filter(loan__user=self.request.user)

    def perform_create(self, serializer):
        loan_id = self.request.data.get('loan')
        try:
            loan = Loan.objects.get(id=loan_id, user=self.request.user)
            serializer.save(loan=loan)
        except Loan.DoesNotExist:
            raise PermissionDenied("You do not have permission to add a disbursement to this loan.")

class LoanDisbursementDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = LoanDisbursementSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return LoanDisbursement.objects.filter(loan__user=self.request.user)
    
class NetWorthView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        today = date.today()

        total_account_balance = Account.objects.filter(user=user).aggregate(Sum('balance'))['balance__sum'] or 0
        total_investment_balance = Holding.objects.filter(investment_account__user=user).aggregate(Sum('cost_basis'))['cost_basis__sum'] or 0
        current_total_assets = total_account_balance + total_investment_balance

        current_total_liabilities = 0
        user_loans = Loan.objects.filter(user=user).prefetch_related('disbursements', 'payments')
        for loan in user_loans:
            all_events = []
            for d in loan.disbursements.all(): all_events.append({'type': 'disbursement', 'date': d.date, 'amount': d.amount})
            for p in loan.payments.all(): all_events.append({'type': 'payment', 'date': p.date, 'amount': p.amount})
            all_events.sort(key=lambda x: x['date'])
            if not all_events: continue
            balance = 0
            last_event_date = all_events[0]['date']
            daily_rate = loan.interest_rate / 100 / 365
            for event in all_events:
                days = (event['date'] - last_event_date).days
                if days > 0 and balance > 0: balance += balance * daily_rate * days
                balance += event['amount'] if event['type'] == 'disbursement' else -event['amount']
                last_event_date = event['date']
            days_to_today = (today - last_event_date).days
            if days_to_today > 0 and balance > 0: balance += balance * daily_rate * days_to_today
            current_total_liabilities += balance if balance > 0 else 0

        NetWorthSnapshot.objects.update_or_create(
            user=user, date=today,
            defaults={
                'total_assets': current_total_assets,
                'total_liabilities': current_total_liabilities,
                'net_worth': current_total_assets - current_total_liabilities
            }
        )

        snapshots = NetWorthSnapshot.objects.filter(user=user).order_by('date')
        serializer = NetWorthSnapshotSerializer(snapshots, many=True)
        return Response(serializer.data)
    
class SubscriptionListCreate(generics.ListCreateAPIView):
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Subscription.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class SubscriptionDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Subscription.objects.filter(user=self.request.user)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def discover_subscriptions(request):
    user = request.user
    # FIX: Fetch all transactions, ignoring pagination for this specific task
    transactions = Transaction.objects.filter(account__user=user, transaction_type='EXPENSE').all()
    
    potential_subscriptions = defaultdict(list)
    for t in transactions:
        # Simple normalization to group similar transactions
        normalized_desc = ''.join([i for i in t.description if not i.isdigit()]).strip().lower()
        if normalized_desc:
            potential_subscriptions[normalized_desc].append(t)

    newly_found_count = 0
    for desc, trans_list in potential_subscriptions.items():
        # Consider it a subscription if it appears more than once
        if len(trans_list) > 1:
            # Check if a subscription with this name already exists
            if not Subscription.objects.filter(user=user, name__iexact=desc).exists():
                latest_transaction = max(trans_list, key=lambda x: x.date)
                
                Subscription.objects.create(
                    user=user,
                    name=desc.title(), # Capitalize for display
                    last_payment_date=latest_transaction.date,
                    estimated_amount=latest_transaction.amount
                )
                newly_found_count += 1

    return Response({'message': f'Discovery complete. Found {newly_found_count} new potential subscriptions.'})

class AIGoalPlannerView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_prompt = request.data.get('prompt')

        if not user_prompt:
            return Response({'error': 'A prompt is required.'}, status=400)

        # This is our mock AI response. In the future, we would send the
        # user_prompt to a real AI service and get a response like this.
        mock_ai_response = {
            "goal_title": "Save for a House Down Payment",
            "target_amount": 50000,
            "target_date": "2028-07-31",
            "steps": [
                {
                    "step": 1,
                    "title": "Open a High-Yield Savings Account (HYSA)",
                    "description": "Research and open a dedicated HYSA to keep your down payment funds separate and earn higher interest than a standard savings account.",
                    "completed": False
                },
                {
                    "step": 2,
                    "title": "Automate Monthly Savings",
                    "description": "Set up an automatic recurring transfer of $1,388 from your main checking account to your new HYSA each month.",
                    "completed": False
                },
                {
                    "step": 3,
                    "title": "Review and Cut Unnecessary Spending",
                    "description": "Analyze your monthly spending habits on the 'Categories' page. Identify 2-3 areas where you can cut back to potentially increase your savings rate.",
                    "completed": False
                }
            ]
        }
        
        return Response(mock_ai_response)
    
# --- Goal Views ---
class GoalListCreate(generics.ListCreateAPIView):
    serializer_class = GoalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Goal.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class GoalDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = GoalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Goal.objects.filter(user=self.request.user)
    
class SuggestCategoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        description = request.query_params.get('description', '').strip().lower()
        user = request.user

        if not description:
            return Response({})

        matching_transactions = Transaction.objects.filter(
            account__user=user,
            description__icontains=description,
            category__isnull=False
        )

        if not matching_transactions.exists():
            return Response({})

        # Count which category appears most often for this description
        most_common_category = matching_transactions.values('category') \
                                                    .annotate(count=Count('category')) \
                                                    .order_by('-count') \
                                                    .first()
        
        if most_common_category:
            category_id = most_common_category['category']
            category = Category.objects.get(id=category_id)
            serializer = CategorySerializer(category)
            return Response(serializer.data)

        return Response({})
    
class UpcomingBillsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        subscriptions = Subscription.objects.filter(user=user, is_active=True)

        upcoming_bills = []
        today = date.today()

        for sub in subscriptions:
            last_payment = sub.last_payment_date
            # Simple prediction: assume monthly billing
            predicted_next_payment = last_payment + relativedelta(months=1)

            # If the predicted date is in the past, keep adding months until it's in the future
            while predicted_next_payment < today:
                predicted_next_payment += relativedelta(months=1)

            upcoming_bills.append({
                'id': sub.id,
                'name': sub.name,
                'estimated_amount': sub.estimated_amount,
                'predicted_date': predicted_next_payment,
            })

        # Sort the bills by the closest due date
        upcoming_bills.sort(key=lambda x: x['predicted_date'])

        return Response(upcoming_bills)
    
class CashFlowForecastView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        today = date.today()
        forecast_end_date = today + timedelta(days=30)
        
        # 1. Get current cash balance (sum of all 'CHECKING' and 'SAVINGS' accounts)
        try:
            cash_accounts = Account.objects.filter(user=user, account_type__in=['CHECKING', 'SAVINGS'])
            current_balance = cash_accounts.aggregate(Sum('balance'))['balance__sum'] or 0
        except Account.DoesNotExist:
            current_balance = 0

        # --- 2. Predict upcoming bills (using our existing logic) ---
        subscriptions = Subscription.objects.filter(user=user, is_active=True)
        predicted_expenses = []
        for sub in subscriptions:
            next_payment_date = sub.last_payment_date + relativedelta(months=1)
            while next_payment_date < today:
                next_payment_date += relativedelta(months=1)
            if today <= next_payment_date <= forecast_end_date:
                predicted_expenses.append({'date': next_payment_date, 'amount': -abs(sub.estimated_amount)})

        # --- 3. Predict recurring income ---
        # Find transactions marked as 'Income' that have occurred at least twice
        recurring_income_sources = Transaction.objects.filter(
            account__user=user,
            transaction_type='INCOME'
        ).values('description').annotate(count=Count('id')).filter(count__gt=1)

        predicted_income = []
        for source in recurring_income_sources:
            desc = source['description']
            # Find the most recent transaction for this income source
            latest_income_transaction = Transaction.objects.filter(
                account__user=user,
                transaction_type='INCOME',
                description=desc
            ).latest('date')
            
            # Simple prediction: assume it occurs monthly on the same day
            next_income_date = latest_income_transaction.date + relativedelta(months=1)
            if today <= next_income_date <= forecast_end_date:
                predicted_income.append({'date': next_income_date, 'amount': latest_income_transaction.amount})

        # --- 4. Generate the 30-day forecast ---
        all_events = predicted_expenses + predicted_income
        all_events.sort(key=lambda x: x['date'])

        forecast_data = [{'date': today.strftime('%Y-%m-%d'), 'balance': float(current_balance)}]
        running_balance = float(current_balance)
        
        # Create a point for each day in the forecast
        for i in range(1, 31):
            current_date = today + timedelta(days=i)
            daily_change = 0
            for event in all_events:
                if event['date'] == current_date:
                    daily_change += float(event['amount'])
            
            running_balance += daily_change
            forecast_data.append({'date': current_date.strftime('%Y-%m-%d'), 'balance': running_balance})

        return Response(forecast_data)
    
class DebtOptimizerView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        try:
            extra_payment = Decimal(request.query_params.get('extra_payment', '0'))
        except:
            return Response({'error': 'Invalid extra payment amount.'}, status=400)

        loans = list(Loan.objects.filter(user=user).prefetch_related('payments', 'disbursements'))
        
        # Helper function to calculate current balance
        def calculate_current_balance(loan):
            # (This is the same logic from your Loans page, simplified for brevity)
            balance = sum(d.amount for d in loan.disbursements.all()) - sum(p.amount for p in loan.payments.all())
            # A more accurate interest calculation would be needed for a real app,
            # but this is a good starting point for the simulation.
            return balance if balance > 0 else Decimal('0')

        # Helper function to simulate one strategy
        def simulate_payoff(strategy_loans):
            months = 0
            total_interest_paid = Decimal('0')
            
            # Create a mutable list of loans with their current balances
            sim_loans = [{'loan': l, 'balance': calculate_current_balance(l)} for l in strategy_loans]
            sim_loans = [l for l in sim_loans if l['balance'] > 0]

            while any(l['balance'] > 0 for l in sim_loans):
                months += 1
                monthly_extra_payment = extra_payment
                
                # Accrue interest for all loans
                for l_data in sim_loans:
                    if l_data['balance'] > 0:
                        monthly_interest = l_data['balance'] * (l_data['loan'].interest_rate / 100 / 12)
                        l_data['balance'] += monthly_interest
                        total_interest_paid += monthly_interest

                # Make minimum payments (simplified as interest + a small principal)
                # In a real app, this would use the actual EMI
                for l_data in sim_loans:
                    if l_data['balance'] > 0:
                        monthly_interest = l_data['balance'] * (l_data['loan'].interest_rate / 100 / 12)
                        min_payment = monthly_interest + 50 # Simplified minimum payment
                        payment = min(l_data['balance'], min_payment)
                        l_data['balance'] -= payment

                # Apply extra payment to the target loan
                for l_data in sim_loans:
                    if l_data['balance'] > 0 and monthly_extra_payment > 0:
                        payment = min(l_data['balance'], monthly_extra_payment)
                        l_data['balance'] -= payment
                        monthly_extra_payment -= payment
                
                if months > 1200: # Safety break to prevent infinite loops
                    return {'error': 'Calculation timed out.'}

            return {
                'months_to_payoff': months,
                'total_interest_paid': round(total_interest_paid, 2)
            }

        # --- Run Simulations ---
        # Avalanche: Sort by interest rate, descending
        avalanche_loans = sorted(loans, key=lambda l: l.interest_rate, reverse=True)
        avalanche_result = simulate_payoff(avalanche_loans)

        # Snowball: Sort by balance, ascending
        snowball_loans_with_balance = sorted(
            [{'loan': l, 'balance': calculate_current_balance(l)} for l in loans],
            key=lambda item: item['balance']
        )
        snowball_loans = [item['loan'] for item in snowball_loans_with_balance]
        snowball_result = simulate_payoff(snowball_loans)

        return Response({
            'avalanche': avalanche_result,
            'snowball': snowball_result,
        })

class SpendingAlertsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        today = date.today()
        # We'll analyze spending over the last 90 days to establish a baseline
        ninety_days_ago = today - timedelta(days=90)

        # Get all relevant transactions
        transactions = Transaction.objects.filter(
            account__user=user,
            transaction_type='EXPENSE',
            date__gte=ninety_days_ago
        ).select_related('category')

        # Calculate average weekly spending per category
        weekly_spending = defaultdict(lambda: defaultdict(float))
        for t in transactions:
            if t.category:
                # Group transactions by week number and year
                week_key = f"{t.date.isocalendar().year}-{t.date.isocalendar().week}"
                weekly_spending[t.category.name][week_key] += float(t.amount)

        alerts = []
        
        # Analyze each category for anomalies
        for category_name, weeks in weekly_spending.items():
            if len(weeks) < 4: # Need at least 4 weeks of data for a meaningful average
                continue

            spending_values = list(weeks.values())
            
            # Calculate average and standard deviation
            avg_weekly_spend = sum(spending_values) / len(spending_values)
            std_dev = (sum([(s - avg_weekly_spend) ** 2 for s in spending_values]) / len(spending_values)) ** 0.5
            
            # Define the anomaly threshold (e.g., 2 standard deviations above average)
            threshold = avg_weekly_spend + (2 * std_dev)

            # Check this week's spending
            current_week_key = f"{today.isocalendar().year}-{today.isocalendar().week}"
            current_week_spending = weeks.get(current_week_key, 0)

            if current_week_spending > avg_weekly_spend and current_week_spending > threshold:
                over_amount = current_week_spending - avg_weekly_spend
                alerts.append(
                    f"Heads up! Your spending on '{category_name}' this week is ${over_amount:,.2f} higher than your weekly average."
                )

        return Response(alerts)
    


class RunRoundUpsView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        profile = UserProfile.objects.get(user=request.user)
        if not all([profile.round_ups_enabled, profile.round_up_source_account, profile.round_up_target_account]):
            return Response({'error': 'Round-ups are not configured correctly.'}, status=400)
        transactions_to_round = Transaction.objects.filter(
            account=profile.round_up_source_account,
            transaction_type='EXPENSE',
            date__gt=profile.last_round_up_run or '1970-01-01'
        )
        total_round_up = Decimal('0.00')
        for t in transactions_to_round:
            cents = t.amount.quantize(Decimal('1.00')) - t.amount
            if cents > 0:
                total_round_up += cents
        if total_round_up > 0:
            Transaction.objects.create(
                account=profile.round_up_source_account,
                description=f"Round-up Transfer ({len(transactions_to_round)} items)",
                amount=total_round_up,
                transaction_type='EXPENSE',
                date=date.today()
            )
            Transaction.objects.create(
                account=profile.round_up_target_account,
                description=f"Round-up Savings ({len(transactions_to_round)} items)",
                amount=total_round_up,
                transaction_type='INCOME',
                date=date.today()
            )
        profile.last_round_up_run = datetime.now(timezone.utc)
        profile.save()
        return Response({'message': f'Successfully rounded up {total_round_up.quantize(Decimal("0.01"))}.'})
    
class AILanguageQueryView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        query = request.data.get('query', '').lower()

        if not query:
            return Response({'error': 'A query is required.'}, status=400)

        # --- Mock AI Logic ---
        # In the future, this section will contain complex NLP logic to parse the query.
        # For now, we will check for simple keywords and return a hardcoded response.

        if "groceries" in query and "march" in query:
            # This is a mock response for a query like "how much did I spend on groceries in March?"
            mock_response = {
                "query_interpretation": "Total spending for category 'Groceries' in March 2025",
                "result_type": "sum",
                "data": {
                    "total": "455.75",
                    "currency": "USD"
                },
                "insight": "This is 15% higher than your monthly average for groceries."
            }
            return Response(mock_response)
        
        elif "netflix" in query:
             # This is a mock response for a query like "show me my netflix transactions"
            mock_response = {
                "query_interpretation": "Listing all transactions with 'Netflix' in the description",
                "result_type": "list",
                "data": [
                    {"date": "2025-07-15", "description": "Netflix Subscription", "amount": "15.99"},
                    {"date": "2025-06-15", "description": "Netflix Subscription", "amount": "15.99"},
                    {"date": "2025-05-15", "description": "Netflix Subscription", "amount": "15.99"},
                ],
                "insight": "You have a recurring monthly payment to Netflix."
            }
            return Response(mock_response)

        else:
            # Default response if no keywords are matched
            return Response({
                "query_interpretation": "Sorry, I couldn't understand that question. Please try asking about spending in a specific category or for a specific merchant.",
                "result_type": "error",
                "data": None,
                "insight": "You can ask things like 'how much did I spend on food last month?'"
            })
            
class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    # This now correctly points to our frontend page
    callback_url = "http://localhost:3000/google-callback"
    client_class = OAuth2Client