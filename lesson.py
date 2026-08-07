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

print(prefetched_courses)



prefetched_courses = Course.objects.prefetch_related("modules")
# selected_courses = Course.objects.select_related("modules")
prefetched_modules = Module.objects.prefetch_related("lessons")
print(prefetched_modules)
# print(selected_courses)
for module in prefetched_modules:
    print(module.lessons)
    
    
courses = Course.objects.prefetch_related(
    Prefetch(
        "modules",
        queryset=Module.objects.filter(is_active=True),
        to_attr="active_modules",
    )
)

# usage:
for course in courses:
    course.active_modules  # a plain list, NOT a queryset — already evaluated


# To fasten searchability ----------  INDEXING -------------
# class Meta:
#     indexes = [
#         models.Index(fields=["slug"]),
#         models.Index(fields=["status", "created_at"]),  # composite, for common filter+sort combos
#     ]
#     constraints = [
#         models.UniqueConstraint(fields=["course", "student"], name="unique_enrollment")
#     ]


# TO use raw DB queries
# # 1) .raw() — still returns model instances
# Course.objects.raw("SELECT * FROM course WHERE price > %s", [100])

# # 2) connection.cursor() — full raw SQL, no model mapping
# from django.db import connection
# with connection.cursor() as cursor:
#     cursor.execute("SELECT title, COUNT(*) FROM ... GROUP BY ...")
#     rows = cursor.fetchall()