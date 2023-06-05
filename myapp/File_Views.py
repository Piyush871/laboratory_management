from .models import equipment, CustomUser , AllocationRequest
from django.shortcuts import render, redirect
from myapp.models import CustomUser, equipment, AllocationRequest
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
import random
from collections import namedtuple

def test_view(request):
    allocation_requests = AllocationRequest.objects.filter(request_type='ALLOCATION')
    #print the number of allocation requests
    print(len(allocation_requests))
    bg_images = ["assets/img/cardbg1.png",
                 "assets/img/cardbg2.png", "assets/img/cardbg3.png"]
    RequestWithImage = namedtuple('RequestWithImage', ['allocation_request', 'image'])
    requests_with_images = []
    for allocation_request in allocation_requests:
        image = random.choice(bg_images)
        request_with_image = RequestWithImage(allocation_request=allocation_request, image=image)
        requests_with_images.append(request_with_image)
    
    for request_with_image in requests_with_images:
        print(request_with_image.allocation_request.user.name)
        
    return render(request, 'NOT_USED/index.html', {'allocation_requests': requests_with_images})