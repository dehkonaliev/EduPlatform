from django.db import models
from baseapp.models import BaseModel
from courses.models import Lesson
from authentication.models import CustomUser


class Quiz(BaseModel):
    title = models.CharField(max_length=1000)
    lesson = models.OneToOneField(Lesson, on_delete=models.CASCADE, related_name='quiz')
    
    def __str__(self):
        return self.title
    
class Question(BaseModel):
    class QuestionTypes(models.TextChoices):
        RADIO = 'RADIO', 'radio'
        CHECKBOX = 'CHECKBOX', 'checkbox'
        TEXT = 'TEXT', 'text'
        
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    question = models.CharField(max_length=2000)
    question_type = models.CharField(max_length=15, choices=QuestionTypes.choices)
    
class QuizOption(BaseModel):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='options')
    option = models.CharField(max_length=2000)
    is_correct = models.BooleanField(default=False)
    
    
class QuizAttempt(BaseModel):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='attempts')
    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='quiz_attempts')
    score = models.PositiveIntegerField(default=0)
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('quiz', 'student')  # remove if retakes are allowed


class QuestionResponse(BaseModel):
    attempt = models.ForeignKey(QuizAttempt, on_delete=models.CASCADE, related_name='responses')
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='responses')
    text_answer = models.CharField(max_length=2000, blank=True, null=True) 
    selected_options = models.ManyToManyField(QuizOption, related_name='responses', blank=True)  # for RADIO/CHECKBOX