from django.db import models
from baseapp.models import BaseModel
from django.utils.text import slugify

class Category(BaseModel):
    name = models.CharField(max_length=100, unique=True)
    slug = models.CharField(unique=True, blank=True)
    icon = models.CharField(max_length=20, blank=True, null=True)
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while Category.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)
    
