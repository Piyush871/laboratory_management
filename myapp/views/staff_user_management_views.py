from ..models import equipment, CustomUser
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

@login_required(login_url='reg_normal_user')
def home_view(request):
    print('inside home view')
    user_type = request.user.user_type
    context = {
        'user': request.user,
    }
    if request.user.is_authenticated:
        if (request.user.is_staff):
            return render(request, 'STAFF_USER/home.html', context)
        elif (request.user.user_type == "superuser"):
            return render(request, 'STAFF_USER/home.html', context)
        else:
            return render(request, 'NORMAL_USER/normalUserHome.html', context)
        user_name = request.user.name


def login_view(request):
    if request.method == 'POST':
        print("inside login view")
        email = request.POST.get('email')
        password = request.POST.get('password')
        print(email, password)
        user = authenticate(request, email=email, password=password)
        if user is not None:
            login(request, user)
            messages.success(request, 'Login successful!')
            print("Login successful!")
            # send user to home page and send his details
            return redirect('home')
        else:
            print("error")
            messages.error(request, 'Invalid email or password!')
            return render(request, 'COMMON/register.html')
        
def logout_view(request):
    print("in the logout view")
    logout(request)
    # Replace 'login' with the name of your login view in the urls.py
    return HttpResponseRedirect(reverse('reg_normal_user'))