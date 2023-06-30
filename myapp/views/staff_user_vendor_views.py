from ..models import equipment, CustomUser, AllocationRequest,Vendor,Part
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
from django.core.exceptions import ObjectDoesNotExist





def allVendors_view(request):
    template_name= 'STAFF_USER/base_staff_user.html' if request.user.is_staff else 'NORMAL_USER/base_normal_user.html' 
    return render(request, 'STAFF_USER/allVendors.html', {'extend_template': template_name})

def get_all_vendors(request):
    search = request.GET.get('search', '')

    if search:
        queryset = Vendor.objects.filter(
            Q(vendor_id__icontains=search) |
            Q(vendor_name__icontains=search) |
            Q(vendor_contact_no__icontains=search) |
            Q(website_link__icontains=search) |
            Q(parts__name__icontains=search)
        )
    else:
        queryset = Vendor.objects.all().order_by('-vendor_id')

    data = []
    for vendor in queryset:
        parts = [part.name for part in vendor.parts.all()]
        #convert list to string in space separated format
        parts = ' '.join(parts)        
        
        row = [
            vendor.vendor_id,
            vendor.name,
            parts,
            vendor.contact_no,
            vendor.website_link,
            # This column will be rendered in the frontend with the 'render' function
            vendor.vendor_id,
            f'<input type="checkbox" class="user-checkbox" data-id="{vendor.vendor_id}" />',
        ]
        data.append(row)

    response_data = {'data': data}
    return JsonResponse(response_data)

def get_vendor_details(request):
    vendor_id = request.GET.get('vendor_id', None)

    if vendor_id is not None:
        try:
            vendor = Vendor.objects.get(vendor_id=vendor_id)
        except ObjectDoesNotExist:
            return JsonResponse({'status': False, 'error': 'Vendor not found'})

        parts = [part.name for part in vendor.parts.all()]
        data = {
            'vendor_id': vendor.vendor_id,
            'name': vendor.name,
            'parts': ', '.join(parts),
            'email': vendor.email,
            'contact_no': vendor.contact_no,
            'website_link': vendor.website_link,
            'address': vendor.address,
            'status': True
        }
        print(data)
        return JsonResponse(data)
    else:
        return JsonResponse({'status': False, 'error': 'No vendor_id provided'})
    

def update_vendor(request):
    if request.method == "POST":
        vendor_id = request.POST.get("vendor_id")
        name = request.POST.get("name")
        parts = request.POST.get("parts")
        email = request.POST.get("email")
        contact_no = request.POST.get("contact_no")
        website_link = request.POST.get("website_link")
        address = request.POST.get("address")

        parts_names = parts.split(',')
        parts_list = []
        for part_name in parts_names:
            part, created = Part.objects.get_or_create(name=part_name.strip())
            parts_list.append(part)

        try:
            vendor = Vendor.objects.get(vendor_id=vendor_id)
            vendor.name = name
            vendor.email = email
            vendor.contact_no = contact_no
            vendor.website_link = website_link
            vendor.address = address
            vendor.save()
            vendor.parts.clear()
            vendor.parts.add(*parts_list)
            return JsonResponse({"status": True, "message": "Vendor updated successfully"})
        except Vendor.DoesNotExist:
            return JsonResponse({"status": False, "error": "Vendor does not exist"})
    else:
        return JsonResponse({"status": False, "error": "Invalid request method"})  
  
def delete_vendors(request):
  if request.method == "DELETE":
    ids = request.GET.getlist("ids[]")
    ids = [int(id) for id in ids]  # Convert list of strings to list of integers

    try:
      # Delete all vendors with the given ids
      Vendor.objects.filter(vendor_id__in=ids).delete()
      return JsonResponse({"status": "success", "message": "Vendors deleted successfully."})
    except:
      return JsonResponse({"status": "error", "message": "Error deleting vendors."})
  else:
    return JsonResponse({"status": "error", "message": "Invalid request method."})

def add_vendor(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        parts = request.POST.get('parts').split(',')
        email = request.POST.get('email')
        contact_no = request.POST.get('contact_no')
        address = request.POST.get('address')
        website_link = request.POST.get('website_link')
        print(name, parts, email, contact_no, address, website_link)

        parts_list = []
        for part_name in parts:
            part, created = Part.objects.get_or_create(name=part_name.strip())
            parts_list.append(part)

        try:
            vendor = Vendor(name=name, email=email, contact_no=contact_no, address=address, website_link=website_link)
            print(vendor.__dict__)
            try:
                vendor.save()
            except Exception as e:
                 print("Vendor save failed:", str(e))

            vendor.parts.add(*parts_list)
            return JsonResponse({"status": "success", "message": "Vendor added successfully."})
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)})
    else:
        return JsonResponse({"status": "error", "message": "Invalid request method."})
