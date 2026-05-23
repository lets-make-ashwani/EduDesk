from rest_framework import serializers
from .models import Fee, Payment, FeeStructure

class FeeStructureSerializer(serializers.ModelSerializer):
    class_name = serializers.CharField(source='school_class.name', read_only=True)
    total_annual_fee = serializers.ReadOnlyField()

    class Meta:
        model = FeeStructure
        fields = '__all__'

class FeeSerializer(serializers.ModelSerializer):
    class_name = serializers.CharField(source='school_class.name', read_only=True)

    class Meta:
        model = Fee
        fields = '__all__'

class PaymentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    fee_description = serializers.CharField(source='fee.description', read_only=True)

    class Meta:
        model = Payment
        fields = '__all__'
