from django.contrib import admin
from django.urls import path
from django.urls.conf import include
from myapp import views 

urlpatterns = [
    path("",views.home_view,name="home"),
    path("reg_normal_user",views.reg_normal_user_view,name="reg_normal_user"),
    path("login",views.login_view,name="login"),
    path("inactiveUsers",views.inactiveUsers_view,name="inactiveUsers"),
    path("get_names",views.get_names_view,name="get_names"),
    path("assign_equipment",views.assign_equipment_view,name="assign_equipment"),
    path('check_equipment_deassign', views.check_equipment_deassign_view, name='check_equipment_assignment'),
    path('deassign_equipment', views.deassign_equipment_view, name='deassign_equipment'),
    path('api/equipment/', views.equipment_api, name='equipment_api'),
    path('api/inactive_users/', views.inactive_users_api, name='inactive_users_api'),
    
    
    #this were for the testing purpose
    # path("dataTable",views.dataTable_view,name="dataTable"),
    # path("simpleDataTable",views.simpleDataTable_view,name="simpleDataTable"),
    
    path("inactiveUsers",views.inactiveUsers_view,name="inactiveUsers"),
    
] 