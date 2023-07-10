from django.contrib.auth import get_user_model
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.db import models
from django.db.models.signals import post_delete
from django.dispatch import receiver
from django.utils import timezone
from django.core.validators import FileExtensionValidator

class CustomUserManager(BaseUserManager):
    def create_user(self, email, name, contact_no, employee_designation, password=None, user_type="normal", is_active=False):
        """
        Creates and saves a new user with the given email, password, and user type.
        """
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, name=name, contact_no=contact_no,
                          employee_designation=employee_designation, user_type=user_type, is_active=is_active)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_staffuser(self, email, name, contact_no, employee_designation, password=None, user_type="staff"):
        """
        Creates and saves a new staff user with the given email, password, and user type.
        """
        user = self.create_user(email=email, name=name,  contact_no=contact_no,
                                employee_designation=employee_designation, password=password, user_type=user_type)
        user.is_active = True
        user.is_staff = True
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name,  contact_no, employee_designation, password=None, user_type="superuser"):
        """
        Creates and saves a new superuser with the given email, password, and user type.
        """
        user = self.create_user(email=email, name=name,  contact_no=contact_no,
                                employee_designation=employee_designation, password=password, user_type=user_type)
        user.is_active = True
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user


class CustomUser(AbstractBaseUser):
    employee_id = models.AutoField(primary_key=True)
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=100)
    contact_no = models.CharField(max_length=15)
    employee_designation = models.CharField(max_length=100)
    is_staff = models.BooleanField(default=False)
    user_type = models.CharField(max_length=100, default="normal")
    is_active = models.BooleanField(default=True)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name', 'contact_no', 'employee_designation']

    objects = CustomUserManager()

    def __str__(self):
        return self.email

    def has_perm(self, perm, obj=None):
        return True

    def has_module_perms(self, app_label):
        return True


class equipment(models.Model):
    equipment_id = models.AutoField(primary_key=True)
    equipment_name = models.CharField(max_length=100)
    category = models.CharField(max_length=100, default="Others")
    date_of_purchase = models.DateField(default=timezone.now)
    location = models.CharField(max_length=100,null=True,blank=True)
    image = models.ImageField(upload_to='equipment_images', validators=[FileExtensionValidator(['jpg', 'jpeg', 'png'])], null=True, blank=True)
    purchase_receipt = models.ImageField(upload_to='purchase_receipts', validators=[FileExtensionValidator(['jpg', 'jpeg', 'png'])],null=True, blank=True)
    assigned_user = models.ForeignKey(
        CustomUser, on_delete=models.SET_NULL, null=True, blank=True)
    last_assigned_date = models.DateField(null=True, blank=True)
    allocation_status = models.BooleanField(default=False)

    def __str__(self):
        return self.equipment_name


@receiver(post_delete, sender=CustomUser)
def set_equipment_unassigned(sender, instance, **kwargs):
    equipment.objects.filter(assigned_user=instance).update(
        allocation_status=False)


class requested_equipments(models.Model):
    equipment_name = models.CharField(max_length=100)
    # add the user who requested for the adding of the equipment
    requested_by = models.ForeignKey(
        CustomUser, on_delete=models.SET_NULL, null=True, blank=True)
    category = models.CharField(max_length=100, default="Others")
    date_of_purchase = models.DateField(default=timezone.now)
    location = models.CharField(max_length=100)
    image = models.ImageField(upload_to='equipment_images')
    purchase_receipt = models.ImageField(upload_to='purchase_receipts')

    def __str__(self):
        return self.equipment_name


class AllocationRequest(models.Model):
    REQUEST_CHOICES = [
        ('Allocation', 'Allocation'),
        ('Deallocation', 'Deallocation'),
    ]
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    equipment = models.ForeignKey(equipment, on_delete=models.CASCADE)
    request_type = models.CharField(
        max_length=12, choices=REQUEST_CHOICES, default='Allocation')
    status = models.CharField(
        max_length=10, choices=STATUS_CHOICES, default='PENDING')
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} requested {self.request_type} of {self.equipment}"


class Part(models.Model):
    name = models.CharField(max_length=100,unique=True)


class Vendor(models.Model):
    vendor_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, default="Vendor")
    parts = models.ManyToManyField(Part)
    email = models.EmailField(unique=True, null=True, blank=True)
    contact_no = models.CharField(max_length=15, null=True, blank=True)
    address = models.CharField(max_length=100, null=True, blank=True)
    website_link = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return self.name
