from .models import equipment, CustomUser
from django.shortcuts import render, redirect
from myapp.models import CustomUser, equipment
from myapp.forms import UserRegistrationForm
from django.http import HttpResponse, JsonResponse
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


@login_required(login_url='reg_normal_user')
def home_view(request):
    user_type = ""
    user_name = ""

    if request.user.is_authenticated:
        user_type = "User"
        if (request.user.is_staff):
            user_type = "Staff"
        elif (request.user.is_superuser):
            user_type = "Superuser"
        else:
            user_type = "User"
        user_name = request.user.name

    else:
        user_type = "Anonymous"
        user_name = "Anonymous"

    context = {
        'user_type': user_type,
        'name': user_name,
    }
    return render(request, 'home.html', context)


def reg_normal_user_view(request):
    if request.method == 'POST':
        # get the data from the user form
        form_data = request.POST.copy()
        print(form_data)
        # set user_type directly from form data
        form_data['user_type'] = 'normal'
        form_data['is_active']
        form = UserRegistrationForm(form_data)

        if form.is_valid():
            form.save()
            return HttpResponse('<script>alert("User registered successfully!");window.location.href="/";</script>')
        else:
            print(form.errors)
            return render(request, 'register.html', {'form': form})
    else:
        return render(request, 'register.html')

        # feed the data to the form  object


def login_view(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')
        user = authenticate(request, email=email, password=password)
        if user is not None:
            login(request, user)
            messages.success(request, 'Login successful!')
            print("Login successful!")
            return redirect('home')
        else:
            print("Invalid email or password!")
            messages.error(request, 'Invalid email or password!')
            return render(request, 'register.html')


def inactiveUsers_view(request):
    users = CustomUser.objects.filter(is_active=False)
    context = {
        'users': users
    }
    return render(request, 'inactiveUsers.html', context)


def get_names_view(request):
    equipment_id = request.GET.get("equipment_id")
    employee_id = request.GET.get("employee_id")

    equipment_name = equipment.objects.get(id=equipment_id).equipment_name
    employee_name = CustomUser.objects.get(id=employee_id).name
    print(equipment_name)
    print(employee_name)

    return JsonResponse({"equipment_name": equipment_name, "employee_name": employee_name})


@login_required(login_url='reg_normal_user')
def assign_equipment_view(request):
    equipment_id = request.POST.get("equipment_id")
    employee_id = request.POST.get("employee_id")
    location = request.POST.get("location")

    # Get the equipment and user objects
    eq = equipment.objects.get(id=equipment_id)
    user = CustomUser.objects.get(id=employee_id)

    # Update the equipment object with the user and location
    eq.assigned_user = user
    eq.location = location
    eq.last_assigned_date = timezone.now()
    eq.allocation_status = True
    eq.save()
    return JsonResponse({'message': 'equipment assigned successfully!'})


@login_required(login_url='reg_normal_user')
def check_equipment_deassign_view(request):
    equipment_id = request.GET.get("equipment_id")
    print(equipment_id)
    try:
        eq = equipment.objects.get(equipment_id=equipment_id)
        if eq.assigned_user is None:
            raise ValueError("equipment is not currently assigned to anyone")

        user = eq.assigned_user
        print(user.name)
        data = {
            "equipment_name": eq.equipment_name,
            "employee_name": user.name,
            "location": eq.location,
        }
        return JsonResponse(data)
    except Exception as e:
        data = {"error": str(e)}
        return JsonResponse(data, status=400)

# **DEASSIGN EQUIPMENT**


def deassign_equipment_view(request):
    print("deassigning equipment")
    equipment_id = request.POST.get("equipment_id")
    print(equipment_id)
    eq = equipment.objects.get(equipment_id=equipment_id)
    eq.assigned_user = None
    if (request.POST.get("location") == " "):
        eq.location = " "
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
        )[:100]
    else:
        queryset = equipment.objects.all().order_by(
            '-last_assigned_date')[:100]

    data = []
    for item in queryset:
        row = [
            item.equipment_id,
            item.equipment_name,
            item.category,
            item.assigned_user.name if item.assigned_user else '',
            item.last_assigned_date.strftime(
                '%Y-%m-%d') if item.last_assigned_date else '',
            '',  # This column will be rendered in the frontend with the 'render' function
        ]
        data.append(row)

    print(data)
    response_data = {'data': data}
    return JsonResponse(response_data)


def dataTable_view(request):
    return render(request, 'dataTable.html')


def simpleDataTable_view(request):
    return render(request, 'simpleDataTable.html')


def inactiveUsers_view(request):
    users = CustomUser.objects.filter(is_active=False)
    context = {
        'users': users
    }
    return render(request, 'inactiveUsers.html', context)


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
        queryset = CustomUser.objects.filter(is_active=False, user_type='normal')

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