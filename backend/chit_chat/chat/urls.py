from django.urls import path
from .views import ChatRoomView, RoomMessagesView

urlpatterns = [
    path("rooms/", ChatRoomView.as_view()),
    path("rooms/<int:room_id>/messages/", RoomMessagesView.as_view()),
]