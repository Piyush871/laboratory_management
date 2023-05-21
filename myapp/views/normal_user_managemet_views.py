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

def reg_normal_user_view(request):
    if request.method == 'POST':
        # get the data from the user form
        form_data = request.POST.copy()
        print(form_data)
        # set user_type directly from form data
        form_data['user_type'] = 'normal'
        form_data['is_active'] = False
        form = UserRegistrationForm(form_data)
        if form.is_valid():
            print("Form is valid")
            form.save()
            return HttpResponse('<script>alert("User registered successfully!");window.location.href="/";</script>')
        else:
            print(form.errors)
            print("Form is not valid")
            return render(request, 'COMMON/register.html', {'form': form})
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
            Q(user_type__icontains=search)
        )
    else:
        queryset = CustomUser.objects.filter(
            is_active=False, user_type='normal')

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

    if ids:
        CustomUser.objects.filter(employee_id__in=ids).update(is_active=True)
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
            user_type='normal'
        )
    else:
        queryset = CustomUser.objects.filter(
            is_active=True, user_type='normal')

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
