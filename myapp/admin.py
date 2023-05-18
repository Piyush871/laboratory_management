from django.contrib import admin

from .models import CustomUser, equipment, requested_equipments, AllocationRequest
# Register your models here.

admin.site.site_header = " SMSS Admin"
admin.site.site_title = " SMSS Admin Portal"
admin.site.index_title = " Welcome to SMSS Portal"


class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('email', 'name', 'employee_id', 'contact_no',
                    'employee_designation', 'is_staff', 'user_type')
    search_fields = ('email', 'name')


admin.site.register(CustomUser, CustomUserAdmin)


admin.site.register(equipment)


class equipmentAdmin(admin.ModelAdmin):
    list_display = ('equipment_id', 'equipment_name', 'date_of_purchase',
                    'location', 'assigned_user', 'last_assigned_date', 'allocation_status')
    list_filter = ('location', 'allocation_status')


admin.site.register(requested_equipments)


class requested_equipmentsAdmin(admin.ModelAdmin):
    list_display = ('equipment_id', 'equipment_name',
                    'date_of_purchase', 'location')
    list_filter = ('location')


admin.site.register(AllocationRequest)


class AllocationRequestAdmin(admin.ModelAdmin):
    list_display = ('user', 'equipment', 'status', 'timestamp')
    list_filter = ('status', 'timestamp')
