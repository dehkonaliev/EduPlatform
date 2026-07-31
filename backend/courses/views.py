from django.shortcuts import render
from rest_framework.views import APIView
from .models import Category, Course, Lesson, Module, Tag
from rest_framework.permissions import AllowAny
from baseapp.utils import success_response, error_response
from .serializers import (CourseCreateUpdateSerializer, CategoryGetCreateSerializer, TagSerializer,
    ModuleCreateUpdateSerializer, LessonCreateUpdateSerializer, CourseDetailSerializer
)
from baseapp.permissions import (IsInstructorOrAdmin, IsAdminOrReadOnly, IsInstructorAndOwner,
    IsAdminOrOwnerOrReadOnlyPublished
)


class CourseCreateAPIView(APIView):
    permission_classes = [IsInstructorAndOwner]
    def post(self, request):
        serializer = CourseCreateUpdateSerializer(data=request.data, context={"request":request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return success_response(message="Course created", data=serializer.data, status_code=201)
    
class CourseUpDelAPIView(APIView):
    permission_classes = [IsInstructorAndOwner]

    def patch(self, request, pk):
        course = Course.objects.filter(pk=pk).first()
        if not course:
            return error_response(message="Course not found", status_code=404)

        self.check_object_permissions(request, course)

        serializer = CourseCreateUpdateSerializer(
            instance=course,
            data=request.data,
            context={"request": request},
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return success_response(message="Course updated", data=serializer.data, status_code=200)
    
    def delete(self, request, pk):
        course = Course.objects.filter(pk=pk).first()
        if not course:
            return error_response(message="Course not found", status_code=404)

        self.check_object_permissions(request, course)
        
        course.delete()
        
        return success_response(message="Course deleted")

class ModuleCreateAPIView(APIView):
    permission_classes = [IsInstructorAndOwner]
    def post(self, request):
        user = request.user
        serializer = ModuleCreateUpdateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return success_response(message="Module created", status_code=201, data=serializer.data)

class CourseDetailAPIView(APIView):
    permission_classes = [IsAdminOrOwnerOrReadOnlyPublished]
    def get(self, request, pk):
        course = Course.objects.filter(pk=pk).first()
        
        if not course:
            return error_response(message="Course not found", status_code=404)
        if not request.user.is_authenticated and course.status != Course.Status.PUBLISHED:
            return error_response(message="Course not found", status_code=404)
        
        self.check_object_permissions(request, course)
        
        serializer = CourseDetailSerializer(course)
        return success_response(message="Course detail", data=serializer.data)

class ModuleUpdateDeleteAPIView(APIView):
    permission_classes = [IsInstructorAndOwner]
    
    def patch(self, request, pk):
        module = Module.objects.filter(pk=pk).first()
        if not module:
            return error_response(message="Module not found", status_code=404)
        
        self.check_object_permissions(request, module.course)
        
        serializer = ModuleCreateUpdateSerializer(instance=module, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return success_response(message="Module updated", data=serializer.data)
    
    def delete(self, request, pk):
        module = Module.objects.filter(pk=pk).first()
        if not module:
            return error_response(message="Module not found", status_code=404)
        
        self.check_object_permissions(request, module.course)
        
        module.delete()
        
        return success_response(message="Module deleted")

class LessonCreateAPIView(APIView):
    permission_classes = [IsInstructorAndOwner]
    def post(self, request):
        serializer = LessonCreateUpdateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return success_response(message="Lesson created", data=serializer.data, status_code=201)
           

class LessonUpDelAPIView(APIView):
    permission_classes = [IsInstructorAndOwner]
    def patch(self, request, pk):
        lesson = Lesson.objects.filter(pk=pk).first()
        if not lesson:
            return error_response(message="Lesson not found", status_code=404)
        serialier = LessonCreateUpdateSerializer(instance=lesson, data=request.data, partial=True, context={'request': request})
        serialier.is_valid(raise_exception=True)
        serialier.save()
        
        return success_response(message="Lesson updated", data=serialier.data)
    
    def delete(self, request, pk):
        lesson = Lesson.objects.filter(pk=pk).first()
        if not lesson:
            return error_response(message="Lesson not found", status_code=404)
        
        self.check_object_permissions(request, lesson.module.course)
        lesson.delete()
        
        return success_response(message="Lesson deleted")
        
    











     
    
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
    
