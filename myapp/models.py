from django.contrib.auth.base_user import BaseUserManager, AbstractBaseUser
from django.contrib.auth.models import PermissionsMixin
from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model


class CustomUserManager(BaseUserManager):
    def create_user(self, email, name, employee_id, contact_no, employee_designation, password=None, user_type="normal",is_active=False):
        """
        Creates and saves a new user with the given email, password, and user type.
        """
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, name=name, employee_id=employee_id, contact_no=contact_no,
                          employee_designation=employee_designation, user_type=user_type,is_active=is_active )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_staffuser(self, email, name, employee_id, contact_no, employee_designation, password=None, user_type="staff"):
        """
        Creates and saves a new staff user with the given email, password, and user type.
        """
        user = self.create_user(email=email, name=name, employee_id=employee_id, contact_no=contact_no,
                                employee_designation=employee_designation, password=password, user_type=user_type)
        user.is_staff = True
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, employee_id, contact_no, employee_designation, password=None, user_type="superuser"):
        """
        Creates and saves a new superuser with the given email, password, and user type.
        """
        user = self.create_user(email=email, name=name, employee_id=employee_id, contact_no=contact_no,
                                employee_designation=employee_designation, password=password, user_type=user_type)
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user


class CustomUser(AbstractBaseUser):
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=100)
    employee_id = models.CharField(max_length=20, unique=True)
    contact_no = models.CharField(max_length=15)
    employee_designation = models.CharField(max_length=100)
    is_staff = models.BooleanField(default=False)
    user_type = models.CharField(max_length=100, default="normal")
    is_active = models.BooleanField(default=True)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name', 'employee_id', 'contact_no', 'employee_designation']

    objects = CustomUserManager()

    def __str__(self):
        return self.email

    def has_perm(self, perm, obj=None):
        return True

    def has_module_perms(self, app_label):
        return True


class equipment(models.Model):
    equipment_id = models.CharField(max_length=20,unique=True)
    equipment_name = models.CharField(max_length=100)
    category = models.CharField(max_length=100,default="Others")
    date_of_purchase = models.DateField(default=timezone.now)
    location = models.CharField(max_length=100)
    image = models.ImageField(upload_to='equipment_images')
    assigned_user = models.ForeignKey(
        get_user_model(), on_delete=models.SET_NULL, null=True, blank=True)
    last_assigned_date = models.DateField(null=True, blank=True)
    allocation_status = models.BooleanField(default=False)

    def __str__(self):
        return self.equipment_name
