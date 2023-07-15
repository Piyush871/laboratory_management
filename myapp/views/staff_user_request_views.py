from ..models import equipment, CustomUser, AllocationRequest, requested_equipments
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
# import the ValidationError
from django.core.exceptions import ValidationError
from ..email_utils import sendAllotmentSuccessMail


def requests_view(request):
    allocation_requests = AllocationRequest.objects.filter(
        request_type='Allocation')
    deallocation_requests = AllocationRequest.objects.filter(
        request_type='Deallocation')

    bg_images = ["assets/img/cardbg1.png",
                 "assets/img/cardbg2.png", "assets/img/cardbg3.png"]

    # generate requests_with_images for allocation requests
    allocation_requests_with_images = generate_requests_with_images(
        allocation_requests, bg_images)

    # generate requests_with_images for deallocation requests
    deallocation_requests_with_images = generate_requests_with_images(
        deallocation_requests, bg_images)

    return render(request, 'STAFF_USER/requests.html', {'allocation_requests': allocation_requests_with_images, 'deallocation_requests': deallocation_requests_with_images})


def generate_requests_with_images(requests, bg_images):
    RequestWithImage = namedtuple(
        'RequestWithImage', ['allocation_request', 'image'])
    requests_with_images = []
    for allocation_request in requests:
        image = random.choice(bg_images)
        request_with_image = RequestWithImage(
            allocation_request=allocation_request, image=image)
        requests_with_images.append(request_with_image)
    return requests_with_images


def get_allocation_requests(request):
    allocation_requests = AllocationRequest.objects.filter(
        request_type='Allocation')
    bg_images = ["assets/img/cardbg1.png",
                 "assets/img/cardbg2.png", "assets/img/cardbg3.png"]

    # generate requests_with_images for allocation requests
    allocation_requests_with_images = generate_requests_with_images(
        allocation_requests, bg_images)
    # return only the allocation requests
    return JsonResponse({'allocation_requests': allocation_requests_with_images})


def get_deallocation_requests(request):
    deallocation_requests = AllocationRequest.objects.filter(
        request_type='Deallocation')
    bg_images = ["assets/img/cardbg1.png",
                 "assets/img/cardbg2.png", "assets/img/cardbg3.png"]

    # generate requests_with_images for allocation requests
    deallocation_requests_with_images = generate_requests_with_images(
        deallocation_requests, bg_images)
    # return only the allocation requests
    return JsonResponse({'deallocation_requests': deallocation_requests_with_images})


def handle_request(request):
    if request.method == "POST":
        request_id = request.POST.get("request_id")
        action = request.POST.get("action")
        if request_id and action:
            try:
                allocation_request = AllocationRequest.objects.get(
                    id=request_id)
                if (allocation_request.request_type == "Allocation"):
                    is_valid, message = handle_allocation_request(
                        allocation_request, action)
                    if is_valid:
                        return JsonResponse({"message": message}, status=200)
                    else:
                        return JsonResponse({"message": message}, status=400)
                elif (allocation_request.request_type == "Deallocation"):
                    is_valid, message = handle_deallocation_request(
                        allocation_request, action)
                    if is_valid:
                        return JsonResponse({"message": message}, status=200)
                    else:
                        return JsonResponse({"message": message}, status=400)
                else:
                    return JsonResponse({"message": "Invalid request type."}, status=400)

            except AllocationRequest.DoesNotExist:
                return JsonResponse({"error": "Allocation request not found."}, status=404)
                # get the request type
                request_type = allocation_request.request_type
                print(request_type)

        else:
            return JsonResponse({"message": "Invalid request parameters."}, status=400)
    else:
        return JsonResponse({"error": "Invalid request method."}, status=405)


# validating the allocation request


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
    # change the last allocation date
    equipment.last_assigned_date = timezone.now()
    equipment.allocation_status = True
    equipment.assigned_user = user
    equipment.save()


def deallocate_equipment(equipment):
    equipment.allocation_status = False
    equipment.assigned_user = None
    equipment.save()


def handle_allocation_request(allocation_request, action):
    if (action == "approve"):
        # Check if the user is already allocated the equipment
        is_valid, message = validate_allocation_request(allocation_request)
        if is_valid:
            # Allocate the equipment
            allocate_equipment(allocation_request.equipment,
                               allocation_request.user)
            # Update the allocation request status
            allocation_request.status = "Approved"
            # delete the request
            allocation_request.delete()
            #send mail to the user
            sendAllotmentSuccessMail(allocation_request.user, allocation_request.equipment)
            return True, "Allocation request approved successfully."
        else:
            return False, message
    elif (action == "reject"):
        # Update the allocation request status
        allocation_request.status = "Rejected"
        # delete the request
        allocation_request.delete()
        return True, "Allocation request rejected successfully."
    else:
        return False, "Invalid action."


