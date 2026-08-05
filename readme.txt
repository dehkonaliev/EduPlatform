Curiosite
=========

Curiosite is a self-learning education platform designed for students and instructors. The main idea of the platform is to create a modern learning marketplace where instructors can create and publish courses, sell access to their lessons, and build a reputation, while students can discover courses, enroll, learn, and progress through structured lessons.

The platform is being developed as a Django REST API backend with a clear separation between authentication, user profiles, course management, enrollments, payments, and quizzes. It is aimed at self-studiers who want a simple but powerful learning experience with both educational and community-oriented features.

Project Purpose
---------------

Curiosite is meant to be a course platform for self-learners where:
- instructors can upload and manage courses,
- students can buy or access courses and study at their own pace,
- learning content is organized into modules and lessons,
- students can track their progress,
- payment and subscription systems support access to paid content,
- quizzes can be attached to lessons and used for learning assessment.

Completed Parts
---------------

The following parts are already implemented in the current backend:

1. User Authentication and Account Management
   - Sign up with email or phone number
   - Email and phone verification flow
   - Account activation
   - Login and logout
   - Password change
   - Password reset request and confirmation
   - JWT token refresh
   - User profile lookup by ID
   - Account deletion flow with verification

2. User Roles and Profiles
   - Student and instructor role support
   - Student profile management
   - Instructor profile management
   - Profile update support for basic account information

3. Course Platform Core
   - Course creation by instructors
   - Course update and deletion
   - Course detail view
   - Category and tag management
   - Module creation, update, and deletion
   - Lesson creation, update, and deletion
   - Lesson detail view
   - Course filtering by search, instructor, category, tag, level, language, pricing type, and rating
   - Personalized feed for recommended courses
   - Course publishing workflow with draft, review, published, and archived states

4. Enrollment and Learning Progress
   - Student enrollment into courses
   - Enrollment drop support
   - Student course list view
   - Lesson progress tracking
   - Last lesson tracking
   - Premium access checks for lesson content
   - Progress completion handling for lessons

5. Payments and Subscriptions
   - Wallet support for students
   - Wallet replenishment
   - Subscription plans
   - Course purchase flow
   - Subscription-based access control for enrollments

6. Quiz System
   - Quiz creation for lessons
   - Question creation
   - Multiple choice option creation
   - Quiz retrieval
   - Quiz attempt submission and scoring

7. Gamification Foundation
   - XP is awarded when a lesson is completed
   - Student profile includes XP, streak, and level fields
   - The backend is already prepared for gamified learning behavior

Incomplete or Planned Parts
--------------------------

Some features are still incomplete or planned for future development. These are important for the full vision of MyUstoz, but they are not fully implemented yet:

- Notifications system
  - Notifications for course updates, achievements, enrollments, and account events
  - Friend request notifications are expected to be part of this system

- Social features
  - Friend requests
  - User-to-user connection system
  - Social profile interaction

- Gamification expansion
  - Full leaderboard system
  - Streak-based rewards and history
  - Advanced XP progression and achievement logic

- Learning feedback and community features
  - Course reviews and ratings
  - Instructor feedback and student testimonials
  - Community discussion threads

- Account visibility and privacy
  - Users will be able to control whether their profile is visible to others
  - Public or private account mode based on visibility settings

These incomplete parts are mentioned here because they are part of the long-term product roadmap and will be added soon.

Current Backend API List
------------------------

The following APIs are currently available in the backend. They are numbered for easy reuse as prompts or documentation.

