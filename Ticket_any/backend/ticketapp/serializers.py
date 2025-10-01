from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Banner, Category, Event, Order, Ticket

Customer = get_user_model()

class CustomerSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    class Meta:
        model = Customer
        fields = ["id", "email", "name", "password", "is_staff", "is_superuser"]
        read_only_fields = ["is_staff", "is_superuser"]
    def create(self, validated_data):
        password = validated_data.pop("password", None)
        user = Customer(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user
    
class BannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Banner
        fields = '__all__'

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'

class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = '__all__'

class TicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket 
        fields = '__all__'