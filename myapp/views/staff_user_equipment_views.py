import base64
import json
from datetime import datetime, timedelta

from django.contrib import messages
# import the authentication backend
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required, user_passes_test
from django.core import serializers
from django.core.exceptions import ObjectDoesNotExist, ValidationError
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
from django.views.generic.base import View

from myapp.forms import UserRegistrationForm
from myapp.models import CustomUser, equipment

from ..models import CustomUser, equipment


def get_names_view(request):
    equipment_id = int(request.GET.get("equipment_id"))
    emp_id = request.GET.get("employee_id")

    if (not equipment.objects.filter(equipment_id=equipment_id).exists()):
        return JsonResponse({"message": "Equipment does not exist"}, status=400)
    if (emp_id is None or not CustomUser.objects.filter(employee_id=int(emp_id)).exists()):
        return JsonResponse({"message": "Employee does not exist"}, status=400)

    equipment_name = equipment.objects.get(
        equipment_id=equipment_id).equipment_name
    employee_name = CustomUser.objects.get(employee_id=int(emp_id)).name
    # if equipment is already assigned to someone else then return the name of the person to whom it is assigned
    if (equipment.objects.get(equipment_id=equipment_id).allocation_status == True):
        equipment_obj = equipment.objects.get(equipment_id=equipment_id)
        if equipment_obj.assigned_user is not None:
            assign_user_emp_id = equipment_obj.assigned_user.employee_id

            if (assign_user_emp_id == int(emp_id)):
                return JsonResponse({"responseText": "Equipment is already assigned to this user"})
            else:
                return JsonResponse({"responseText": "Equipment is already assigned to "+CustomUser.objects.get(employee_id=assign_user_emp_id).name})
        else:
            return JsonResponse({"responseText": "No user assigned to this equipment"})
    else:
        return JsonResponse({"responseText": equipment_name+"will be assigned to "+employee_name})


@login_required(login_url='reg_normal_user')
def assign_equipment_view(request):
    print("assign equipment view")
    body_unicode = request.body.decode('utf-8')
    body_data = json.loads(body_unicode)
    equipment_id = body_data.get("equipment_id")
    employee_id = body_data.get("employee_id")
    location = body_data.get("location")
    try:
        eq = equipment.objects.get(equipment_id=equipment_id)
        user = CustomUser.objects.get(employee_id=employee_id)
    except ObjectDoesNotExist:
        return JsonResponse({'message': 'equipment or user does not exist'})

    # Check if the equipment is already assigned
    if eq.allocation_status == True:
        return JsonResponse({'message': 'equipment is already assigned!'})

    # Check if location update is needed
    if location == "":
        location = None

    # Update the equipment object with the user and location
    eq.assigned_user = user
    if location is not None:
        eq.location = location
    eq.last_assigned_date = timezone.now()
    eq.allocation_status = True
    eq.save()

    return JsonResponse({'message': 'equipment assigned successfully!'})


@login_required(login_url='reg_normal_user')
def check_equipment_deassign_view(request):
    equipment_id = request.GET.get("equipment_id")

    if not equipment_id:
        return JsonResponse({'message': 'equipment id is not provided!'}, status=400)
    try:
        eq = equipment.objects.get(equipment_id=equipment_id)
    except ObjectDoesNotExist:
        return JsonResponse({'message': 'equipment does not exist!'}, status=400)

    if eq.assigned_user is None:
        responseText = "Equipment is not assigned to anyone"
        return JsonResponse({"message": responseText}, status=400)

    user = eq.assigned_user

    responseText = "Equipment is assigned to " + \
        user.name if user.name else " Unknown user"
    responseText += " and it is located at "
    responseText += eq.location if eq.location else " Unknown location"
    return JsonResponse({"responseText": responseText})


def deassign_equipment_view(request):
    body_unicode = request.body.decode('utf-8')
    body_data = json.loads(body_unicode)

    equipment_id = body_data.get("equipment_id")
    location = body_data.get("location")
    try:
        eq = equipment.objects.get(equipment_id=equipment_id)
    except ObjectDoesNotExist:
        return JsonResponse({'message': "Equipment does not exist!"}, status=400)

    if eq.allocation_status == False:
        return JsonResponse({'message': 'equipment is not assigned!'}, status=400)

    eq.assigned_user = None

    if location is not None:
        eq.location = request.POST.get("location")

    eq.last_assigned_date = None
    eq.allocation_status = False
    eq.save()
    return JsonResponse({'message': 'equipment deassigned successfully!'})


