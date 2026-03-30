# predictor/urls.py
from django.urls import path
from .views import login_user, register_user, predict
from . import views


from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.login_user),
    path('register/', views.register_user),
    path('predict/', views.predict),
    path('download-report/', views.download_report),
    path('history/', views.get_history),
]