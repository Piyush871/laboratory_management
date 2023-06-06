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


@login_required(login_url='reg_normal_user')
def home_view(request):
    print('inside home view')
    user_type = request.user.user_type
    context = {
        'user': request.user,
    }
    if request.user.is_authenticated:
        # allocation_requests = AllocationRequest.objects.filter(
        #     request_type='ALLOCATION')
        # # print the number of allocation requests
        # print(len(allocation_requests))
        # bg_images = ["assets/img/cardbg1.png",
        #              "assets/img/cardbg2.png", "assets/img/cardbg3.png"]
        # RequestWithImage = namedtuple(
        #     'RequestWithImage', ['allocation_request', 'image'])
        # requests_with_images = []
        # for allocation_request in allocation_requests:
        #     image = random.choice(bg_images)
        #     request_with_image = RequestWithImage(
        #         allocation_request=allocation_request, image=image)
        #     requests_with_images.append(request_with_image)

        # for request_with_image in requests_with_images:
        #     print(request_with_image.allocation_request.user.name)
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
            login(request, user)
            messages.success(request, 'Login successful!')
            print("Login successful!")
            # send user to home page and send his details
            return redirect('home')
        else:
            print("error")
            messages.error(request, 'Invalid email or password!')
            return render(request, 'COMMON/register.html')
    else:
        return render(request, 'COMMON/register.html')


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
