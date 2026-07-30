from django.shortcuts import render
from rest_framework.views import APIView
from .models import Category, Course, Lesson, Module, Tag
from .permissions import IsInstructorOrAdmin, IsAdminOrReadOnly
from baseapp.utils import success_response, error_response
from .serializers import (CourseCreateUpdateSerializer, CategoryGetCreateSerializer, TagSerializer)


class CourseCreateAPIView(APIView):
    permission_classes = [IsInstructorOrAdmin]
    def post(self, request):
        serializer = CourseCreateUpdateSerializer(data=request.data, context={"request":request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return success_response(message="Course created", data=serializer.data, status_code=201)
    
class CategoryAPIView(APIView):
    permission_classes = [IsAdminOrReadOnly]
    def post(self, request):
        serializer = CategoryGetCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return success_response(message="Category created", data=serializer.data, status_code=201)
    
    def get(self, request):
        categories = Category.objects.all()
        serializer = CategoryGetCreateSerializer(categories, many=True)
        
        return success_response(message="Category list", data=serializer.data)
    
    
class TagAPIView(APIView):
    permission_classes = [IsAdminOrReadOnly]
    def post(self, request):
        serializer = TagSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return success_response(message="Tag created", data=serializer.data, status_code=201)
    
    def get(self, request):
        tags = Tag.objects.all()
        serializer = TagSerializer(tags, many=True)
        
        return success_response(message="Tag list", data=serializer.data)
    
