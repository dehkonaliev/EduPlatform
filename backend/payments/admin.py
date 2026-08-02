from django.contrib import admin
from .models import StudentWallet, Subscriptions, WalletTransaction

admin.site.register(StudentWallet)
admin.site.register(Subscriptions)
admin.site.register(WalletTransaction)