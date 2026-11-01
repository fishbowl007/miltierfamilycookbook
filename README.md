# Miltier Family Recipes

A clean, modern, **black-and-white-only** family cookbook. Built with vanilla HTML, CSS, and JavaScript for hosting on GitHub Pages, with no build step or paid services.

## Features

- Responsive monochrome design for desktop, tablet, and phone.
- Search by recipe name, ingredient, contributor, story, or tag.
- Category filtering: Mains, Sides, Appetizers, Breakfast, Desserts, Holiday.
- Saved favorites stored in this browser.
- Adjustable recipe servings that automatically multiply numeric ingredient quantities.
- Printable recipe details.
- Recipe entry form that creates **local drafts** and exports a replacement \`recipes.js\` file.
- Accessibility features: semantic landmarks, visible keyboard focus, keyboard search shortcut, dialog controls.

## How to view it

This is a static site. Open \`index.html\` in a browser, or publish it with GitHub Pages.

On GitHub: **Settings → Pages → Build and deployment → Deploy from a branch**, then choose \`main\`, root \`/\`, and **Save**. Do this **after the pull request is reviewed and merged**.

Once Pages is enabled, the expected URL is:
https://fishbowl007.github.io/miltierfamilycookbook/

## Where the recipes live

Family recipes belong in \`recipes.js\`, which currently contains an empty array because the original Google-hosted recipe data has not been provided. The app intentionally does not invent or publish sample family recipes.

Expected shape:

\`\`\`js
window.RECIPES = [
  {
    id: "family-recipe",
    title: "Family Recipe",
    category: "Mains",
    createdBy: "Contributor",
    servings: 4,
    time: "45 minutes",
    story: "",
    tags: ["family"],
    ingredients: [{ q: 1, u: "cup", i: "ingredient" }],
    steps: ["Prepare the ingredients.", "Cook until done."],
    swaps: [],
    extras: [],
    pairs: [],
    pairIdeas: []
  }
];
\`\`\`

Use a decimal number for fractions, such as \`0.5\`. Use \`q: null\` for "to taste." Ingredient amounts are kept out of the directions so that serving-size changes are meaningful.

To migrate existing recipes from the Google-hosted version, provide/export the original recipe dataset and replace the empty array in \`recipes.js\` with it. Do **not** replace existing family recipes with placeholders.

## Adding recipes

1. Click **ADD RECIPE** and enter the recipe exactly as written.
2. Ingredient lines use \`quantity | unit | ingredient\`. Example: \`0.5 | cup | milk\`, \`2 | | eggs\`, or \` | | salt to taste\`.
3. Click **SAVE ON THIS DEVICE** to store a local draft.
4. Click **DOWNLOAD RECIPES.JS** to export all current loaded recipes and drafts.
5. Commit the downloaded file as \`recipes.js\` to GitHub, then refresh your website after deployment.

**Important:** Saving a recipe in the browser does not publish it to GitHub. Drafts and favorites are local to that browser/device. Export and commit your recipes so they will not be lost if browser storage is cleared.

## Files

- \`index.html\` — page structure, dialogs, form.
- \`styles.css\` — monochrome layout and responsive styling.
- \`app.js\` — rendering, search, favorites, scaling, recipe form/export.
- \`recipes.js\` — published family recipe data.
- \`favicon.svg\` — black-and-white monogram.

No backend or login is required; public visitors can read recipes. If you want collaborative submissions that publish directly to GitHub or shared favorites across devices, a backend/authenticated workflow will be needed.
