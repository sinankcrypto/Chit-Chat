from django.shortcuts import render
from django.db.models import Count

from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action

from .models import Notification
from .serializers import NotificationSerializer
from .pagination import NotificationPagination

# Create your views here.

class NotificationViewSet(ModelViewSet):

    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = NotificationPagination

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)
    
    #GET /notifications/unread/
    @action(detail=False, methods=["get"])
    def unread(self, request):

        queryset = self.get_queryset().filter(is_read=False)

        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)

        return Response(serializer.data)
    
    #GET /notifications/unread-count/
    @action(detail=False, methods=["get"], url_path="unread-count")
    def unread_count(self, request):
        count = self.get_queryset().filter(is_read=False).count()

        return Response({
            "unread_count": count
        })
    
    #POST /notifications/{id}/mark-read/
    @action(detail=True, methods=["post"], url_path="mark-read")
    def mark_read(self, request, pk=None):
        notification = self.get_object()

        notification.is_read = True
        notification.save(update_fields=["is_read"])

        return Response({"message": "Notification mark as read"})
    
    #POST /notifications/mark-all-read/
    @action(detail=False, methods=["post"], url_path="mark-all-read")
    def mark_all_read(self, request):
        self.get_queryset().filter(is_read=False).update(is_read=True)

        return Response({
            "message": "All notifications marked as read"
        })