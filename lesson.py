from backend.courses.models import Lesson, Course, Module

# lesson = Lesson.objects.filter(pk=pk).first()   # query 1: gets the lesson row only
# lesson.module                                     # query 2: fires now, fetches that lesson's module
# lesson.module.course                              # query 3: fires now, fetches that module's course

# With it:

# python
lesson = Lesson.objects.select_related("module__course").filter(pk=pk).first()
# ONE query — JOINs lesson + its module + that module's course, all in one go
lesson.module         # already in memory, no query
lesson.module.course  # already in memory, no query


prefetched_courses = Course.objects.prefetch_related("modules")
selected_courses = Course.objects.select_related("modules")

print(prefetched_courses)
print(selected_courses)