def handle_deallocation_request(allocation_request, action):
    if (action == "approve"):
        # Check if the user is already allocated the equipment
        is_valid, message = validate_deallocation_request(allocation_request)
        if is_valid:
            # Deallocate the equipment
            deallocate_equipment(allocation_request.equipment)
            # Update the allocation request status
            allocation_request.status = "Approved"
            # delete the request
            allocation_request.delete()
            return True, "Deallocation request approved successfully."
        else:
            return False, message
    elif (action == "reject"):
        # delete the request
        allocation_request.delete()
        return True, "Deallocation request rejected successfully."

    else:
        return False, "Invalid action."


def item_requests_view(request):
    return render(request, 'STAFF_USER/itemRequests.html')


def item_requests_details_api(request):
    itemRequestid = request.GET.get('item_request_id', None)
    if itemRequestid is not None:
        try:
            itemRequest_obj = requested_equipments.objects.get(
                id=itemRequestid)
            data = {
                'item_request_id': itemRequest_obj.id,  # type: ignore
                'item_request_requested_by': itemRequest_obj.requested_by.name if itemRequest_obj.requested_by else None,
                'item_request_name': itemRequest_obj.equipment_name,
                'category': itemRequest_obj.category,
                'location': itemRequest_obj.location,
                'date_of_request': itemRequest_obj.date_of_request.strftime('%Y-%m-%d') if itemRequest_obj.date_of_request else None,
                'date_of_purchase': itemRequest_obj.date_of_purchase.strftime('%Y-%m-%d') if itemRequest_obj.date_of_purchase else None,
                'image_url': itemRequest_obj.image.url if itemRequest_obj.image else None,
                'purchase_receipt_url': itemRequest_obj.purchase_receipt.url if itemRequest_obj.purchase_receipt else None,
                'status': True
            }
        except requested_equipments.DoesNotExist:
            data = {'status': False,
                    'error': 'No item request found with this ID'}
    else:
        data = {'status': False, 'error': 'No item request ID provided'}

    return JsonResponse(data)


def equipment_requests_api(request):
    search = request.GET.get('search', '')
    print(search)

    if search:
        queryset = requested_equipments.objects.filter(
            Q(id__icontains=search) |
            Q(equipment_name__icontains=search) |
            Q(requested_by__name__icontains=search) |
            Q(category__icontains=search) |
            Q(date_of_purchase__icontains=search) |
            Q(location__icontains=search)
        ).order_by('-id')
        # order by the time of creation of the equipment
    else:
        queryset = requested_equipments.objects.all().order_by(
            '-id')

    data = []
    for item in queryset:
        row = [
            item.id,  # type: ignore
            item.requested_by.name if item.requested_by else '',
            item.equipment_name,
            item.category if item.category else '',
            item.date_of_request.strftime(
                '%Y-%m-%d') if item.date_of_request else '',

            # This column will be rendered in the frontend with the 'render' function
            item.id,  # type: ignore
            # type: ignore
            f'<input type="checkbox" class="user-checkbox" data-id="{item.id}" />',
        ]
        data.append(row)

    print(data)
    response_data = {'data': data}
    return JsonResponse(response_data)


def update_itemRequest_api(request):
    if request.method == "Post":
        item_request_id = request.POST.get('id')
        equipment_name = request.POST.get('equipment_name')
        category = request.POST.get('category')
        location = request.POST.get('location')
        date_of_purchase = request.POST.get('date_of_purchase')
        image = request.FILES.get('image')
        purchase_receipt = request.FILES.get('purchase_receipt')
        try:
            eq = requested_equipments.objects.get(id=item_request_id)
        except requested_equipments.DoesNotExist:
            return JsonResponse({"status": False, "error": "Equipment not found."})

        # Validate the sizes of the uploaded files
        max_size = 0.5 * 1024 * 1024
        if image and image.size > max_size:
            return JsonResponse({"message": "The equipment image file is too large. Please upload a file smaller than 0.5 MB."}, status=400)
        if purchase_receipt and purchase_receipt.size > max_size:
            return JsonResponse({"message": "The purchase receipt file is too large. Please upload a file smaller than 0.5 MB."}, status=400)

        eq.equipment_name = equipment_name
        eq.category = category
        eq.location = location
        eq.date_of_purchase = date_of_purchase
        if image is not None:
            eq.image = image
        if purchase_receipt is not None:
            eq.purchase_receipt = purchase_receipt
        try:
            eq.save()
        except ValidationError as e:
            return JsonResponse({"message": str(e)}, status=400)
    else:
        print("Invalid request method")
        return JsonResponse({"message": "Invalid request method."}, status=400)


def delete_itemRequests_api(request):

        # get the ids of the items to be delete
        ids = request.GET.getlist('ids[]')
        try:
            requested_equipments.objects.filter(id__in=ids).delete()
            
        except requested_equipments.DoesNotExist:
            return JsonResponse({"status": False, "message": "Equipment not found."})
        return JsonResponse({"message": "Equipment deleted successfully."}, status=200)

