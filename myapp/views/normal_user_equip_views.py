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
from myapp.models import CustomUser, equipment, requested_equipments, AllocationRequest

from ..models import CustomUser, equipment

# *imports completed for the normal user views


def normal_user_assigned_equipments_api(request):
    if request.method == "GET":
        user_id = request.user.employee_id
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
    #else we want to return the error:
    else:
        error_data = {'error': 'Invalid request method!'}
        return JsonResponse(error_data, status=400)
    


def normal_user_all_equipments_api(request):
    if request.method == "GET":
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
    else:
        error_data = {'error': 'Invalid request method!'}
        return JsonResponse(error_data, status=400)


def normal_user_available_equipments_api(request):
    if request.method == "GET":
        queryset = equipment.objects.filter(allocation_status=False)
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
    else:
        error_data = {'error': 'Invalid request method!'}
        return JsonResponse(error_data, status=400)


def normal_user_add_equipment_api(request):
    if request.method == 'POST':
        try:
            print(request.POST)
            print(request.FILES)
            print("int the add equipment")
            equipment_name = request.POST['equipment_name']
            category = request.POST['category']
            date_of_purchase = request.POST['date_of_purchase']
            location = request.POST['location']
            max_size = 0.5 * 1024 * 1024
            image_file = request.FILES['image']
            purchase_receipt_file = request.FILES['purchase_receipt']
            #add condition that image size should be lesser that 0.5 mb 
            if(image_file.size > max_size):
                return JsonResponse({'message': 'Image size should be lesser than 500kb'}, status=400)
            
            #add a condition that th purchase receipt size should be less than 0.5 mb
            if(purchase_receipt_file.size > max_size):
                return JsonResponse({'message': 'Purchase receipt size should be lesser than 500kb'}, status=400)
            
            new_equipment = requested_equipments(
                equipment_name=equipment_name,
                category=category,
                date_of_purchase=date_of_purchase,
                location=location,
            )
            new_equipment.image.save(image_file.name, image_file)
            new_equipment.purchase_receipt.save(purchase_receipt_file.name, purchase_receipt_file)
            new_equipment.save()
            return JsonResponse({'message': 'equipment added successfully'}, status=200)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    else:
        return JsonResponse({'error': 'Invalid Method'}, status=400)


def normal_user_request_equipment_api(request):
    print("in the request equipment*********************************")
    if request.method == 'POST':
        data = json.loads(request.body)
        equipment_ids = data.get('equipments')
        request_type = data.get('request_type')
        print(equipment_ids)
        print(request_type)
        if request_type == 'ALLOCATION':
            for equipment_id in equipment_ids:
                # if all the equipment ids are valid and if there allocation statur is false then only the equipment will be allocated
                if equipment.objects.filter(equipment_id=equipment_id, allocation_status=False).exists():
                    print("equipment is available for allocation")
                else:
                    return JsonResponse({"message": "Equipment is not available for allocation"})

                # check if the allocation request is already made
                if AllocationRequest.objects.filter(user=request.user, equipment=equipment.objects.get(equipment_id=equipment_id), request_type=request_type, status='PENDING').exists():
                    return JsonResponse({"message": "Request is already made"})
                else:
                    continue

            # Perform the allocation of equipment here.
            # Use the equipment_ids to identify the equipment that needs to be allocated.
            # create the allocation request
            for equipment_id in equipment_ids:
                new_request = AllocationRequest(
                    user=request.user,
                    equipment=equipment.objects.get(equipment_id=equipment_id),
                    request_type=request_type,
                    status='PENDING',
                    timestamp=timezone.now()
                )
                new_request.save()

        elif request_type == 'DEALLOCATION':
            # only proceed if the equipment is allocated to the user
            for equipment_id in equipment_ids:
                if equipment.objects.filter(equipment_id=equipment_id, assigned_user=request.user).exists():
                    print("equipment is available for dellocation")
                else:
                    return JsonResponse({"message": "Invalid equipment id"})

                # check if the deallocation request is already made
                if AllocationRequest.objects.filter(user=request.user, equipment=equipment.objects.get(equipment_id=equipment_id), request_type=request_type, status='PENDING').exists():
                    return JsonResponse({"message": "Request is already made and pending"})

            # Perform the deallocation of equipment here.
            # Use the equipment_ids to identify the equipment that needs to be deallocated.
            # create the allocation request
            for equipment_id in equipment_ids:
                new_request = AllocationRequest(
                    user=request.user,
                    equipment=equipment.objects.get(equipment_id=equipment_id),
                    request_type=request_type,
                    status='PENDING',
                    timestamp=timezone.now()
                )
                new_request.save()

        # Send a response back to the client.
        return JsonResponse({"message": "Request processed successfully"})
    else:
        error_data = {'error': 'Invalid request method!'}
        return JsonResponse(error_data, status=400)
