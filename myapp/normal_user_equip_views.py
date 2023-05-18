import base64
import json

from django.contrib import messages
# import the authentication backend
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required, user_passes_test
from django.core import serializers
from django.core.files.base import ContentFile
# import httpresponse
from django.db.models import Q
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
# import the timezone
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from myapp.forms import UserRegistrationForm
from myapp.models import CustomUser, equipment, requested_equipments

from .models import CustomUser, equipment

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
            


def normal_user_add_equipment_api(request):
    if request.method == 'POST':
        try:
            print("int the add equipment")
            equipment_id = request.POST['equipment_id']
            equipment_name = request.POST['equipment_name']
            category = request.POST['category']
            date_of_purchase = request.POST['date_of_purchase']
            location = request.POST['location']
            image_file = request.FILES['image']

            new_equipment = requested_equipments(
                equipment_id = equipment_id,
                equipment_name = equipment_name,
                category = category,
                date_of_purchase = date_of_purchase,
                location = location,
            )
            new_equipment.image.save(image_file.name, image_file)
            new_equipment.save()
            return JsonResponse({'status':'ok'}, status=200)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    else:
        return JsonResponse({'error': 'Invalid Method'}, status=400)