import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import styles from "./Recipe.module.css";

function Recipe() {
    const location = useLocation();
    const { recipes, selectedIngredients } = location.state || {};

    const [expandedSections, setExpandedSections] = useState({});
    const [moreRecipes, setMoreRecipes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const toggleSection = (index, sectionType) => {
        setExpandedSections((prev) => ({
            ...prev,
            [index]: {
                ...prev[index],
                [sectionType]: !prev[index]?.[sectionType],
            },
        }));
    };

    const fetchMoreRecommendations = async (recipeTitle) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `http://127.0.0.1:8000/api/recommend-more-recipes/?recipe_name=${encodeURIComponent(recipeTitle)}`
            );
            const data = await response.json();

            if (response.ok) {
                setMoreRecipes(data.recommendations);
            } else {
                setError(data.error || "Failed to load more recommendations.");
            }
        } catch (err) {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Recommended Recipes</h1>

            <div className={styles.recipeGrid}>
                {recipes &&
                    recipes.map((recipe, index) => (
                        <div key={index} className={styles.recipeCard}>
                            <h2 className={styles.recipeTitle}>{recipe.title}</h2>

                            {recipe.similarity_score && (
                                <p className={styles.similarityScore}>
                                    Similarity: {(recipe.similarity_score * 100).toFixed(2)}%
                                </p>
                            )}

                            {recipe.image_base64 && (
                                <img
                                    src={`data:image/jpeg;base64,${recipe.image_base64}`}
                                    alt={recipe.title}
                                    className={styles.recipeImage}
                                />
                            )}

                            <div className={styles.recipeContent}>
                                <div className={styles.ingredientsSection}>
                                    <h3>Ingredients</h3>
                                    <div
                                        className={
                                            expandedSections[index]?.ingredients
                                                ? styles.expandedText
                                                : styles.clampedText
                                        }
                                    >
                                        {Array.isArray(recipe.ingredients)
                                            ? recipe.ingredients.join(", ")
                                            : recipe.ingredients}
                                    </div>
                                    {recipe.ingredients && recipe.ingredients.length > 2 && (
                                        <button
                                            onClick={() => toggleSection(index, "ingredients")}
                                            className={styles.readMoreButton}
                                        >
                                            {expandedSections[index]?.ingredients ? "Read Less" : "Read More"}
                                        </button>
                                    )}
                                </div>

                                <div className={styles.instructionsSection}>
                                    <h3>Instructions</h3>
                                    <div
                                        className={
                                            expandedSections[index]?.instructions
                                                ? styles.expandedText
                                                : styles.clampedText
                                        }
                                    >
                                        {recipe.instructions}
                                    </div>
                                    {recipe.instructions.length > 2 && (
                                        <button
                                            onClick={() => toggleSection(index, "instructions")}
                                            className={styles.readMoreButton}
                                        >
                                            {expandedSections[index]?.instructions ? "Read Less" : "Read More"}
                                        </button>
                                    )}
                                </div>
                            </div>

                            <button
                                className={styles.moreRecommendationsButton}
                                onClick={() => fetchMoreRecommendations(recipe.title)}
                            >
                                More Recommendations Like This
                            </button>
                        </div>
                    ))}
            </div>

            {moreRecipes.length > 0 && (
                <div className={styles.moreRecommendationsContainer}>
                    <h2 className={styles.moreRecommendationsTitle}>More Recommendations</h2>
                </div>
            )}

            <div className={styles.recipeGrid}>
                {moreRecipes.length > 0 &&
                    moreRecipes.map((recipe, index) => (
                        <div key={`more-${index}`} className={styles.recipeCard}>
                            <h2 className={styles.recipeTitle}>{recipe.title}</h2>

                            {recipe.similarity_score && (
                                <p className={styles.similarityScore}>
                                    Similarity: {(recipe.similarity_score * 100).toFixed(2)}%
                                </p>
                            )}

                            {recipe.image_base64 && (
                                <img
                                    src={`data:image/jpeg;base64,${recipe.image_base64}`}
                                    alt={recipe.title}
                                    className={styles.recipeImage}
                                />
                            )}

                            <div className={styles.recipeContent}>
                                <div className={styles.ingredientsSection}>
                                    <h3>Ingredients</h3>
                                    <div
                                        className={
                                            expandedSections[`more-${index}`]?.ingredients
                                                ? styles.expandedText
                                                : styles.clampedText
                                        }
                                    >
                                        {Array.isArray(recipe.ingredients)
                                            ? recipe.ingredients.join(", ")
                                            : recipe.ingredients}
                                    </div>
                                    {recipe.ingredients && recipe.ingredients.length > 2 && (
                                        <button
                                            onClick={() => toggleSection(`more-${index}`, "ingredients")}
                                            className={styles.readMoreButton}
                                        >
                                            {expandedSections[`more-${index}`]?.ingredients ? "Read Less" : "Read More"}
                                        </button>
                                    )}
                                </div>

                                <div className={styles.instructionsSection}>
                                    <h3>Instructions</h3>
                                    <div
                                        className={
                                            expandedSections[`more-${index}`]?.instructions
                                                ? styles.expandedText
                                                : styles.clampedText
                                        }
                                    >
                                        {recipe.instructions}
                                    </div>
                                    {recipe.instructions.length > 2 && (
                                        <button
                                            onClick={() => toggleSection(`more-${index}`, "instructions")}
                                            className={styles.readMoreButton}
                                        >
                                            {expandedSections[`more-${index}`]?.instructions ? "Read Less" : "Read More"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
            </div>

        </div>
    );
}

export default Recipe;
