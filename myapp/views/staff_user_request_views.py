from ..models import equipment, CustomUser, AllocationRequest
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


def requests_view(request):
    allocation_requests = AllocationRequest.objects.filter(request_type='ALLOCATION')
    deallocation_requests = AllocationRequest.objects.filter(request_type='DEALLOCATION')

    bg_images = ["assets/img/cardbg1.png", "assets/img/cardbg2.png", "assets/img/cardbg3.png"]

    # generate requests_with_images for allocation requests
    allocation_requests_with_images = generate_requests_with_images(allocation_requests, bg_images)

    # generate requests_with_images for deallocation requests
    deallocation_requests_with_images = generate_requests_with_images(deallocation_requests, bg_images)

    return render(request, 'STAFF_USER/requests.html', {'allocation_requests': allocation_requests_with_images, 'deallocation_requests': deallocation_requests_with_images})

def generate_requests_with_images(requests, bg_images):
    RequestWithImage = namedtuple('RequestWithImage', ['allocation_request', 'image'])
    requests_with_images = []
    for allocation_request in requests:
        image = random.choice(bg_images)
        request_with_image = RequestWithImage(allocation_request=allocation_request, image=image)
        requests_with_images.append(request_with_image)
    return requests_with_images



