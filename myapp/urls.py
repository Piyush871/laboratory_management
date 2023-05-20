from django.contrib import admin
from django.urls import path
from django.urls.conf import include
from myapp import normal_user_equip_views
from myapp import views

urlpatterns = [
    path("",views.home_view,name="home"),
    path("reg_normal_user",views.reg_normal_user_view,name="reg_normal_user"),
    path("login",views.login_view,name="login"),
    path("logout",views.logout_view,name="logout"),
    path("inactiveUsers",views.inactiveUsers_view,name="inactiveUsers"),
    path("get_names",views.get_names_view,name="get_names"),
    path("assign_equipment",views.assign_equipment_view,name="assign_equipment"),
    path('check_equipment_deassign', views.check_equipment_deassign_view, name='check_equipment_assignment'),
    path('deassign_equipment', views.deassign_equipment_view, name='deassign_equipment'),
    path('api/equipment/', views.equipment_api, name='equipment_api'),
    path('api/inactive_users/', views.inactive_users_api, name='inactive_users_api'),
    path('api/activate_users/', views.activate_users_api, name='active_users_api'),
    path('api/delete_users/', views.delete_users_api, name='delete_users_api'),
    path('api/equipment_details/',views.equipment_details_api,name="equipment_api"),
    path('api/update_equipment/',views.update_equipment_api,name="update_equipment_api"),
    path('allEquipments',views.allEquipments_view,name="allEquipments"),
    path('api/allEquipments/',views.allEquipments_api,name="allEquipments_api"),
    path('api/addEquipment/', views.add_equipment, name='add_equipment'),
    
    #this were for the testing purpose
    # path("dataTable",views.dataTable_view,name="dataTable"),
    # path("simpleDataTable",views.simpleDataTable_view,name="simpleDataTable"),
    
    path("inactiveUsers",views.inactiveUsers_view,name="inactiveUsers"),
    
    
    
    
    #normal user apis**************
    
    path("api/normal_user/assigned_equipments/", normal_user_equip_views.normal_user_assigned_equipments_api, name="normal_user_assigned_equipments_api"),
    
    path("api/normal_user/all_equipments/",normal_user_equip_views.normal_user_all_equipments_api,name="normal_user_assigned_equipments_api"),

    path("api/normal_user/available_equipments/",normal_user_equip_views.normal_user_available_equipments_api,name="normal_user_available_equipments_api"),
     
    path("api/normal_user/addEquipment/",normal_user_equip_views.normal_user_add_equipment_api,name="normal_user_add_equipment_api"),
    
    path("api/normal_user/request_equipment/",normal_user_equip_views.normal_user_request_equipment_api,name="normal_user_request_equipment_api"),      
    
] 