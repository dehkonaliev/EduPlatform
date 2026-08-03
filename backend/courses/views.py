from django.shortcuts import render
from rest_framework.views import APIView
from .models import Category, Course, Lesson, Module, Tag
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db.models import Q
from .models import QuizOption, Quiz, Question
from baseapp.utils import success_response, error_response
from .serializers import (CourseCreateUpdateSerializer, CategoryGetCreateSerializer, TagSerializer,
    ModuleCreateUpdateSerializer, LessonCreateUpdateSerializer, CourseDetailSerializer, ModuleDetailSerializer,
    LessonDetailSerializer, CourseInfoSerializer, CourseDetailForStuSerializer, QuizSerializer, QuestionSerializer,
    OptionSerializer, UpQuizSerializer
)
from baseapp.permissions import (IsInstructorOrAdmin, IsAdminOrReadOnly, IsInstructorAndOwner,
    IsAdminOrOwnerOrReadOnlyPublished, IsStudentAndOwner
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
        if request.user.is_authenticated and request.user.user_role == "STUDENT":
            serializer = CourseDetailForStuSerializer(course, context={'request': request})
        return success_response(message="Course detail", data=serializer.data)


class ModuleCreateAPIView(APIView):
    permission_classes = [IsInstructorAndOwner]
    def post(self, request):
        user = request.user
        serializer = ModuleCreateUpdateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return success_response(message="Module created", status_code=201, data=serializer.data)


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


class ModuleDetailAPIView(APIView):
    permission_classes = [IsAdminOrOwnerOrReadOnlyPublished]
    def get(self, request, pk):
        module = Module.objects.filter(pk=pk).first()
        if not module:
            return error_response(message="Module not found", status_code=404)
        if not request.user.is_authenticated and module.course.status != Course.Status.PUBLISHED:
            return error_response(message="Module not found", status_code=404)
        
        self.check_object_permissions(request, module.course)
        
        serializer = ModuleDetailSerializer(module)
        return success_response(message="Module detail", data=serializer.data)


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
       
       
class LessonDetailAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrOwnerOrReadOnlyPublished]
    def get(self, request, pk):
        user = request.user
        lesson = Lesson.objects.filter(pk=pk).first()
        if not lesson:
            return error_response(message="Lesson not found", status_code=404)
        if not request.user.is_authenticated and lesson.module.course.status != Course.Status.PUBLISHED:
            return error_response(message="Lesson not found", status_code=404)
        
        self.check_object_permissions(request, lesson.module.course)
        if user.user_role == "STUDENT" and not user.enrollments.filter(course=lesson.module.course, status="ACTIVE").exists() and not lesson.is_preview:
            return error_response(message="You have no active enrollment for this courses")
        
        serializer = LessonDetailSerializer(lesson)
        return success_response(message="Lesson detail", data=serializer.data)


class FilteredCoursesAPIView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        
        search = request.query_params.get('search')
        instructor = request.query_params.get('instructor')
        category = request.query_params.get('category')
        tag = request.query_params.get('tag')
        level = request.query_params.get('level')
        language = request.query_params.get('language')
        pricing_type = request.query_params.get('pricing_type')
        rating = request.query_params.get('rating')
        
        courses = Course.objects.filter(status=Course.Status.PUBLISHED)
        
        if search:
            courses = courses.filter(
                Q(title__icontains=search) |
                Q(subtitle__icontains=search |
                Q(what_included__icontains=search))
            )
        
        if instructor:
            courses = courses.filter(instructor=instructor)
        if category:
            courses = courses.filter(category=category)
        if tag:
            courses = courses.filter(tags__name__icontains=tag)
        if level:
            courses = courses.filter(level=level)
        if language:
            courses = courses.filter(language=language)
        if pricing_type:
            courses = courses.filter(pricing_type=pricing_type)
        if rating:
            try:
                rating_value = float(rating)
                courses = courses.filter(average_rating__gte=rating_value)
            except:
                return error_response(message="Rating must a number")
            courses = courses.filter(average_rating__gte=rating)
            
        courses = courses.distinct()
        
        serializer = CourseInfoSerializer(courses, many=True)
        
        return success_response(message="Filtered courses", data=serializer.data)
    
    
class FilteredCoursesInstructorAPIView(APIView):
    permission_classes = [IsInstructorAndOwner]
    def get(self, request):
        
        search = request.query_params.get('search')
        instructor = request.query_params.get('instructor')
        category = request.query_params.get('category')
        tag = request.query_params.get('tag')
        level = request.query_params.get('level')
        language = request.query_params.get('language')
        pricing_type = request.query_params.get('pricing_type')
        rating = request.query_params.get('rating')
        
        courses = Course.objects.filter(status=Course.Status.PUBLISHED, instructor=request.user)
        
        if search:
            courses = courses.filter(
                Q(title__icontains=search) |
                Q(subtitle__icontains=search |
                Q(what_included__icontains=search))
            )
        
        if instructor:
            courses = courses.filter(instructor=instructor)
        if category:
            courses = courses.filter(category=category)
        if tag:
            courses = courses.filter(tags__name__icontains=tag)
        if level:
            courses = courses.filter(level=level)
        if language:
            courses = courses.filter(language=language)
        if pricing_type:
            courses = courses.filter(pricing_type=pricing_type)
        if rating:
            try:
                rating_value = float(rating)
                courses = courses.filter(average_rating__gte=rating_value)
            except:
                return error_response(message="Rating must a number")
            courses = courses.filter(average_rating__gte=rating)
            
        courses = courses.distinct()
        
        serializer = CourseInfoSerializer(courses, many=True)
        
        return success_response(message="Filtered instructor courses", data=serializer.data)
    

class CreateQuizAPIView(APIView):
    permission_classes = [IsInstructorAndOwner]
    def post(self, request):
        serializer = QuizSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return success_response(message="Quiz created", data=serializer.data, status_code=201)

class UpDelQuizAPIView(APIView):
    permission_classes = [IsInstructorAndOwner]
    def patch(self, request, pk):
        quiz = Quiz.objects.filter(pk=pk).first()
        if not quiz:
            return error_response(message="Quiz not found", status_code=404)
        self.check_object_permissions(request, quiz.lesson.module.course)
        serializer = UpQuizSerializer(instance=quiz, data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return success_response(message="Quiz updated", data=serializer.data)
    
    def delete(self, request, pk):
        quiz = Quiz.objects.filter(pk=pk).first()
        if not quiz:
            return error_response(message="Quiz not found", status_code=404)
        self.check_object_permissions(request, quiz.lesson.module.course)
        quiz.delete()
        
        return success_response(message="Quiz deleted")

class CreateQuestionAPIView(APIView):
    permission_classes = [IsInstructorAndOwner]
    def post(self, request):
        serializer = QuestionSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return success_response(message="Question created", data=serializer.data, status_code=201)
    
class DeleteQuestionAPIView(APIView):
    permission_classes = [IsInstructorAndOwner]
    def delete(self, request, pk):
        question = Question.objects.filter(pk=pk).first()
        if not question:
            return error_response(message="Question not found", status_code=404)
        self.check_object_permissions(request, question.quiz.lesson.module.course)
        question.delete()
        
        return success_response(message="Question deleted")
    
class CreateOptionAPIView(APIView):
    permission_classes = [IsInstructorAndOwner]
    def post(self, request):
        serializer = OptionSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return success_response(message="Option created", data=serializer.data, status_code=201)          





     
  
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
    
