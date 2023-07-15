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

from  ..email_utils import sendAccountActivationMail ,normalUserRegistrationEmail

def reg_normal_user_view(request):
    if request.method == 'POST':
        form_data = request.POST.copy()
        form_data['user_type'] = 'normal'
        form_data['is_active'] = False
        form = UserRegistrationForm(form_data)
        #check if email already exists
        if(CustomUser.objects.filter(email=form_data['email']).exists()):
            return JsonResponse({'message': 'Email already exists!'}, status=400)
        if form.is_valid():
            form.save()
            #get the user 
            user = CustomUser.objects.get(email=form_data['email'])
            #send email to the staff user 
            staff_users = CustomUser.objects.filter(is_staff=True)
            normalUserRegistrationEmail(user,staff_users)
            return JsonResponse ({'message':'User created successfully!Wait for the account to be activated by Admin'})
        else:
            print("form error",form.errors)
            return JsonResponse({'message': 'Invalid form data!'}, status=400)
    else:
        return render(request, 'COMMON/register.html')


    
def inactiveUsers_view(request):
    users = CustomUser.objects.filter(is_active=False)
    context = {
        'users': users
    }
    return render(request, 'STAFF_USER/normal_user_management.html', context)


def inactive_users_api(request):
    search = request.GET.get('search', '')
    print(search)
    if search:
        queryset = CustomUser.objects.filter(
            Q(name__icontains=search) |
            Q(employee_id__icontains=search) |
            Q(email__icontains=search) |
            Q(user_type__icontains=search),
            is_active=False,
            is_staff=False
        )
    else:
        queryset = CustomUser.objects.filter(
            is_active=False, is_staff=False)

    data = []
    for item in queryset:
        row = [
            item.employee_id,
            item.name,
            item.employee_designation,
            item.email,
            item.contact_no,
            f'<input type="checkbox" class="user-checkbox" data-id="{item.employee_id}" />',
        ]
        data.append(row)
    print(data)
    response_data = {'data': data}
    return JsonResponse(response_data)


def activate_users_api(request):
    ids = request.GET.getlist('ids[]')
    print("activating users", ids)
    if ids:
        CustomUser.objects.filter(employee_id__in=ids).update(is_active=True)
        #send a mail to the users
        try:
            for id in ids:
                print("sending mail to", id)
                sendAccountActivationMail(CustomUser.objects.get(employee_id=id))
        except Exception as e:
            print(e)
        return JsonResponse({'status': 'success', 'message': 'Users activated successfully.'})
    else:
        return JsonResponse({'status': 'error', 'message': 'No user IDs provided.'})


def delete_users_api(request):
    ids = request.GET.getlist('ids[]')
    if ids:
        CustomUser.objects.filter(employee_id__in=ids).delete()
        return JsonResponse({'status': 'success', 'message': 'Users deleted successfully.'})
    else:
        return JsonResponse({'status': 'error', 'message': 'No user IDs provided.'})
    
def active_users_api(request):
    search = request.GET.get('search', '')
    print(search)
    if search:
        queryset = CustomUser.objects.filter(
            Q(name__icontains=search) |
            Q(employee_id__icontains=search) |
            Q(email__icontains=search) |
            Q(user_type__icontains=search),
            is_active=True,
            is_staff=False
        )
    else:
        queryset = CustomUser.objects.filter(
            is_active=True, is_staff=False)

    data = []
    for item in queryset:
        row = [
            item.employee_id,
            item.name,
            item.employee_designation,
            item.email,
            item.contact_no,
            f'<input type="checkbox" class="user-checkbox" data-id="{item.employee_id}" />',
        ]
        data.append(row)
    print(data)
    response_data = {'data': data}
    return JsonResponse(response_data)
