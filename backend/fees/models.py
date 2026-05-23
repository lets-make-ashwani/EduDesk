from django.db import models
from core.models import Class
from students.models import Student

class FeeStructure(models.Model):
    school_class = models.OneToOneField(Class, on_delete=models.CASCADE, related_name='fee_structure')
    tuition_fee_monthly = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    annual_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    exam_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    @property
    def total_annual_fee(self):
        return (self.tuition_fee_monthly * 12) + self.annual_charges + self.exam_fee

    def __str__(self): return f"Fee Structure: {self.school_class.name}"

class Fee(models.Model):
    school_class = models.ForeignKey(Class, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.CharField(max_length=200)
    due_date = models.DateField()

    def __str__(self): return f"{self.description} - {self.school_class.name}"

class Payment(models.Model):
    STATUS_CHOICES = (
        ('Paid', 'Paid'),
        ('Unpaid', 'Unpaid'),
    )
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='payments')
    fee = models.ForeignKey(Fee, on_delete=models.CASCADE)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    payment_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Unpaid')

    def __str__(self): return f"{self.student.name} - {self.fee.description} - {self.status}"
