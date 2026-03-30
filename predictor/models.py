from django.db import models
from django.contrib.auth.models import User

class LoanHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    loan_amount = models.FloatField()
    interest_rate = models.FloatField()
    emi = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - ₹{self.loan_amount}"