from rest_framework import serializers
from .models import Quiz, QuizOption, Question
from baseapp.utils import field_error


      
class QuizSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = ['id', 'title', 'lesson']
        read_only_fields = ['id']
        
    def validate_title(self, title):
        if not title:
            return field_error("title", 'Title is required')
        title = title.strip()
        if len(title) > 1000:
            return field_error("title", "Title cannot exceed 1000 characters long")
        
        return title
    
    def validate_lesson(self, lesson):
        if not lesson:
            return field_error("lesson", "Lesson must be set")
        user = self.context.get('request').user
        if lesson.module.course.instructor != user:
            return field_error("lesson", "You cannot create a Quizee for this course")
        if lesson.lesson_type not in ['QUIZ', 'ASSIGNMENT']:
            return field_error("lesson","You cannot create a quiz for this type of lesson")
        if Quiz.objects.filter(lesson=lesson).exists():
            return field_error("lesson", "Quiz already exists for this lesson")
        
        return lesson

class UpQuizSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = ['id', 'title']
        read_only_fields = ['id']
        
    def validate_title(self, title):
        if not title:
            return field_error("title", 'Title is required')
        title = title.strip()
        
        if len(title) > 1000:
            return field_error("title", "Title cannot exceed 1000 characters long")
        
        return title
    
class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'quiz', 'question', 'question_type']
        read_only_fields = ['id']
        
    def validate_question(self, question):
        if not question:
            return field_error("question", 'Question is required')
        question = question.strip()
        if len(question) > 2000:
            return field_error("question", "Question cannot exceed 2000 characters long")
        
        return question
    
    def validate_quiz(self, quiz):
        if not quiz:
            return field_error("quiz", "Quiz must be set")
        user = self.context.get('request').user
        if quiz.lesson.module.course.instructor != user:
            return field_error("quiz", "You cannot create a question for this quiz")        
        
        return quiz
    
    def validate_question_type(self, question_type):
        if not question_type:
            return field_error("question_type", "Question type is required")
        if question_type not in Question.QuestionTypes.values:
            return field_error("question_type", "Invalid question type")
        
        return question_type
    
class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizOption
        fields = ['id','question', 'option', 'is_correct']
        read_only_fields = ['id']
        
    def validate_question(self, question):
        if not question:
            return field_error("question", 'Question is required')
        user = self.context.get('request').user
        if question.quiz.lesson.module.course.instructor != user:
            return field_error("question", "You have no permission to create an option for this question")
        if question.question_type == "TEXT" and QuizOption.objects.filter(question=question).exists():
            return field_error("question", "You cannot create a multiple options for this type question")
        
        return question
    
    def validate(self, attrs):
        is_correct = attrs.get('is_correct')
        question = attrs.get('question')
        if is_correct and question.question_type == "RADIO" and QuizOption.objects.filter(question=question, is_correct=True).exists():
            return field_error("is_correct","You cannot create two correct options for this type question")
        if question.question_type == "TEXT" and not is_correct:
            return field_error("is_correct", "This type question can only have a single and correct option")
        
        return attrs
    
    
# GET QUIZ
class OptionMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizOption
        fields = ['id', 'option']
        read_only_fields = fields

class QuestionWithOptionSerializer(serializers.ModelSerializer):
    options = OptionMiniSerializer(many=True)
    class Meta:
        model = Question
        fields = ['id', 'question', 'question_type', 'options']
        read_only_fields = fields


class GetQuizSerializer(serializers.ModelSerializer):
    questions = QuestionWithOptionSerializer(many=True)
    class Meta:
        model = Quiz
        fields = ['id', 'title', 'lesson', 'questions']
        read_only_fields = fields
    
