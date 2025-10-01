from rest_framework import viewsets, permissions
from django.contrib.auth import get_user_model
from .models import Banner, Category, Event, Customer, Order, Ticket
from .serializers import CustomerSerializer, BannerSerializer, CategorySerializer, EventSerializer,  OrderSerializer, TicketSerializer 
from rest_framework.exceptions import PermissionDenied

Customer = get_user_model()

# Custom Permission
class IsOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.is_staff or request.user.is_superuser:
            return True
        if hasattr(obj, "customer"):  # For Order
            return obj.customer == request.user
        if hasattr(obj, "order"):  # For Ticket
            return obj.order.customer == request.user
        return False

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.is_superuser:
            return Customer.objects.all() # admin can see all data
        return Customer.objects.filter(id=user.id)  # Customer sees only their own account
    def perform_update(self, serializer):
        user = self.request.user
        if not (user.is_staff or user.is_superuser) and serializer.instance != user.id:
            raise PermissionDenied("You cannot update another user's profile!!!")
        serializer.save()
    
class BannerViewSet(viewsets.ModelViewSet):
    queryset = Banner.objects.all()
    serializer_class = BannerSerializer
    permission_classes = [permissions.AllowAny]

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all() 
    serializer_class = EventSerializer
    permission_classes = [permissions.AllowAny]

# Order : Only login customer or admin
class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.is_superuser:
            return Order.objects.all() 
        return Order.objects.filter(customer=user) 
    def perform_create(self, serializer):
        serializer.save(customer=self.request.user)

# Ticket : Only login customer or admin
class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.is_superuser:
            return Ticket.objects.all() 
        return Ticket.objects.filter(order__customer=user)