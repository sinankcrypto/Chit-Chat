from django.urls import path
from .consumers import ChatConsumer, PresenceConsumer

websocket_urlpatterns = [
    path("ws/presence/", PresenceConsumer.as_asgi()),
    path("ws/chat/<int:room_id>/", ChatConsumer.as_asgi()),
]