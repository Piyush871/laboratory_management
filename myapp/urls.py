from django.contrib import admin
from django.urls import path
from django.urls.conf import include
from myapp.views import staff_user_management_views
from myapp import views
from myapp.views import normal_user_equip_views, normal_user_managemet_views,  staff_user_request_views
from myapp.views import staff_user_vendor_views
from myapp.views import staff_user_equipment_views
from myapp.views.staff_user_equipment_views import EquipmentApiView
from myapp import File_Views
from django.contrib.auth import views as auth_views
from django.core.mail import get_connection
from django.conf import settings
from django.views.generic.base import View


urlpatterns = [

    # normal_user_management_view.py
    path("normal_user_management",
         normal_user_managemet_views.inactiveUsers_view, name="inactiveUsers"),
    # path("inactiveUsers",normal_user_managemet_views.inactiveUsers_view,name="inactiveUsers"),
    path('api/activate_users/',
         normal_user_managemet_views.activate_users_api, name='active_users_api'),
    path('api/inactive_users/', normal_user_managemet_views.inactive_users_api,
         name='inactive_users_api'),
    path('api/delete_users/', normal_user_managemet_views.delete_users_api,
         name='delete_users_api'),
    path("reg_normal_user", normal_user_managemet_views.reg_normal_user_view,
         name="reg_normal_user"),
    path("api/active_users/", normal_user_managemet_views.active_users_api,
         name="active_users_api"),
    
    

    # staff_user_management_views.py
    path("", staff_user_management_views.home_view, name="home"),
    path("login", staff_user_management_views.login_view, name="login_view"), # type: ignore
    path("logout", staff_user_management_views.logout_view, name="logout"),
    path("staff_user_management", staff_user_management_views.staff_user_management_view,
         name="staff_user_management_view"),
    path("api/staff_users/", staff_user_management_views.create_staff_user,
         name="create_staff_user"),
    path('api/staff_user_get/<int:user_id>/',
         staff_user_management_views.get_staff_user, name='get_staff_user'),
    path('api/staff_user_update/<int:user_id>/',
         staff_user_management_views.update_staff_user, name='update_staff_user'),
    path('api/staff_user_delete/<int:user_id>/',
         staff_user_management_views.delete_staff_user, name='delete_staff_user'),
    
     #normal_user_vendor_views.py


    # staff_user_vendor_views.py
    path("allVendors", staff_user_vendor_views.allVendors_view, name="allVendors"),
    path("api/vendors/", staff_user_vendor_views.get_all_vendors,
         name="get_all_vendors"),
     path("api/vendor_details/", staff_user_vendor_views.get_vendor_details, name="get_vendor_details"),
     path("api/update_vendor/", staff_user_vendor_views.update_vendor, name="update_vendor"),
     path("api/delete_vendors/",staff_user_vendor_views.delete_vendors,name="delete_vendors"),
     path("api/addVendor/", staff_user_vendor_views.add_vendor, name="add_vendor"),
     

    # staff user_equipment_views.py
    path("get_names/", staff_user_equipment_views.get_names_view, name="get_names"),
    path("assign_equipment", staff_user_equipment_views.assign_equipment_view,
         name="assign_equipment"),
    path('check_equipment_deassign', staff_user_equipment_views.check_equipment_deassign_view,
         name='check_equipment_assignment'),
    path('deassign_equipment', staff_user_equipment_views.deassign_equipment_view,
         name='deassign_equipment'),
    path('api/equipment/', staff_user_equipment_views.equipment_api, name='equipment_api'),
    path('api/equipment_filter/', EquipmentApiView.as_view(), name='equipment_api_filter'),
    path('api/equipment_details/',
         staff_user_equipment_views.equipment_details_api, name="equipment_api"),
    path('api/update_equipment/', staff_user_equipment_views.update_equipment_api,
         name="update_equipment_api"),
    path('allEquipments', staff_user_equipment_views.allEquipments_view,
         name="allEquipments"),
    path('api/allEquipments/', staff_user_equipment_views.allEquipments_api,
         name="allEquipments_api"),
    path('api/addEquipment/', staff_user_equipment_views.add_equipment,
         name='add_equipment'),

    # staff user request views
    path("requests", staff_user_request_views.requests_view, name="requests"),
    path('api/handleRequest/', staff_user_request_views.handle_request, name='handle_request'),
    path('api/getRequest/Allocation/', staff_user_request_views.get_allocation_requests,name='get_allocation_requests'),
     path('api/getRequest/DeAllocation/', staff_user_request_views.get_deallocation_requests,name='get_deallocation_requests'),






    # normal user apis normal_user_equip_views.py

    path("api/normal_user/assigned_equipments/", normal_user_equip_views.normal_user_assigned_equipments_api,
         name="normal_user_assigned_equipments_api"),

    path("api/normal_user/all_equipments/", normal_user_equip_views.normal_user_all_equipments_api,
         name="normal_user_assigned_equipments_api"),

    path("api/normal_user/available_equipments/", normal_user_equip_views.normal_user_available_equipments_api,
         name="normal_user_available_equipments_api"),

    path("api/normal_user/addEquipment/", normal_user_equip_views.normal_user_add_equipment_api,
         name="normal_user_add_equipment_api"),

    path("api/normal_user/request_equipment/", normal_user_equip_views.normal_user_request_equipment_api,
         name="normal_user_request_equipment_api"),

    # paths for password reset
    path('password-reset/',
         auth_views.PasswordResetView.as_view(
             template_name='registration/password_reset_form.html',
             email_template_name='registration/password_reset_email.html',
             subject_template_name='registration/password_reset_subject.txt'
         ),
         name='password_reset'),

    path('password-reset/done/',
         auth_views.PasswordResetDoneView.as_view(
             template_name='registration/password_reset_done.html'
         ),
         name='password_reset_done'),

    path('password-reset-confirm/<uidb64>/<token>/',
         auth_views.PasswordResetConfirmView.as_view(
             template_name='registration/password_reset_confirm.html'
         ),
         name='password_reset_confirm'),

    path('password-reset-complete/',
         auth_views.PasswordResetCompleteView.as_view(
             template_name='registration/password_reset_complete.html'
         ),
         name='password_reset_complete'),


    # this were for the testing purpose
    # path("dataTable",staff_user_equipment_views.dataTable_view,name="dataTable"),
    # path("simpleDataTable",staff_user_equipment_views.simpleDataTable_view,name="simpleDataTable"),
    path("test", File_Views.test_view, name="test"),



]
