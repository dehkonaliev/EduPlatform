from django.shortcuts import render
from rest_framework.views import APIView
from baseapp.utils import success_response, error_response
from .serializers import ReviewSerializer
from baseapp.permissions import IsOwner
from rest_framework.permissions import IsAuthenticated
from .models import Review


class ReviewCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        user = request.user
        if user.account_status != "ACTIVE":
            return error_response(message="User is not active")
        
        serializer = ReviewSerializer(data=request.data, context={'user': user})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return success_response(message="Review Created", data=serializer.data)
    
class ReviewUpDelAPIView(APIView):
    permission_classes = [IsAuthenticated, IsOwner]
    def patch(self, request, pk):
        review = Review.objects.filter(pk=pk).first()
        if not review:
            return error_response(message="Review not found", status_code=404)
        
        self.check_object_permissions(request, review)
        
        serializer = ReviewSerializer(instance=review, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return success_response(message="Review updated", data=serializer.data)
    
    def delete(self, request, pk):
        review = Review.objects.filter(pk=pk).first()
        if not review:
            return error_response(message="Review not found", status_code=404)
        
        self.check_object_permissions(request, review)
        
        review.delete()
        
        return success_response(message="Review deleted")