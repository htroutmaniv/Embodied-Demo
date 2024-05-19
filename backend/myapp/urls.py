from django.urls import path
from .views import RandomUserView, RandomSingleUserView

urlpatterns = [
    path('random-users/', RandomUserView.as_view(), name='random-users'),
    path('single-user/', RandomSingleUserView.as_view(), name='single-user'),
]
