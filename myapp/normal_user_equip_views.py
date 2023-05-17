from .models import equipment, CustomUser
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

#*imports completed for the normal user views







def normal_user_assigned_equipments_api(request):
    if request.method == "GET":
        user_id = request.user.id
        queryset = equipment.objects.filter(
        assigned_user_id=user_id
    )
        data = []
        for item in queryset:
            row = [
                item.equipment_id,
                item.equipment_name,
                item.category,
                # This column will be rendered in the frontend with the 'render' function
                item.allocation_status,
                item.equipment_id,
                f'<input type="checkbox" class="user-checkbox" data-id="{item.equipment_id}" />',

            ]
            data.append(row)

        print(data)
        response_data = {'data': data}
        return JsonResponse(response_data)
    

def normal_user_all_equipments_api(request):
    if request.method=="GET":
        search = request.GET.get('search', '')
        print(search)
        if search:
            queryset = equipment.objects.filter(
                Q(equipment_id__icontains=search) |
                Q(equipment_name__icontains=search) |
                Q(category__icontains=search) 
            )
        else:
            queryset = equipment.objects.all().order_by(
                '-last_assigned_date')
        data = []
        for item in queryset:
            row = [
                item.equipment_id,
                item.equipment_name,
                item.category,
                # This column will be rendered in the frontend with the 'render' function
                item.allocation_status,
                item.equipment_id,
                f'<input type="checkbox" class="user-checkbox" data-id="{item.equipment_id}" />',

            ]
            data.append(row)

        print(data)
        response_data = {'data': data}
        return JsonResponse(response_data)
    
    
def normal_user_available_equipments_api(request):
    if request.method=="GET":
        queryset=equipment.objects.filter(allocation_status=False)
        data = []
        for item in queryset:
            row = [
                item.equipment_id,
                item.equipment_name,
                item.category,
                # This column will be rendered in the frontend with the 'render' function
                item.allocation_status,
                item.equipment_id,
                f'<input type="checkbox" class="user-checkbox" data-id="{item.equipment_id}" />',

            ]
            data.append(row)

        print(data)
        response_data = {'data': data}
        return JsonResponse(response_data)
            