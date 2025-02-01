import base64
import os
import math
import re
import numpy as np
import collections
import pandas as pd
from io import BytesIO
from PIL import Image
from django.http import JsonResponse

# Define file paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
csv_path = os.path.join(BASE_DIR, 'Dataset.csv')
images_folder = os.path.join(BASE_DIR, 'images')

# Load and preprocess the dataset
dataset = pd.read_csv(csv_path)
dataset['Cleaned_Ingredients'] = dataset['Cleaned_Ingredients'].astype(str)

def tokenize(text):
    """Split text into tokens."""
    return re.findall(r'\b\w+\b', text.lower())

dataset['Tokenized_Ingredients'] = dataset['Cleaned_Ingredients'].apply(tokenize)

def calculate_tf(tokens):
    """Efficient Term Frequency using Counter."""
    total_tokens = len(tokens)
    token_counts = collections.Counter(tokens)
    return {token: count / total_tokens for token, count in token_counts.items()} if total_tokens > 0 else {}

def calculate_idf(all_tokens):
    """Efficient IDF Calculation - Single Pass."""
    total_docs = len(all_tokens)
    doc_count = collections.Counter(token for tokens in all_tokens for token in set(tokens))
    return {token: math.log(total_docs / (count + 1)) for token, count in doc_count.items()}  # Avoid division by zero

idf = calculate_idf(dataset['Tokenized_Ingredients'].tolist())
tf_idf_matrix = [{token: tf * idf[token] for token, tf in calculate_tf(tokens).items()} for tokens in dataset['Tokenized_Ingredients']]

vocabulary = sorted(set(token for tf_idf in tf_idf_matrix for token in tf_idf))
vocab_index = {token: i for i, token in enumerate(vocabulary)}

def vectorize(tf_idf):
    """Convert a TF-IDF dictionary to a fixed-length NumPy array."""
    vector = np.zeros(len(vocabulary), dtype=np.float32)
    for token, value in tf_idf.items():
        if token in vocab_index:
            vector[vocab_index[token]] = value
    return vector

tf_idf_vectors = np.array([vectorize(tf_idf) for tf_idf in tf_idf_matrix], dtype=np.float32)

def get_image_base64(image_name):
    """Convert image to base64-encoded string."""
    try:
        image_path = os.path.join(images_folder, f"{image_name}.jpg")
        image = Image.open(image_path)
        buffered = BytesIO()
        image.save(buffered, format="JPEG")
        return base64.b64encode(buffered.getvalue()).decode("utf-8")
    except Exception:
        return None

def pearson_correlation(vec1, vec2):
    """Compute Pearson correlation using NumPy (Vectorized)."""
    mean1, mean2 = np.mean(vec1), np.mean(vec2)
    num = np.sum((vec1 - mean1) * (vec2 - mean2))
    den = np.sqrt(np.sum((vec1 - mean1) ** 2) * np.sum((vec2 - mean2) ** 2))
    return float(num / den) if den != 0 else 0  # Convert to Python float

def recommend_recipes(request):
    user_input = request.GET.get('ingredients', '').strip()
    if not user_input:
        return JsonResponse({'error': 'No ingredients provided'}, status=400)

    user_tokens = tokenize(user_input)
    user_tf = calculate_tf(user_tokens)
    user_tf_idf = {token: user_tf.get(token, 0) * idf.get(token, 0) for token in user_tf}
    user_vector = vectorize(user_tf_idf)

    similarities = np.array([pearson_correlation(user_vector, recipe_vector) for recipe_vector in tf_idf_vectors])
    top_indices = similarities.argsort()[-5:][::-1]

    recommendations = [
        {
            'title': dataset.iloc[idx]['Title'],
            'ingredients': dataset.iloc[idx]['Ingredients'],
            'instructions': dataset.iloc[idx]['Instructions'],
            'similarity_score': float(similarities[idx]),  # Convert to Python float
            'image_base64': get_image_base64(dataset.iloc[idx]['Image_Name'])
        }
        for idx in top_indices
    ]

    return JsonResponse({'recommendations': recommendations})

def recommend_more_recipes(request):
    recipe_name = request.GET.get('recipe_name', '').strip()

    if not recipe_name:
        return JsonResponse({'error': 'No recipe name provided'}, status=400)

    recipe_row = dataset[dataset['Title'].str.lower() == recipe_name.lower()]
    if recipe_row.empty:
        return JsonResponse({'error': 'Recipe not found'}, status=404)

    clicked_recipe_index = recipe_row.index[0]
    clicked_recipe_vector = tf_idf_vectors[clicked_recipe_index]

    similarities = np.array([pearson_correlation(clicked_recipe_vector, recipe_vector) for recipe_vector in tf_idf_vectors])
    top_indices = similarities.argsort()[-6:][::-1]  # Get top 6 (including itself)

    # Exclude the clicked recipe from recommendations
    top_indices = [idx for idx in top_indices if idx != clicked_recipe_index][:5]

    recommendations = [
        {
            'title': dataset.iloc[idx]['Title'],
            'ingredients': dataset.iloc[idx]['Ingredients'],
            'instructions': dataset.iloc[idx]['Instructions'],
            'similarity_score': float(similarities[idx]),  # Convert to Python float
            'image_base64': get_image_base64(dataset.iloc[idx]['Image_Name'])
        }
        for idx in top_indices
    ]

    return JsonResponse({'recommendations': recommendations})