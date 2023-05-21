from .models import equipment, CustomUser
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


# ************************view for registring normal user **************************************************************


# &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&LOGIN VIEW &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&


# %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%LOGGOUT VIEW %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%









# **DEASSIGN EQUIPMENT**



