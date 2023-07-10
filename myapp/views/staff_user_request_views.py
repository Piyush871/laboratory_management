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
from django.template.loader import render_to_string


def requests_view(request):
    allocation_requests = AllocationRequest.objects.filter(request_type='Allocation')
    deallocation_requests = AllocationRequest.objects.filter(request_type='Deallocation')

    bg_images = ["assets/img/cardbg1.png", "assets/img/cardbg2.png", "assets/img/cardbg3.png"]

    # generate requests_with_images for allocation requests
    allocation_requests_with_images = generate_requests_with_images(allocation_requests, bg_images)

    # generate requests_with_images for deallocation requests
    deallocation_requests_with_images = generate_requests_with_images(deallocation_requests, bg_images)

    return render(request, 'STAFF_USER/requests.html', {'allocation_requests': allocation_requests_with_images, 'deallocation_requests': deallocation_requests_with_images})

def generate_requests_with_images(requests, bg_images):
    RequestWithImage = namedtuple('RequestWithImage', ['allocation_request', 'image'])
    requests_with_images = []
    for allocation_request in requests:
        image = random.choice(bg_images)
        request_with_image = RequestWithImage(allocation_request=allocation_request, image=image)
        requests_with_images.append(request_with_image)
    return requests_with_images


def get_allocation_requests(request):
    allocation_requests = AllocationRequest.objects.filter(request_type='Allocation')
    bg_images = ["assets/img/cardbg1.png", "assets/img/cardbg2.png", "assets/img/cardbg3.png"]
    
    # generate requests_with_images for allocation requests
    allocation_requests_with_images = generate_requests_with_images(allocation_requests, bg_images)
    #return only the allocation requests
    return JsonResponse({'allocation_requests':allocation_requests_with_images})

def get_deallocation_requests(request):
    deallocation_requests = AllocationRequest.objects.filter(request_type='Deallocation')
    bg_images = ["assets/img/cardbg1.png", "assets/img/cardbg2.png", "assets/img/cardbg3.png"]
    
    # generate requests_with_images for allocation requests
    deallocation_requests_with_images = generate_requests_with_images(deallocation_requests, bg_images)
    #return only the allocation requests
    return JsonResponse({'deallocation_requests':deallocation_requests_with_images})





def handle_request(request):
    if request.method == "POST":
        request_id = request.POST.get("request_id")
        action = request.POST.get("action")
        if request_id and action:
            try:
                allocation_request = AllocationRequest.objects.get(id=request_id)
                if (allocation_request.request_type == "Allocation"):
                    is_valid, message = handle_allocation_request(allocation_request, action) 
                    if is_valid:
                        return JsonResponse({"message": message}, status=200)
                    else:
                        return JsonResponse({"message": message}, status=400)
                elif(allocation_request.request_type == "Deallocation"):
                    is_valid, message = handle_deallocation_request(allocation_request, action)
                    if is_valid:
                        return JsonResponse({"message": message}, status=200)
                    else:
                        return JsonResponse({"message": message}, status=400)
                else:
                    return JsonResponse({"message": "Invalid request type."}, status=400)
                    
            except AllocationRequest.DoesNotExist:
                return JsonResponse({"error": "Allocation request not found."}, status=404) 
                    #get the request type 
                request_type = allocation_request.request_type
                print(request_type)
                
        else:
            return JsonResponse({"message": "Invalid request parameters."}, status=400)
    else:
        return JsonResponse({"error": "Invalid request method."}, status=405)




#validating the allocation request 


def validate_allocation_request(allocationRequest):
    # Check if the user is already allocated the equipment
    # get the equipment and the user 
    equipment = allocationRequest.equipment
    user = allocationRequest.user
    
    if allocationRequest.request_type == "Allocation":
        if equipment.allocation_status:
            # check the user who has been allocated the equipment
            if equipment.assigned_user == user:
                return True, "Equipment already allocated to the same user."
            else:
                return False, "Equipment already allocated to another user."
        else:
            return True, "Equipment is available for allocation."
    else:
        return False, "Invalid allocation request type."

def validate_deallocation_request(allocationRequest):
    # Check if the user is already allocated the equipment
    # get the equipment and the user 
    equipment = allocationRequest.equipment
    user = allocationRequest.user
    
    if allocationRequest.request_type == "Deallocation":
        if equipment.allocation_status:
            # check the user who has been allocated the equipment
            if equipment.assigned_user == user:
                return True, "Equipment already allocated to the same user."
            else:
                return False, "Equipment already allocated to another user."
        else:
            return False, "Equipment is not allocated to any user."
    else:
        return False, "Invalid allocation request type."

def allocate_equipment(equipment, user):
    #change the last allocation date
    equipment.last_assigned_date=timezone.now()
    equipment.allocation_status = True
    equipment.assigned_user = user
    equipment.save()


def deallocate_equipment(equipment):
    equipment.allocation_status = False
    equipment.assigned_user = None
    equipment.save()
    
def handle_allocation_request(allocation_request, action):
    if (action=="approve"):
        # Check if the user is already allocated the equipment
        is_valid, message = validate_allocation_request(allocation_request)
        if is_valid:
            # Allocate the equipment
            allocate_equipment(allocation_request.equipment, allocation_request.user)
            # Update the allocation request status
            allocation_request.status = "Approved"
            #delete the request
            allocation_request.delete()
            return True, "Allocation request approved successfully."
        else:
            return False, message
    elif (action=="reject"):
        # Update the allocation request status
        allocation_request.status = "Rejected"
        #delete the request
        allocation_request.delete()
        return True, "Allocation request rejected successfully."
    else:
        return False, "Invalid action."

def handle_deallocation_request(allocation_request, action):
    if(action=="approve"):
        # Check if the user is already allocated the equipment
        is_valid, message = validate_deallocation_request(allocation_request)
        if is_valid:
            # Deallocate the equipment
            deallocate_equipment(allocation_request.equipment)
            # Update the allocation request status
            allocation_request.status = "Approved"
            #delete the request
            allocation_request.delete()
            return True, "Deallocation request approved successfully."
        else:
            return False, message
    elif (action=="reject"):
        #delete the request
        allocation_request.delete()
        return True, "Deallocation request rejected successfully."
    
    else:
        return False, "Invalid action."
    
