from ..models import equipment, CustomUser, AllocationRequest
from django.shortcuts import render, redirect
from myapp.models import CustomUser, equipment
from myapp.forms import UserRegistrationForm
from django.http import HttpResponse, JsonResponse, HttpResponseRedirect
# import the authentication backend
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.views.decorators.http import require_POST
from django.contrib.auth.decorators import login_required, user_passes_test
# import the timezone
from django.utils import timezone
from django.shortcuts import get_object_or_404
# import httpresponse
from django.db.models import Q
from django.core import serializers
from django.urls import reverse
import json
from django.views.decorators.csrf import csrf_exempt
from django.core.files.base import ContentFile
import base64
# copilot we want to import random here
import random
from collections import namedtuple
import re


@login_required(login_url='reg_normal_user')
def home_view(request):
    print('inside home view')
    user_type = request.user.user_type
    context = {
        'user': request.user,
    }
    if request.user.is_authenticated:
        if (request.user.is_staff):
            return render(request, 'STAFF_USER/home.html')
        elif (request.user.user_type == "superuser"):
            return render(request, 'STAFF_USER/home.html')
        else:
            return render(request, 'NORMAL_USER/normalUserHome.html', context)
        user_name = request.user.name

    # Add this line to return an HttpResponse object
    return HttpResponse('Error: User is not authenticated')


def login_view(request):
    if request.method == 'POST':
        print("inside login view")
        email = request.POST.get('email')
        password = request.POST.get('password')
        print(email, password)
        user = authenticate(request, email=email, password=password)
        if user is not None:
            if (user.is_active == False):
                return JsonResponse({'message': 'Your account is not activated by admin'}, status=400)
            login(request, user)
            print("Login successful!")
            return JsonResponse({'message': 'Login successful!', 'redirect': reverse('home')})
        else:
            print("error")
            return JsonResponse({'message': 'Invalid credentials!Or account is not activated yet'}, status=400)


def logout_view(request):
    print("in the logout view")
    logout(request)
    # Replace 'login' with the name of your login view in the urls.py
    return HttpResponseRedirect(reverse('reg_normal_user'))


def staff_user_management_view(request):
    # get the user who are staff users
    staff_users = CustomUser.objects.filter(is_staff=True)
    bg_images = ["assets/img/cardbg1.png",
                 "assets/img/cardbg2.png", "assets/img/cardbg3.png"]
    staff_users_with_images = []
    for user in staff_users:
        user.image = random.choice(bg_images)
        staff_users_with_images.append(user)
    return render(request, 'STAFF_USER/staff_user_management.html', {'staff_users_with_images': staff_users_with_images})


def create_staff_user(request):
    data = json.loads(request.body)
    email = data.get('email')
    name = data.get('name')
    contact_no = data.get('contact_no')
    employee_designation = data.get('employee_designation')

    # password should be atleast 8 characters long and should contain atleast one uppercase, one lowercase, one digit and one special character
    password = data.get('password')
    password_regex = r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"

    if not re.match(password_regex, password):
        return JsonResponse({'message': 'Password should be at least 8 characters long and should contain at least one uppercase, one lowercase, one digit and one special character.'}, status=400)

    if CustomUser.objects.filter(email=email).exists():
        return JsonResponse({'message': 'User with this email already exists.'}, status=400)

    user = CustomUser.objects.create_staffuser(
        email=email, password=password, name=name, contact_no=contact_no, employee_designation=employee_designation)
    # Return the url where you want to redirect
    redirect_url = reverse('staff_user_management_view')
    return JsonResponse({'message': 'User created successfully!', 'redirect_url': redirect_url}, status=201)


def get_staff_user(request, user_id):
    try:
        user = CustomUser.objects.get(employee_id=user_id)
        user_data = {
            "email": user.email,
            "name": user.name,
            "contact_no": user.contact_no,
            "employee_designation": user.employee_designation,
        }
        return JsonResponse(user_data)
    except CustomUser.DoesNotExist:
        return JsonResponse({"message": "User not found"}, status=404)


def update_staff_user(request, user_id):
    try:
        user = CustomUser.objects.get(employee_id=user_id)
        data = json.loads(request.body)
        # check if email already exists and is not the same as the current user
        if CustomUser.objects.filter(email=data.get("email")).exists() and data.get("email") != user.email:
            return JsonResponse({"message": "User with this email already exists."}, status=400)
        user.email = data.get("email", user.email)
        user.name = data.get("name", user.name)
        user.contact_no = data.get("contact_no", user.contact_no)
        user.employee_designation = data.get(
            "employee_designation", user.employee_designation)
        user.save()

        return JsonResponse({"message": "User updated successfully", "redirect_url": "/"}, status=200)
    except CustomUser.DoesNotExist:
        return JsonResponse({"message": "User not found"}, status=404)
    except json.JSONDecodeError:
        return JsonResponse({"message": "Invalid data"}, status=400)


def delete_staff_user(request, user_id):
    if request.method == "DELETE":
        print("inside delete")
        try:
            user = CustomUser.objects.get(employee_id=user_id)
            user.delete()
            return JsonResponse({"message": "User deleted successfully"}, status=200)
        except CustomUser.DoesNotExist:

            return JsonResponse({"error_message": "User not found"}, status=404)
    else:

        print("error")
        return JsonResponse({"error_message": "Invalid HTTP method"}, status=400)