1. Authentication APIs
   1.1 POST /api/auth/signup
   - Parameters: email_or_phone (required)
   - Purpose: starts signup or verification flow
   - Common errors: invalid email/phone format, user not found in some cases

   1.2 POST /api/auth/verification-code
   - Parameters: verification_code (required), email_or_phone (required for lookup)
   - Purpose: verifies the OTP/verification code and returns a token
   - Common errors: invalid code, user not found, expired code

   1.3 POST /api/auth/activation
   - Parameters: email_or_phone, token, first_name, last_name, username, user_role, password, conf_password
   - Purpose: completes account activation and creates profile data
   - Common errors: invalid token, password mismatch, weak password, already activated account

   1.4 POST /api/auth/login
   - Parameters: email_username_phone, password
   - Purpose: authenticates the user and returns JWT access/refresh tokens
   - Common errors: invalid credentials, account not verified, weak/incorrect password format

   1.5 POST /api/auth/logout
   - Parameters: refresh (required)
   - Purpose: logs out the user by blacklisting the refresh token
   - Common errors: invalid or expired token

   1.6 PATCH /api/auth/update-profile
   - Parameters: first_name, last_name, username, photo
   - Purpose: updates profile basics
   - Common errors: invalid name format, username already invalid, image too large or unsupported type

   1.7 GET /api/auth/profile-info/<slug:pk>
   - Parameters: pk in URL path
   - Purpose: fetches public profile information for a user
   - Common errors: user not found

   1.8 POST /api/auth/password-change
   - Parameters: old_password, new_password, conf_password
   - Purpose: changes the current password
   - Common errors: old password incorrect, new password mismatch, same old/new password

   1.9 GET /api/auth/delete-account
   - Parameters: verify_type in request body
   - Purpose: starts account deletion verification flow
   - Common errors: invalid verify type, email/phone not verified

   1.10 POST /api/auth/delete-account
   - Parameters: verification_code
   - Purpose: confirms account deletion
   - Common errors: invalid code, expired code

   1.11 GET /api/auth/veirfy-email
   - Parameters: email in request body
   - Purpose: starts email verification update flow
   - Common errors: invalid email format, duplicate email

   1.12 POST /api/auth/veirfy-email
   - Parameters: code
   - Purpose: confirms email verification
   - Common errors: invalid code, expired code

   1.13 GET /api/auth/veirfy-phone
   - Parameters: phone_number in request body
   - Purpose: starts phone verification update flow
   - Common errors: invalid phone format, duplicate phone number

   1.14 POST /api/auth/veirfy-phone
   - Parameters: code
   - Purpose: confirms phone verification
   - Common errors: invalid code, expired code

   1.15 POST /api/auth/password-reset-request
   - Parameters: email_or_phone
   - Purpose: requests password reset verification
   - Common errors: user not found, email/phone not verified

   1.16 POST /api/auth/password-reset-confirm
   - Parameters: token, new_password, conf_password
   - Purpose: confirms password reset
   - Common errors: invalid token, expired token, password mismatch

   1.17 POST /api/auth/token-refresh
   - Parameters: refresh token in body
   - Purpose: refreshes JWT access token
   - Common errors: invalid or expired refresh token

2. Profile APIs
   2.1 GET /api/profile/student-profile
   - Parameters: none
   - Purpose: returns the authenticated student profile
   - Common errors: profile not found

   2.2 PATCH /api/profile/student-profile
   - Parameters: gender, bio
   - Purpose: updates student profile information
   - Common errors: invalid gender, bio too long

   2.3 GET /api/profile/instructor-profile
   - Parameters: none
   - Purpose: returns the authenticated instructor profile
   - Common errors: profile not found

   2.4 PATCH /api/profile/instructor-profile
   - Parameters: headline, bio, linkedin_url, website_url
   - Purpose: updates instructor profile information
   - Common errors: invalid URL, headline/bio length issues, missing both links

3. Course APIs
   3.1 POST /api/courses/categories
   - Parameters: name, icon
   - Purpose: creates a course category
   - Common errors: name too short/long, invalid icon length

   3.2 GET /api/courses/categories
   - Parameters: none
   - Purpose: lists all categories
   - Common errors: none

   3.3 POST /api/courses/tags
   - Parameters: name
   - Purpose: creates a course tag
   - Common errors: name too short/long

   3.4 GET /api/courses/tags
   - Parameters: none
   - Purpose: lists all tags
   - Common errors: none

   3.5 POST /api/courses/course-create
   - Parameters: title, subtitle, description, category, tags, level, language, thumbnail, intro_video, pricing_type, price, requirements, what_included
   - Purpose: creates a new course by an instructor
   - Common errors: title/description too short, invalid language, invalid video link, price required for paid course, too many tags

   3.6 PATCH /api/courses/course-update-delete/<uuid:pk>
   - Parameters: pk in URL path plus any updatable course fields
   - Purpose: updates an existing course
   - Common errors: course not found, unauthorized access, invalid price or thumbnail

   3.7 DELETE /api/courses/course-update-delete/<uuid:pk>
   - Parameters: pk in URL path
   - Purpose: deletes a course
   - Common errors: course not found, unauthorized access

   3.8 GET /api/courses/course-detail/<uuid:pk>
   - Parameters: pk in URL path
   - Purpose: returns a course detail page
   - Common errors: course not found, unpublished course inaccessible to guests

   3.9 GET /api/courses/my-feed
   - Parameters: none
   - Purpose: returns personalized course recommendations
   - Common errors: none

   3.10 GET /api/courses/filtered-courses
   - Parameters: search, instructor, category, tag, level, language, pricing_type, rating (query params)
   - Purpose: filters published courses for public discovery
   - Common errors: rating must be numeric

   3.11 GET /api/courses/instructor-courses
   - Parameters: same as filtered-courses
   - Purpose: lists courses owned by the current instructor
   - Common errors: unauthorized if not instructor

   3.12 POST /api/courses/module-create
   - Parameters: course, title, order
   - Purpose: creates a course module
   - Common errors: invalid course access, empty title, order must be greater than 0

   3.13 PATCH /api/courses/module-update-delete/<uuid:pk>
   - Parameters: pk in URL path plus title/order fields
   - Purpose: updates a module
   - Common errors: module not found, unauthorized access

   3.14 DELETE /api/courses/module-update-delete/<uuid:pk>
   - Parameters: pk in URL path
   - Purpose: deletes a module
   - Common errors: module not found, unauthorized access

   3.15 GET /api/courses/module-detail/<uuid:pk>
   - Parameters: pk in URL path
   - Purpose: returns module details and its lessons
   - Common errors: module not found, unpublished course inaccessible to guests

   3.16 POST /api/courses/lesson-create
   - Parameters: module, title, lesson_type, video_url, content, duration_minutes, order, is_preview
   - Purpose: creates a lesson under a module
   - Common errors: invalid lesson type, missing video/content, invalid module access

   3.17 PATCH /api/courses/lesson-update-delete/<uuid:pk>
   - Parameters: pk in URL path plus updatable lesson fields
   - Purpose: updates a lesson
   - Common errors: lesson not found, unauthorized access

   3.18 DELETE /api/courses/lesson-update-delete/<uuid:pk>
   - Parameters: pk in URL path
   - Purpose: deletes a lesson
   - Common errors: lesson not found, unauthorized access

   3.19 GET /api/courses/lesson-detail/<uuid:pk>
   - Parameters: pk in URL path
   - Purpose: returns lesson content details
   - Common errors: lesson not found, no active enrollment for paid lessons unless preview

