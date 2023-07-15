from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
# import the settings file
from .models import equipment,CustomUser,requested_equipments
from django.conf import settings


# mails send to user or normal user
def sendAccountActivationMail(user):
    subject = 'Your account has been activated'
    message = 'Dear {},\n\nYour account has been activated. You can now log in and start using our service at {}.\n\nBest regards,\nTeam SMSS'.format(
        user.name, settings.SITE_URL)
    email_from = settings.DEFAULT_FROM_EMAIL
    recipient_list = [user.email, ]
    send_mail(subject, message, email_from, recipient_list)


def sendAllotmentRequestMade(user, equipmentIdsArray):
    # get the names of the equipments
    equipmentNames = []
    for equipmentId in equipmentIdsArray:
        equipmentNames.append(equipment.objects.get(
            equipment_id=equipmentId).equipment_name)
    subject = "Allotment Request Made"
    message = 'Dear {},\n\nYour request for allotment of the following equipments has been made.\n\n{}\n\nBest regards,\nTeam SMSS'.format(
        user.name, equipmentNames.join(','))
    email_from = settings.DEFAULT_FROM_EMAIL
    recipient_list = [user.email, ]
    send_mail(subject, message, email_from, recipient_list)

# mail sent equipments successfully allotted


def sendAllotmentSuccessMail(user, equipment):
    # get the name of the equipment
    equipmentName = equipment.equipment_name
    subject = "Allotment Successfull"
    message = 'Dear {},\n\nYour request for allotment of the {} Item has been approved.\n\nBest regards,\nTeam SMSS'.format(
        user.name, equipmentName)
    email_from = settings.DEFAULT_FROM_EMAIL
    recipient_list = [user.email, ]
    send_mail(subject, message, email_from, recipient_list)

# if a normal user registers, send a mail to the admin


def normalUserRegistrationEmail(normal_user):
    # creat a list of the staff users emails
    staff_users_emails = getStaffUserEmails()
    subject = 'New User Registration'
    message = 'Dear Admin,\n\nA new user {}has registered on the portal. Please check request for the account.\n\nBest regards,\nTeam SMSS'.format(
        normal_user.name)
    email_from = settings.DEFAULT_FROM_EMAIL
    recipient_list = staff_users_emails
    send_mail(subject, message, email_from, recipient_list)
# send allotment request rejected mail


def sendAllotmentRequestRejectedMail(user, equipment):
    # get the names of the equipment
    equipmentName = equipment.equipment_name
    subject = "Allotment Request Rejected"
    message = 'Dear {},\n\nYour request for allotment of the {} Item has been rejected.\n\nBest regards,\nTeam SMSS'.format(
        user.name, equipmentName)
    email_from = settings.DEFAULT_FROM_EMAIL
    recipient_list = [user.email, ]
    send_mail(subject, message, email_from, recipient_list)



#send the deallocation request mail to admin

# new equipment request mail to admin


def newEquipmentRequestMail(equipment, normal_user):
    equipmentName = requested_equipments.equipment_name
    # get the names of the equipments
    staff_users_emails = getStaffUserEmails()
    subject = 'New Equipment Request'
    message = 'Dear Admin,\n\nA new equipment request has been made by {}.\n\nEquipment name: {}\n\nBest regards,\nTeam SMSS'.format(normal_user.name, equipmentName)
    email_from = settings.DEFAULT_FROM_EMAIL
    recipient_list = staff_users_emails
    send_mail(subject, message, email_from, recipient_list)

# Allocation request mail to admin


def newAllocationRequestMail(equipmentIds, normal_user):
    equipmentNames = getEquimentNames(equipmentIds)
    staff_users_emails = getStaffUserEmails()
    subject = 'New Allocation Request'
    message = 'Dear Admin,\n\nA new allocation request has been made by {}.\n\nEquipment Names: {}\n\nBest regards,\nTeam SMSS'.format(
        normal_user.name, equipmentNames.join(','))
    email_from = settings.DEFAULT_FROM_EMAIL
    recipient_list = staff_users_emails
    send_mail(subject, message, email_from, recipient_list)
    

def newDeallocationRequestMail(equipmentIds, normal_user):
    equipmentNames = getEquimentNames(equipmentIds)
    staff_users_emails = getStaffUserEmails()
    subject = 'New Deallocation Request'
    message = 'Dear Admin,\n\nA new deallocation request has been made by {}.\n\nEquipment Names: {}\n\nBest regards,\nTeam SMSS'.format(
        normal_user.name, equipmentNames.join(','))
    email_from = settings.DEFAULT_FROM_EMAIL
    recipient_list = staff_users_emails
    send_mail(subject, message, email_from, recipient_list)
    

def getEquimentNames(equipmentIds):
    equipmentNames = []
    for equipmentId in equipmentIds:
        equipmentNames.append(equipment.objects.get(
            equipment_id=equipmentId).equipment_name)
    return equipmentNames

# New staff User Created Mail to the same user

def staffUserWelcomeMail(staff_user):
    subject = 'Welcome to SMSS'
    message = 'Dear {},\n\nYour account has been created. You can now log in and start using our service at {}.\n\nBest regards,\nTeam SMSS'.format(
        staff_user.name, settings.SITE_URL)
    email_from = settings.DEFAULT_FROM_EMAIL
    recipient_list = [staff_user.email, ]
    send_mail(subject, message, email_from, recipient_list)


def getStaffUserEmails():
    #get the staff users
    staff_users = CustomUser.objects.filter(is_staff=True)
    staff_users_emails = []
    for staff_user in staff_users:
        staff_users_emails.append(staff_user.email)
    return staff_users_emails
