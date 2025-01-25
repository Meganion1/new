import base64
import os
from io import BytesIO
from PIL import Image
import pandas as pd
from django.http import JsonResponse
import math
import re

# Define file paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
csv_path = os.path.join(BASE_DIR, 'Dataset.csv')
images_folder = os.path.join(BASE_DIR, 'images')  

# Load and preprocess the dataset
dataset = pd.read_csv(csv_path)
dataset['Cleaned_Ingredients'] = dataset['Cleaned_Ingredients'].astype(str)

# Tokenization function
def tokenize(text):
    """Split text into tokens."""
    tokens = re.findall(r'\b\w+\b', text.lower())  # Extract words ignoring case
    return tokens

# Preprocess dataset by tokenizing ingredients
dataset['Tokenized_Ingredients'] = dataset['Cleaned_Ingredients'].apply(tokenize)

# TF-IDF calculation functions
def calculate_tf(tokens):
    """Calculate term frequency for a list of tokens."""
    tf = {}
    total_tokens = len(tokens)
    for token in tokens:
        tf[token] = tf.get(token, 0) + 1
    for token in tf:
        tf[token] /= total_tokens
    return tf

def calculate_idf(all_tokens):
    """Calculate inverse document frequency for all terms."""
    idf = {}
    total_docs = len(all_tokens)
    for tokens in all_tokens:
        unique_tokens = set(tokens)
        for token in unique_tokens:
            idf[token] = idf.get(token, 0) + 1
    for token in idf:
        idf[token] = math.log(total_docs / (1 + idf[token]))  # Add 1 to avoid division by zero
    return idf

def calculate_tf_idf(tokenized_documents):
    """Calculate the TF-IDF matrix for tokenized documents."""
    tf_idf_matrix = []
    idf = calculate_idf(tokenized_documents)
    for tokens in tokenized_documents:
        tf = calculate_tf(tokens)
        tf_idf = {token: tf[token] * idf[token] for token in tf}
        tf_idf_matrix.append(tf_idf)
    return tf_idf_matrix, idf

def vectorize(tf_idf, idf, vocabulary):
    """Convert a TF-IDF dictionary to a vector."""
    vector = [tf_idf.get(token, 0) for token in vocabulary]
    return vector

def get_image_base64(image_path):
    """Convert image to base64-encoded string."""
    try:
        image = Image.open(image_path)
        buffered = BytesIO()
        image.save(buffered, format="JPEG")
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
        return img_str
    except Exception:
        return None

def pearson_correlation(vec1, vec2):
    """Calculate Pearson's correlation coefficient."""
    n = len(vec1)
    sum1 = sum(vec1)
    sum2 = sum(vec2)
    sum1_sq = sum(v ** 2 for v in vec1)
    sum2_sq = sum(v ** 2 for v in vec2)
    p_sum = sum(v1 * v2 for v1, v2 in zip(vec1, vec2))
    num = p_sum - (sum1 * sum2 / n)
    den = ((sum1_sq - sum1**2 / n) * (sum2_sq - sum2**2 / n))**0.5
    return num / den if den != 0 else 0

# Calculate the TF-IDF matrix for the dataset
tokenized_documents = dataset['Tokenized_Ingredients'].tolist()
tf_idf_matrix, idf = calculate_tf_idf(tokenized_documents)

# Create a vocabulary from all tokenized documents
vocabulary = set(token for tf_idf in tf_idf_matrix for token in tf_idf)

# Convert dataset TF-IDF to vectors
tf_idf_vectors = [vectorize(tf_idf, idf, vocabulary) for tf_idf in tf_idf_matrix]

# Updated function to recommend recipes
def recommend_recipes(request):
    user_input = request.GET.get('ingredients', '')    
    if not user_input:
        return JsonResponse({'error': 'No ingredients provided'}, status=400)

    # Tokenize and clean user input
    user_tokens = tokenize(user_input)
    user_tf = calculate_tf(user_tokens)
    user_tf_idf = {token: user_tf.get(token, 0) * idf.get(token, 0) for token in user_tf}
    user_vector = vectorize(user_tf_idf, idf, vocabulary)

    # Calculate Pearson correlation between user input and the dataset
    similarities = [
        pearson_correlation(user_vector, recipe_vector) for recipe_vector in tf_idf_vectors
    ]
    top_indices = sorted(range(len(similarities)), key=lambda i: similarities[i], reverse=True)[:5]

    # Preparing the recommendations
    recommendations = []
    for idx in top_indices:
        recipe = dataset.iloc[idx]
        image_path = os.path.join(images_folder, f"{recipe['Image_Name']}.jpg") 
        image_base64 = get_image_base64(image_path)
        recommendations.append({
            'title': recipe['Title'],
            'ingredients': recipe['Ingredients'],
            'instructions': recipe['Instructions'],
            'similarity_score': similarities[idx],
            'image_base64': image_base64
        })

    return JsonResponse({'recommendations': recommendations})