def equipment_api(request):
    search = request.GET.get('search', '')
    print(search)

    if search:
        queryset = equipment.objects.filter(
            Q(equipment_id__icontains=search) |
            Q(equipment_name__icontains=search) |
            Q(category__icontains=search) |
            Q(date_of_purchase__icontains=search) |
            Q(location__icontains=search) |
            Q(assigned_user__name__icontains=search) |
            Q(assigned_user__employee_id__icontains=search)
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
            item.assigned_user.name if item.assigned_user else '',
            item.last_assigned_date.strftime(
                '%Y-%m-%d') if item.last_assigned_date else '',
            # This column will be rendered in the frontend with the 'render' function
            item.equipment_id,
        ]
        data.append(row)

    print(data)
    response_data = {'data': data}
    return JsonResponse(response_data)


def allEquipments_api(request):
    search = request.GET.get('search', '')
    print(search)

    if search:
        queryset = equipment.objects.filter(
            Q(equipment_id__icontains=search) |
            Q(equipment_name__icontains=search) |
            Q(category__icontains=search) |
            Q(date_of_purchase__icontains=search) |
            Q(location__icontains=search) |
            Q(assigned_user__name__icontains=search) |
            Q(assigned_user__employee_id__icontains=search)
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
            item.assigned_user.name if item.assigned_user else '',
            item.last_assigned_date.strftime(
                '%Y-%m-%d') if item.last_assigned_date else '',
            # This column will be rendered in the frontend with the 'render' function
            item.equipment_id,
            f'<input type="checkbox" class="user-checkbox" data-id="{item.equipment_id}" />',

        ]
        data.append(row)

    print(data)
    response_data = {'data': data}
    return JsonResponse(response_data)

# ALL EQUIPMENTS AS VIEW


class EquipmentApiView(View):
    def get(self, request, *args, **kwargs):
        date_before = self.request.GET.get('date_before', None)
        date_after = self.request.GET.get('date_after', None)
        assigned_status = self.request.GET.get('assigned_status', None)
        search = self.request.GET.get('search', None)
        # console all this data
        print(date_before, date_after, assigned_status, search)

        equipments = equipment.objects.all().order_by('-last_assigned_date')

        if date_before:
            date_before = datetime.strptime(date_before, '%Y-%m-%d').date()
            equipments = equipments.filter(last_assigned_date__lte=date_before)

        if date_after:
            date_after = datetime.strptime(date_after, '%Y-%m-%d').date()
            equipments = equipments.filter(last_assigned_date__gte=date_after)

        if assigned_status is not None:
            assigned_status = assigned_status.lower() in ['true', '1', 'yes']
            equipments = equipments.filter(allocation_status=assigned_status)

        if search:
            equipments = equipments.filter(
                Q(equipment_id__icontains=search) |
                Q(equipment_name__icontains=search) |
                Q(category__icontains=search) |
                Q(date_of_purchase__icontains=search) |
                Q(location__icontains=search) |
                Q(assigned_user__name__icontains=search) |
                Q(assigned_user__employee_id__icontains=search)
            )

        data = []
        for item in equipments:
            row = [
                item.equipment_id,
                item.equipment_name,
                item.category,
                item.assigned_user.name if item.assigned_user else '',
                item.last_assigned_date.strftime(
                    '%Y-%m-%d') if item.last_assigned_date else '',
                item.equipment_id,
                f'<input type="checkbox" class="user-checkbox" data-id="{item.equipment_id}" />',
            ]
            data.append(row)

        response_data = {'data': data}
        return JsonResponse(response_data)


# **EQUIPMENT DETAILS API**

def equipment_details_api(request):
    equipment_id = request.GET.get('equipment_id', None)
    if equipment_id is not None:
        try:
            equipment_obj = equipment.objects.get(equipment_id=equipment_id)
            data = {
                'equipment_id': equipment_obj.equipment_id,
                'equipment_name': equipment_obj.equipment_name,
                'category': equipment_obj.category,
                'assigned_user': equipment_obj.assigned_user.name if equipment_obj.assigned_user else None,
                'last_assigned': equipment_obj.last_assigned_date.strftime('%Y-%m-%d') if equipment_obj.last_assigned_date else None,
                'location': equipment_obj.location,
                'image_url': equipment_obj.image.url if equipment_obj.image else None,
                'purchase_receipt_url': equipment_obj.purchase_receipt.url if equipment_obj.purchase_receipt else None,
                'status': True
            }
        except equipment.DoesNotExist:
            data = {'status': False, 'error': 'No equipment found with this ID'}
    else:
        data = {'status': False, 'error': 'No equipment ID provided'}
    print(data)

    return JsonResponse(data)


