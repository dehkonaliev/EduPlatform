from rest_framework import serializers
from baseapp.utils import field_error, validate_wallet_id
from .models import Subscriptions, WalletTransaction, StudentWallet
from decimal import Decimal
from django.db.models import F


class ReplenishWalletSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    wallet_id = serializers.CharField()
        
    def validate_wallet_id(self, wallet_id):
        validate_wallet_id(wallet_id)
        wallet = StudentWallet.objects.filter(wallet_id=wallet_id).first()
        if not wallet:
            return field_error("wallet_id", "Wallet not found")
                
        return wallet_id
    
    def validate_amount(self, amount):
        if amount <= 0:
            raise serializers.ValidationError("Amount must be greater than zero")
        return amount
    
    def save(self, **kwargs):
        wallet_id = self.validated_data['wallet_id']
        amount = self.validated_data['amount']
        wallet = StudentWallet.objects.filter(wallet_id=wallet_id).first()
        wallet.balance = wallet.balance + amount
        wallet.save()
        return 
        
        
    
    
        
        