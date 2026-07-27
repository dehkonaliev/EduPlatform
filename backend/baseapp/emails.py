from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags

def send_verification_code(user_email, code):
    subject = "Your verification code!"
    
    html_content = render_to_string('emails/verification_code.html', {'code': code})
    
    text_content = strip_tags(html_content) 

    msg = EmailMultiAlternatives(subject, text_content, None, [user_email])
    
    msg.attach_alternative(html_content, "text/html")
    msg.send()