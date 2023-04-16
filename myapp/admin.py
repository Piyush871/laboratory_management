from django.contrib import admin

from .models import CustomUser,equipment
# Register your models here.

class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('email', 'name', 'employee_id', 'contact_no', 'employee_designation', 'is_staff', 'user_type')
    search_fields = ('email', 'name')
    
admin.site.register(CustomUser,CustomUserAdmin)    


admin.site.register(equipment)
class equipmentAdmin(admin.ModelAdmin):
    list_display = ('equipment_id', 'equipment_name', 'date_of_purchase', 'location', 'assigned_user', 'last_assigned_date', 'allocation_status')
    list_filter = ('location', 'allocation_status')