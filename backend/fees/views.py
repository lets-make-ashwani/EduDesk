from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Fee, Payment, FeeStructure
from .serializers import FeeSerializer, PaymentSerializer, FeeStructureSerializer

class FeeStructureViewSet(viewsets.ModelViewSet):
    queryset = FeeStructure.objects.all()
    serializer_class = FeeStructureSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'SUPERADMIN':
            return FeeStructure.objects.all()
        if user.school:
            return FeeStructure.objects.filter(school_class__school=user.school)
        return FeeStructure.objects.none()

class FeeViewSet(viewsets.ModelViewSet):
    queryset = Fee.objects.all()
    serializer_class = FeeSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'SUPERADMIN':
            return Fee.objects.all()
        if user.school:
            return Fee.objects.filter(school_class__school=user.school)
        return Fee.objects.none()

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'SUPERADMIN':
            return Payment.objects.all()
        if user.school:
            return Payment.objects.filter(student__school=user.school)
        return Payment.objects.none()

    @action(detail=False, methods=['get'])
    def due(self, request):
        due_payments = self.get_queryset().filter(status='Unpaid')
        serializer = self.get_serializer(due_payments, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def create_order(self, request, pk=None):
        import razorpay
        from django.conf import settings
        
        payment = self.get_object()
        if payment.status == 'Paid':
            return Response({'error': 'Fee already paid'}, status=400)
            
        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        
        # Amount in paise
        amount = int(payment.amount + payment.fine) * 100 
        
        data = { "amount": amount, "currency": "INR", "receipt": f"receipt_fee_{payment.id}" }
        
        try:
            payment_order = client.order.create(data=data)
            return Response({'order_id': payment_order['id'], 'amount': amount, 'key': settings.RAZORPAY_KEY_ID})
        except Exception as e:
            return Response({'error': str(e)}, status=400)

    @action(detail=True, methods=['post'])
    def verify_payment(self, request, pk=None):
        import razorpay
        from django.conf import settings
        
        payment = self.get_object()
        
        razorpay_payment_id = request.data.get('razorpay_payment_id', '')
        razorpay_order_id = request.data.get('razorpay_order_id', '')
        razorpay_signature = request.data.get('razorpay_signature', '')
        
        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        
        try:
            client.utility.verify_payment_signature({
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            })
            
            # Payment Successful
            payment.status = 'Paid'
            payment.save()
            return Response({'status': 'Payment verified and marked as Paid'})
            
        except razorpay.errors.SignatureVerificationError:
            return Response({'error': 'Payment verification failed'}, status=400)
