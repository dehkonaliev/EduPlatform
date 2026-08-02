from django.db import models
from baseapp.models import BaseModel
from baseapp.utils import generate_wallet_id
from datetime import timedelta

class StudentWallet(BaseModel):
    student = models.OneToOneField('authentication.CustomUser', on_delete=models.CASCADE, limit_choices_to={'user_role': "STUDENT"})
    wallet_id = models.CharField(unique=True, max_length=8)
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    def save(self, *args, **kwargs):
        if not self.wallet_id:
            new_id = generate_wallet_id()
            while StudentWallet.objects.filter(wallet_id=new_id).exists():
                new_id = generate_wallet_id()
            self.wallet_id = new_id
        return super().save(*args, **kwargs)
    
    def __str__(self):
        return self.student.first_name
    
class WalletTransaction(BaseModel):
    class TransactionTypes(models.TextChoices):
        SUBSCRIPTION = 'SUBSCRIPTION', 'subscription'
        PAID_COURSE = 'PAID_COURSE', 'paid_course'
        REPLENISH = 'REPLENISH', 'replenish'
    
    wallet = models.ForeignKey(StudentWallet, on_delete=models.CASCADE)
    transaction_type = models.CharField(max_length=20, choices=TransactionTypes.choices)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    def __str__(self):
        return self.wallet.student
    
    
class Subscriptions(BaseModel):
    class Periods(models.TextChoices):
        ONE_MONTH = 'ONE_MONTH', 'one_month'
        THREE_MONTH = 'THREE_MONTH', 'three_month'
        SIX_MONTH = 'SIX_MONTH', 'six_month'
        A_YEAR = 'A_YEAR', 'a_year'
    
    student = models.ForeignKey('authentication.CustomUser', on_delete=models.CASCADE)
    subscription_period = models.CharField(max_length=20, choices=Periods.choices)
    expires_at = models.DateTimeField()
    
    def save(self, *args, **kwargs):
        if not self.expires_at:
            if self.subscription_period == self.Periods.ONE_MONTH:
                expiry_date = self.created_at + timedelta(days=30)
            elif self.subscription_period == self.Periods.THREE_MONTH:
                expiry_date = self.created_at + timedelta(days=90)
            elif self.subscription_period == self.Periods.SIX_MONTH:
                expiry_date = self.created_at + timedelta(days=180)
            elif self.subscription_period == self.Periods.A_YEAR:
                expiry_date = self.created_at + timedelta(days=365)
        self.expires_at = expiry_date
        return super().save(*args, **kwargs)
    