from rest_framework import serializers
from django.contrib.auth.models import User
# Add , Transaction to this import line
from .models import Account, Transaction, Category, Budget, InvestmentAccount, Holding, Loan, LoanPayment, LoanDisbursement, NetWorthSnapshot, Subscription, Goal, UserProfile
from rest_framework.validators import UniqueValidator

# This serializer is ONLY for creating a new user.
class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            validated_data['username'],
            validated_data['email'],
            validated_data['password']
        )
        return user

# This serializer is for VIEWING/UPDATING a user's profile.
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']
        read_only_fields = ['username']

# This serializer is for your settings and is correct.
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['round_ups_enabled', 'round_up_source_account', 'round_up_target_account']
    
class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']
        read_only_fields = ['user']
        
class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ['id', 'name', 'account_type', 'balance', 'user']
        read_only_fields = ['user']

class TransactionSerializer(serializers.ModelSerializer):
    account_name = serializers.CharField(source='account.name', read_only=True)
    
    class Meta:
        model = Transaction
        fields = ['id', 'description', 'amount', 'transaction_type', 'date', 'account', 'category', 'account_name']
        
class TransactionBulkCreateSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', required=False, allow_blank=True)

    class Meta:
        model = Transaction
        fields = ['description', 'amount', 'transaction_type', 'date', 'category', 'category_name', 'account']
        read_only_fields = ['category']

    def create(self, validated_data):
        category_data = validated_data.pop('category', None)
        category_name = category_data.get('name') if category_data else None

        # Get the current user from the context
        user = self.context['request'].user

        if category_name:
            # Find or create the category for the user
            category, created = Category.objects.get_or_create(user=user, name__iexact=category_name, defaults={'name': category_name})
            validated_data['category'] = category

        return Transaction.objects.create(**validated_data)
        
class BudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Budget
        fields = ['id', 'category', 'amount', 'start_date', 'end_date']
        read_only_fields = ['user']
        
class HoldingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Holding
        fields = ['id', 'symbol', 'shares', 'cost_basis', 'investment_account']

class InvestmentAccountSerializer(serializers.ModelSerializer):
    holdings = HoldingSerializer(many=True, read_only=True)

    class Meta:
        model = InvestmentAccount
        fields = ['id', 'name', 'brokerage', 'holdings']
        read_only_fields = ['user']
        
class LoanDisbursementSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoanDisbursement
        fields = ['id', 'date', 'amount', 'loan']

class LoanPaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoanPayment
        fields = ['id', 'date', 'amount', 'loan']

class LoanSerializer(serializers.ModelSerializer):
    payments = LoanPaymentSerializer(many=True, read_only=True)
    disbursements = LoanDisbursementSerializer(many=True, read_only=True)

    class Meta:
        model = Loan
        fields = ['id', 'name', 'slug', 'interest_rate', 'repayment_start_date', 'payments', 'disbursements']
        read_only_fields = ['user', 'slug']
        
class NetWorthSnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = NetWorthSnapshot
        fields = ['date', 'total_assets', 'total_liabilities', 'net_worth']
        
class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = ['id', 'name', 'last_payment_date', 'estimated_amount', 'is_active']
        read_only_fields = ['user']
        
class GoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Goal
        fields = ['id', 'name', 'target_amount', 'current_amount', 'target_date']
        read_only_fields = ['user']
        
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['round_ups_enabled', 'round_up_source_account', 'round_up_target_account']