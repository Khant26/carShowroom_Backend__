from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

class CustomerManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("email must be provided")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)

class Customer(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = CustomerManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name"]

    def __str__(self):
        return self.name
    
class Banner(models.Model):
    banner_name = models.CharField(max_length=100)
    banner_image = models.JSONField(null=True, blank=True)
    def __str__(self):
        return self.banner_name

class Category(models.Model):
    category_name = models.CharField(max_length=100)
    category_image = models.JSONField(null=True, blank=True)
    def __str__(self):
        return self.category_name
    
class Event(models.Model):
    event_name = models.CharField(max_length=255)
    event_image = models.JSONField(null=True, blank=True)
    event_date = models.JSONField(null=True, blank=True)
    event_time = models.CharField(max_length=100, null=True, blank=True)
    event_location = models.CharField(max_length=255)
    sale_date = models.CharField(max_length=100, null=True, blank=True)
    ticket_price = models.JSONField(null=True, blank=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    def __str__(self):
        return self.event_name
     
class Order(models.Model):
    order_time = models.DateTimeField(auto_now_add=True)
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null =True)
    event = models.ForeignKey(Event, on_delete=models.SET_NULL, null=True)
    def __str__(self):
        return f"Order {self.id} by {self.customer}"

class Ticket(models.Model):
    passport_name = models.CharField(max_length=255)
    facebook_name = models.CharField(max_length=255)
    member_code = models.CharField(max_length=100, null=True, blank=True)
    priority_date = models.CharField(max_length=100, null=True, blank=True)
    fst_pt = models.CharField(max_length=20, null=True, blank=True) # change the max_length 20-->50 (if need)
    snd_pt = models.CharField(max_length=20, null=True, blank=True) # change the max_length 20-->50
    trd_pt = models.CharField(max_length=20, null=True, blank=True) # change the max_length 20-->50
    status = models.CharField(max_length=20, default='Pending')
    event = models.ForeignKey(Event, on_delete=models.SET_NULL, null=True)
    order = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True)
    def __str__(self):
        return f"Ticket {self.id} - {self.passport_name}"