def update_equipment_api(request):
    if request.method == 'POST':
        equipment_id = request.POST.get('equipment_id')
        equipment_name = request.POST.get('equipment_name')
        category = request.POST.get('category')
        location = request.POST.get('location')
        image = request.FILES.get('image')
        purchase_receipt = request.FILES.get('purchase_receipt')

        try:
            eq = equipment.objects.get(equipment_id=equipment_id)
        except equipment.DoesNotExist:
            return JsonResponse({"status": False, "error": "Equipment not found."})

        # Validate the sizes of the uploaded files
        max_size = 0.5 * 1024 * 1024  # 0.5 MB in bytes
        if image and image.size > max_size:
            return JsonResponse({"message": "The equipment image file is too large. Please upload a file smaller than 0.5 MB."}, status=400)
        if purchase_receipt and purchase_receipt.size > max_size:
            return JsonResponse({"message": "The purchase receipt file is too large. Please upload a file smaller than 0.5 MB."}, status=400)

        eq.equipment_name = equipment_name
        eq.category = category
        eq.location = location
        if image is not None:
            eq.image = image
        if purchase_receipt is not None:
            eq.purchase_receipt = purchase_receipt
        try:
            eq.save()
        except ValidationError as e:
            return JsonResponse({"message": str(e)}, status=400)

        return JsonResponse({"message": "Equipment updated successfully."})
    else:
        print("Invalid request method")
        return JsonResponse({"message": "Invalid request method."}, status=400)


def allEquipments_view(request):
    return render(request, 'STAFF_USER/allEquipments.html')


@csrf_exempt
def add_equipment(request):
    if request.method == 'POST':
        try:
            equipment_name = request.POST['equipment_name']
            print(equipment_name)
            category = request.POST['category']
            date_of_purchase = request.POST['date_of_purchase']
            location = request.POST['location']
            print(location)
            # first if the file is uploaded or not
            image_file = None
            purchase_receipt = None
            if 'image' in request.FILES:
                image_file = request.FILES['image']
            print("image_file is found successfully")
            if 'purchase_receipt' in request.FILES:
                purchase_receipt = request.FILES['purchase_receipt']
            new_equipment = equipment(
                equipment_name=equipment_name,
                category=category,
                date_of_purchase=date_of_purchase,
                location=location,
            )
            # check the size of the image
            max_size = 0.5 * 1024 * 1024  # 0.5 MB in bytes
            if image_file is not None and image_file.size > max_size:
                return JsonResponse({'message': 'The equipment image file is too large. Please upload a file smaller than 0.5 MB.'}, status=400)
            if image_file is not None:
                new_equipment.image.save(image_file.name, image_file)

            if purchase_receipt is not None and purchase_receipt.size > max_size:
                return JsonResponse({'message': 'The purchase receipt file is too large. Please upload a file smaller than 0.5 MB.'}, status=400)
            if purchase_receipt is not None:
                new_equipment.purchase_receipt.save(
                    purchase_receipt.name, purchase_receipt)
            # try saving the equipment
            try:
                new_equipment.save()
            except ValidationError as e:
                print("the error is in saving the equipment")
                print(e)
                return JsonResponse({'message': str(e)}, status=400)

            return JsonResponse({'status': 'ok'}, status=200)
        except Exception as e:
            print("the error is here")
            print(e)
            return JsonResponse({'error': str(e)}, status=400)
    else:
        print(request.method)
        return JsonResponse({'error': 'Invalid Method'}, status=400)

def delete_equipments_api(request):
    if request.method == 'POST':
        # get the ids of the equipments to be deleted
        ids = request.GET.getlist('ids[]')
        print(ids)
        if ids:
            try:
                equipments = equipment.objects.filter(equipment_id__in=ids)
                equipments.delete()
            except equipment.DoesNotExist:
                return JsonResponse({'message': 'Equipment not found'}, status=400)
            return JsonResponse({'status': 'ok', 'message': "equipments deleted successfully"}, status=200)
