from rest_framework import serializers
from .models import Quiz, QuizOption, Question, QuizAttempt, QuestionResponse
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
        
        
class QuestionResponseWriteSerializer(serializers.ModelSerializer):
    selected_options = serializers.PrimaryKeyRelatedField(
        queryset=QuizOption.objects.all(), many=True, required=False
    )

    class Meta:
        model = QuestionResponse
        fields = ['question', 'text_answer', 'selected_options']

    def validate(self, attrs):
        question = attrs.get('question')
        q_type = question.question_type
        selected_options = attrs.get('selected_options', [])
        text_answer = attrs.get('text_answer')

        if q_type == Question.QuestionTypes.TEXT:
            if not text_answer:
                raise serializers.ValidationError({'text_answer': 'This field is required for text questions.'})
        else:
            if not selected_options:
                raise serializers.ValidationError({'selected_options': 'At least one option must be selected.'})
            if q_type == Question.QuestionTypes.RADIO and len(selected_options) > 1:
                raise serializers.ValidationError({'selected_options': 'Only one option allowed for radio questions.'})
            invalid = [o for o in selected_options if o.question_id != question.id]
            if invalid:
                raise serializers.ValidationError({'selected_options': 'Options must belong to the given question.'})

        return attrs


class QuizAttemptCreateSerializer(serializers.ModelSerializer):
    responses = QuestionResponseWriteSerializer(many=True)

    class Meta:
        model = QuizAttempt
        fields = ['id', 'quiz', 'responses']
        read_only_fields = ['id']

    def validate(self, attrs):
        quiz = attrs['quiz']
        responses = attrs['responses']

        quiz_question_ids = set(quiz.questions.values_list('id', flat=True))
        answered_ids = {r['question'].id for r in responses}

        # every question in the payload must belong to this quiz
        stray = answered_ids - quiz_question_ids
        if stray:
            raise serializers.ValidationError({'responses': f'Questions {stray} do not belong to this quiz.'})

        # optional: require every question be answered
        missing = quiz_question_ids - answered_ids
        if missing:
            raise serializers.ValidationError({'responses': f'Missing answers for questions {missing}.'})

        return attrs

    def create(self, validated_data):
        responses_data = validated_data.pop('responses')
        student = self.context['request'].user

        attempt = QuizAttempt.objects.create(student=student, **validated_data)

        response_objs = []
        for r in responses_data:
            selected = r.pop('selected_options', [])
            response = QuestionResponse.objects.create(attempt=attempt, **r)
            if selected:
                response.selected_options.set(selected)
            response_objs.append(response)

        return attempt
    
class QuestionResponseReadSerializer(serializers.ModelSerializer):
    selected_options = OptionMiniSerializer(many=True)

    class Meta:
        model = QuestionResponse
        fields = ['id', 'question', 'text_answer', 'selected_options']
        read_only_fields = fields


class QuizAttemptReadSerializer(serializers.ModelSerializer):
    responses = QuestionResponseReadSerializer(many=True)

    class Meta:
        model = QuizAttempt
        fields = ['id', 'quiz', 'student', 'score', 'submitted_at', 'responses']
        read_only_fields = fields
    