4. Enrollment and Learning APIs
   4.1 POST /api/enrollments/enrollment-create
   - Parameters: course
   - Purpose: enrolls a student into a published course
   - Common errors: course not found or not published, already enrolled, no valid subscription

   4.2 PATCH /api/enrollments/enrollment-drop/<uuid:pk>
   - Parameters: pk in URL path
   - Purpose: drops an existing enrollment
   - Common errors: enrollment not found, already dropped/completed

   4.3 GET /api/enrollments/my-enrollments
   - Parameters: none
   - Purpose: lists the student’s active/completed enrollments
   - Common errors: none

   4.4 POST /api/enrollments/lesson-progress/<uuid:pk>
   - Parameters: pk in URL path
   - Purpose: marks a lesson progress record as completed and unlocks the next lesson
   - Common errors: lesson progress record not found, previous lesson incomplete, enrollment inactive

   4.5 GET /api/enrollments/last-lesson
   - Parameters: none
   - Purpose: returns the last lesson the student interacted with
   - Common errors: none

5. Payment and Subscription APIs
   5.1 PATCH /api/payments/replenish-wallet
   - Parameters: amount, wallet_id
   - Purpose: adds balance to a student wallet
   - Common errors: invalid wallet id, amount less than or equal to zero

   5.2 GET /api/payments/plans
   - Parameters: none
   - Purpose: returns available subscription plans
   - Common errors: none

   5.3 POST /api/payments/subscribe
   - Parameters: subscription_plan
   - Purpose: purchases a subscription plan using wallet balance
   - Common errors: account not active, invalid plan, insufficient balance

   5.4 POST /api/payments/buy-course
   - Parameters: course
   - Purpose: buys a course using wallet balance
   - Common errors: account not active, course not published/free, insufficient funds, already bought

6. Quiz APIs
   6.1 POST /api/quizzes/create-quiz
   - Parameters: title, lesson
   - Purpose: creates a quiz for a lesson
   - Common errors: title empty, invalid lesson, unauthorized instructor access

   6.2 PATCH /api/quizzes/update-delete-quiz/<uuid:pk>
   - Parameters: pk in URL path, title
   - Purpose: updates a quiz title
   - Common errors: quiz not found, unauthorized access

   6.3 DELETE /api/quizzes/update-delete-quiz/<uuid:pk>
   - Parameters: pk in URL path
   - Purpose: deletes a quiz
   - Common errors: quiz not found, unauthorized access

   6.4 GET /api/quizzes/get-quiz/<uuid:pk>
   - Parameters: pk in URL path
   - Purpose: returns quiz details for an enrolled student or owner
   - Common errors: quiz not found, no permission for this quiz

   6.5 POST /api/quizzes/create-question
   - Parameters: quiz, question, question_type
   - Purpose: adds a question to a quiz
   - Common errors: invalid question type, unauthorized instructor access

   6.6 DELETE /api/quizzes/delete-question/<uuid:pk>
   - Parameters: pk in URL path
   - Purpose: deletes a question
   - Common errors: question not found, unauthorized access

   6.7 POST /api/quizzes/create-option
   - Parameters: question, option, is_correct
   - Purpose: adds an answer option to a question
   - Common errors: invalid question access, invalid option logic for radio/text questions

   6.8 DELETE /api/quizzes/delete-option/<uuid:pk>
   - Parameters: pk in URL path
   - Purpose: deletes an option
   - Common errors: option not found, unauthorized access

   6.9 POST /api/quizzes/quiz-attempt/<uuid:pk>
   - Parameters: question_responses[] where each response contains question, text_answer, selected_options
   - Purpose: submits a quiz attempt and calculates score
   - Common errors: missing answers, invalid questions, invalid options, invalid response structure

Short Summary
-------------

Curiosite is a growing self-learning course platform where instructors can publish and sell courses, students can buy and study them, and the system supports learning progress, payments, subscriptions, and quizzes. The platform already has a strong foundation for course-based education, while social, notification, visibility, review, and leaderboard features are planned for future implementation.
