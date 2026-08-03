from django.shortcuts import render, get_object_or_404
from rest_framework.views import APIView
from .serializers import (QuizSerializer, UpQuizSerializer,
    QuestionSerializer, GetQuizSerializer,
    QuizAttemptCreateSerializer, QuizAttemptReadSerializer,
    GetQuizSerializer, OptionSerializer
)
from rest_framework.exceptions import ValidationError
from rest_framework import generics, status
from baseapp.permissions import IsInstructorAndOwner, IsAdminOrOwnerOrReadOnlyPublished, IsInstructorOrAdmin
from baseapp.utils import success_response, error_response
from .models import QuizOption, Question, Quiz, QuizAttempt, QuestionResponse
from rest_framework.permissions import IsAuthenticated


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
    
class DeleteOptionAPIView(APIView):
    permission_classes = [IsInstructorAndOwner]
    def delete(self, request, pk):
        option = QuizOption.objects.filter(pk=pk).first()
        if not option:
            return error_response(message="Option not found", status_code=404)
        self.check_object_permissions(request, option.question.quiz.lesson.module.course)
        option.delete()
        
        return success_response(message="Option deleted")         

class GetQuizAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrOwnerOrReadOnlyPublished]
    def get(self, request, pk):
        quiz = Quiz.objects.filter(pk=pk).first()
        if not quiz:
            return error_response(message="Quiz not found", status_code=404)
        self.check_object_permissions(request, quiz.lesson.module.course)
        if request.user.user_role == "STUDENT" and not request.user.enrollments.filter(status="ACTIVE", course=quiz.lesson.module.course).exists():
            return error_response(message="You have no permission for this quiz")
        
        serializer = GetQuizSerializer(quiz)
        return success_response(message="Quiz detail", data=serializer.data)


class QuizDetailView(generics.RetrieveAPIView):
    """
    Student-facing: fetch quiz questions/options to attempt.
    Should NOT expose is_correct - use a separate serializer for this
    if OptionMiniSerializer currently includes is_correct.
    """
    queryset = Quiz.objects.prefetch_related('questions__options')
    serializer_class = GetQuizSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'pk'  # or 'lesson__slug' depending on your URL convention

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return success_response(data=serializer.data)


class QuizAttemptCreateView(generics.CreateAPIView):
    """
    Student submits answers for a quiz.
    """
    serializer_class = QuizAttemptCreateSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        attempt = serializer.save()

        read_serializer = QuizAttemptReadSerializer(attempt)
        return success_response(
            data=read_serializer.data,
            message="Quiz submitted successfully.",
            status_code=status.HTTP_201_CREATED,
        )

    def handle_exception(self, exc):
        if isinstance(exc, ValidationError):
            return error_response(errors=exc.detail, status_code=status.HTTP_400_BAD_REQUEST)
        return super().handle_exception(exc)


class QuizAttemptDetailView(generics.RetrieveAPIView):
    """
    View a single attempt's results (own attempt, or instructor viewing student's).
    """
    queryset = QuizAttempt.objects.select_related('quiz', 'student').prefetch_related(
        'responses__selected_options'
    )
    serializer_class = QuizAttemptReadSerializer
    permission_classes = [IsAuthenticated, IsInstructorAndOwner]
    lookup_field = 'pk'

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return success_response(data=serializer.data)


class MyQuizAttemptListView(generics.ListAPIView):
    """
    Student's own attempt history, optionally filtered by quiz.
    """
    serializer_class = QuizAttemptReadSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = QuizAttempt.objects.filter(student=self.request.user).select_related(
            'quiz'
        ).prefetch_related('responses__selected_options')
        quiz_id = self.request.query_params.get('quiz')
        if quiz_id:
            qs = qs.filter(quiz_id=quiz_id)
        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return success_response(data=serializer.data)


class QuizAttemptListForInstructorView(generics.ListAPIView):
    """
    Instructor: view all attempts on a specific quiz (e.g. for grading TEXT answers).
    """
    serializer_class = QuizAttemptReadSerializer
    permission_classes = [IsAuthenticated, IsInstructorAndOwner]

    def get_queryset(self):
        quiz_id = self.kwargs['quiz_id']
        quiz = get_object_or_404(Quiz, pk=quiz_id)
        self.check_object_permissions(self.request, quiz)  # confirm instructor owns the quiz/course
        return QuizAttempt.objects.filter(quiz=quiz).select_related('student').prefetch_related(
            'responses__selected_options'
        )

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return success_response(data=serializer.data)
            


