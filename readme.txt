authentication/      # CustomUser, auth backends, JWT views
courses/              # Course, Module, Lesson, Category
enrollments/           # Enrollment, Progress tracking
payments/              # Orders, Subscriptions, Payouts
reviews/                # Ratings, Reviews, Q&A
certificates/           # Certificate generation/verification
notifications/          # Email/push notification logic
baseapp/                # BaseModel, shared utilities


class Module(BaseModel):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='modules')
    title = models.CharField(max_length=255)
    order = models.PositiveIntegerField(default=0)  # for drag-and-drop reordering

    class Meta:
        ordering = ['order']


class Lesson(BaseModel):
    class LessonType(models.TextChoices):
        VIDEO = 'VIDEO', 'Video'
        ARTICLE = 'ARTICLE', 'Article'
        QUIZ = 'QUIZ', 'Quiz'
        ASSIGNMENT = 'ASSIGNMENT', 'Assignment'

    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=255)
    lesson_type = models.CharField(max_length=20, choices=LessonType.choices, default=LessonType.VIDEO)
    video_url = models.URLField(blank=True, null=True)
    content = models.TextField(blank=True, null=True)  # for articles
    duration_minutes = models.PositiveIntegerField(default=0)
    order = models.PositiveIntegerField(default=0)
    is_preview = models.BooleanField(default=False)  # free preview lesson, visible before enrollment

    class Meta:
        ordering = ['order']