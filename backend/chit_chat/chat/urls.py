from django.urls import path
from .views import ChatRoomView, RoomMessagesView, AddUsersToGroupView, RemoveUserFromGroupView

urlpatterns = [
    path("rooms/", ChatRoomView.as_view()),
    path("rooms/<int:room_id>/messages/", RoomMessagesView.as_view()),
    path("rooms/<int:room_id>/add-users/", AddUsersToGroupView.as_view()),
    path("rooms/<int:room_id>/remove-user/", RemoveUserFromGroupView.as_view()),    
]