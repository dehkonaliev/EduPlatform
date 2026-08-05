from rest_framework import serializers
from .models import Quiz, QuizOption, Question, QuizAttempt
from baseapp.utils import field_error
from decimal import Decimal
import uuid
      
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
        

class QuizAttemptSerializer(serializers.ModelSerializer):
    response = serializers.ListField(write_only=True)
    class Meta:
        model = QuizAttempt
        fields = ['response', 'score']
        read_only_fields = ['score']
        
    def validate_response(self, response):
        quiz = self.context.get('quiz')
        if len(response) != quiz.questions.count():
            return field_error("response", "Response contains more or less questions in it")
        if not isinstance(data, list):
            return field_error("response", "Response must be list")
        
        return response
        
        
        
    def save(self, **kwargs):
        response = self.validated_data.get('response')
        quiz = self.context.get('quiz')
        questions = Question.objects.filter(quiz=quiz)
        counter = 0
        for answer in response:
            try:
                question_id = uuid.UUID(str(answer['question_id']))
            except:
                return field_error("response", "Response contains invalid data 1")
            try:
                selected_options = answer['selected_options']
            except:
                return field_error("response", f"No selected options on {question}")
            question = questions.filter(pk=answer['question_id']).first()
            if not question:
                return field_error("reponse", "Response contains invalid data 1")
            if question.question_type == "RADIO":
                correct_option = question.options.filter(is_correct=True).first()
                if not correct_option:
                    return field_error("response", "No correct answers found 1") 
                print(selected_options[0], correct_option.pk, 'Check')  # ------###########
                if len(selected_options) > 0 and selected_options[0] == str(correct_option.pk):
                    print("correct", "RADIO") # ------#######
                    counter += 1
            elif question.question_type == "CHECKBOX":
                correct_options = question.options.filter(is_correct=True)
                if len(correct_options) < 1:    
                    return field_error("response", "No correct answers found")
                correct = set(str(pk) for pk in correct_options.values_list('pk', flat=True))
                selected = set(map(str, selected_options))
                if selected == correct:
                    print("correct", "CHECKBOX")
                    counter += 1
            elif question.question_type == "TEXT":
                correct_option = question.options.filter(is_correct=True).first()
                if not correct_option:
                    return field_error("response", "No correct answers found")
                if len(selected_options) > 0 and  correct_option.option == selected_options[0]:
                    print("correct", 'TEXT') # ------##########
                    counter += 1
        score = round(Decimal(counter) / Decimal(len(questions)) * 100, 2)
        attempt = QuizAttempt.objects.create(score=score, quiz=quiz, student=self.context.get('user'))
        return attempt
        
        
data = [
    {
        "question_id": "question_id",
        "selected_options": [
            "option_id",
            "option_id"
        ]
    },
    {
        "question": "question_id",
        "selected_options": [
            "option_id"
        ]
    },
    {
        "question": "question_id",
        "selected_options": [
            "Text info data"
        ]
    },
]