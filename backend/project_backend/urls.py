from django.urls import path
from .views import recommend_recipes, recommend_more_recipes  # Import the function

urlpatterns = [
    path('api/recommend-recipes/', recommend_recipes, name='recommend_recipes'),
    path('api/recommend-more-recipes/', recommend_more_recipes, name='recommend_more_recipes'),  # ADD THIS
]