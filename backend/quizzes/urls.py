from django.urls import path
from .views import (CreateQuizAPIView, CreateQuestionAPIView, CreateOptionAPIView, UpDelQuizAPIView, DeleteQuestionAPIView,
    DeleteOptionAPIView, GetQuizAPIView, QuizDetailView, QuizAttemptDetailView, QuizAttemptCreateView, MyQuizAttemptListView, QuizAttemptListForInstructorView
)


urlpatterns = [
    #QUIZZES
    path('create-quiz', CreateQuizAPIView.as_view()),
    path('update-delete-quiz/<uuid:pk>', UpDelQuizAPIView.as_view()),
    path('get-quiz/<uuid:pk>', GetQuizAPIView.as_view()),
    
    #QUESTION
    path('create-question', CreateQuestionAPIView.as_view()),
    path('delete-question/<uuid:pk>', DeleteQuestionAPIView.as_view()),
    
    #OPTIONS
    path('create-option', CreateOptionAPIView.as_view()),
    path('delete-option/<uuid:pk>', DeleteOptionAPIView.as_view()),
    
    path('<uuid:pk>/', QuizDetailView.as_view(), name='quiz-detail'),
    path('attempts/', QuizAttemptCreateView.as_view(), name='quiz-attempt-create'),
    path('attempts/<uuid:pk>/', QuizAttemptDetailView.as_view(), name='quiz-attempt-detail'),
    path('attempts/mine/', MyQuizAttemptListView.as_view(), name='my-quiz-attempts'),
    path('<uuid:quiz_id>/attempts/', QuizAttemptListForInstructorView.as_view(), name='quiz-attempts-instructor'),
]