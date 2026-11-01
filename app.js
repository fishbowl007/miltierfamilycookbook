/* Miltier Family Recipes — monochrome static cookbook.
 * Recipes stored in recipes.js are published to the site.
 * Recipes added through the form stay on this device until recipes.js is downloaded
 * and committed to GitHub. Never claim the browser writes to GitHub.
 */
(() => {
  "use strict";
  const CATEGORIES = ["All Recipes", "Mains", "Sides", "Appetizers", "Breakfast", "Desserts", "Holiday"];
  const baseRecipes = Array.isArray(window.RECIPES) ? window.RECIPES.filter(r => r && typeof r === "object") : [];
  const $ = id => document.getElementById(id);
  const grid = $("recipeGrid"), empty = $("emptyState"), search = $("recipeSearch");
  const detailDialog = $("recipeDialog"), editorDialog = $("editorDialog");
  const filters = $("categoryFilters"), form = $("recipeForm"), status = $("editorStatus");
  const storageKey = "miltier-family-cookbook-drafts-v1";
  const favoriteKey = "miltier-family-cookbook-favorites-v1";
  const load = (key, fallback) => {
    try { const value = JSON.parse(localStorage.getItem(key)); return Array.isArray(value) ? value : fallback; }
    catch { return fallback; }
  };
  let drafts = load(storageKey, []);
  let favorites = load(favoriteKey, []).filter(v => typeof v === "string");
  let category = CATEGORIES[0], savedOnly = false, selected = null, servings = 4;
  const persist = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch { return false; }
  };
  const recipes = () => {
    const ids = new Set(drafts.map(r => r.id));
    return [...baseRecipes.filter(r => !ids.has(r.id)), ...drafts];
  };
  const clean = value => String(value ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
  const slug = text => String(text).toLowerCase().normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 65);
  const niceNumber = num => {
    const rounded = Math.round((num + Number.EPSILON) * 100) / 100;
    return String(rounded);
  };
  const ingredientText = (item, ratio) => {
    const quantity = typeof item?.q === "number" && Number.isFinite(item.q)
      ? niceNumber(item.q * ratio) : "";
    const unit = String(item?.u ?? "").trim();
    const name = String(item?.i ?? "").trim();
    return [quantity, unit, name].filter(Boolean).join(" ") || "Ingredient not specified";
  };
  const array = (value) => Array.isArray(value) ? value : [];
  const textList = (value) => array(value).filter(Boolean).map(v => String(v));
  const escapeList = value => textList(value).map(item => "<li>" + clean(item) + "</li>").join("");
  const uniqueId = title => {
    const stem = slug(title) || "family-recipe";
    const ids = new Set(recipes().map(r => r.id));
    if (!ids.has(stem)) return stem;
    let n = 2;
    while (ids.has(stem + "-" + n)) n += 1;
    return stem + "-" + n;
  };
  function renderFilters() {
    filters.replaceChildren();
    for (const label of CATEGORIES) {
      const btn = document.createElement("button");
      btn.className = "filter-button";
      btn.type = "button";
      btn.textContent = label;
      btn.setAttribute("aria-pressed", String(category === label));
      btn.addEventListener("click", () => { category = label; renderFilters(); renderCards(); });
      filters.append(btn);
    }
  }
  function renderCards() {
    const query = search.value.trim().toLowerCase();
    const filtered = recipes().filter(r => {
      const matchesCategory = category === "All Recipes" || String(r.category) === category;
      const matchesSaved = !savedOnly || favorites.includes(r.id);
      const haystack = [r.title, r.category, r.createdBy, r.story,
        ...textList(r.tags), ...array(r.ingredients).map(x => x?.i ?? "")].join(" ").toLowerCase();
      return matchesCategory && matchesSaved && haystack.includes(query);
    });
    grid.innerHTML = filtered.map((r, idx) => {
      const id = clean(r.id), title = clean(r.title || "Untitled recipe");
      const favorite = favorites.includes(r.id);
      return '<article class="recipe-card">' +
        '<button class="card-open" data-open="' + id + '" type="button" aria-label="View ' + title + '">' +
        '<div class="card-art"><span class="card-art-number">' + String(idx + 1).padStart(2, "0") + ' / MILTIER</span>' +
        '<span class="card-initial">' + clean(String(r.title || "M")[0].toUpperCase()) + '</span><span class="card-art-corner">↗</span></div>' +
        '<div class="card-copy"><span class="card-category">' + clean(String(r.category || "FAMILY").toUpperCase()) + '</span>' +
        '<h3 class="card-title">' + title + '</h3><div class="card-meta"><span>' + clean(r.createdBy || "Family recipe") + '</span><span>' + clean(r.time || "TIME NOT LISTED") + '</span></div></div></button>' +
        '<div class="card-bottom"><span class="card-footer">VIEW RECIPE ↗</span><button class="card-favorite" type="button" data-favorite="' + id + '" aria-label="' +
        (favorite ? "Remove from" : "Add to") + ' saved recipes" aria-pressed="' + String(favorite) + '">' +
        (favorite ? "♥" : "♡") + '</button></div></article>';
    }).join("");
    $("resultCount").textContent = filtered.length + (filtered.length === 1 ? " RECIPE" : " RECIPES");
    empty.hidden = filtered.length !== 0;
    if (filtered.length === 0) {
      const completelyEmpty = recipes().length === 0;
      $("emptyTitle").textContent = completelyEmpty ? "The story starts here." : "No recipes found.";
      $("emptyMessage").textContent = completelyEmpty
        ? "The collection is ready for your family's first recipe."
        : "Try another search, category, or saved-recipes filter.";
      $("emptyAction").hidden = !completelyEmpty;
    }
  }
  function viewRecipe(id) {
    const recipe = recipes().find(r => r.id === id);
    if (!recipe) return;
    selected = recipe; servings = Math.max(1, Math.floor(Number(recipe.servings) || 4));
    renderDetail();
    detailDialog.showModal();
  }
  function renderDetail() {
    if (!selected) return;
    const r = selected, base = Math.max(1, Number(r.servings) || 4), ratio = servings / base;
    const extras = [["Swaps", r.swaps], ["Optional extras", r.extras], ["Pairing ideas", r.pairIdeas]]
      .filter(([_, entries]) => array(entries).length);
    $("recipeDetail").innerHTML =
      '<p class="detail-category">' + clean(String(r.category || "FAMILY").toUpperCase()) + '</p>' +
      '<h2 id="detailTitle" class="detail-title">' + clean(r.title) + '</h2>' +
      '<p class="detail-byline">From ' + clean(r.createdBy || "the family") + (r.time ? ' · ' + clean(r.time) : "") + '</p>' +
      '<div class="detail-meta"><span>SERVINGS</span><div class="serving-control">' +
      '<button type="button" data-serving="-1" aria-label="Decrease servings">−</button><output>' + servings + '</output>' +
      '<button type="button" data-serving="1" aria-label="Increase servings">+</button></div>' +
      '<span>INGREDIENTS ADJUST AUTOMATICALLY</span></div>' +
      (r.story ? '<p class="detail-story">' + clean(r.story) + '</p>' : "") +
      '<div class="detail-columns"><section><h3>Ingredients</h3><ul>' +
      array(r.ingredients).map(item => '<li>' + clean(ingredientText(item, ratio)) + '</li>').join("") +
      '</ul></section><section><h3>Directions</h3><ol>' + escapeList(r.steps) + '</ol></section></div>' +
      extras.map(([heading, entries]) => '<section class="detail-extra"><h3>' + clean(heading) +
      '</h3><ul>' + escapeList(entries) + '</ul></section>').join("") +
      '<div class="detail-actions"><button id="printRecipeButton" class="button button-outline" type="button">PRINT RECIPE ↗</button>' +
      '<button id="saveDetailButton" class="button button-dark" type="button">' +
      (favorites.includes(r.id) ? "♥ SAVED" : "♡ SAVE RECIPE") + '</button></div>';
  }
  function toggleFavorite(id) {
    favorites = favorites.includes(id) ? favorites.filter(x => x !== id) : [...favorites, id];
    persist(favoriteKey, favorites); renderCards();
    if (selected && selected.id === id) renderDetail();
  }
  function openEditor() {
    status.textContent = "";
    editorDialog.showModal();
  }
  function lines(value) { return String(value || "").split(/\r?\n/).map(x => x.trim()).filter(Boolean); }
  function readIngredients(value) {
    return lines(value).map((line, index) => {
      const parts = line.split("|").map(x => x.trim());
      if (parts.length !== 3 || !parts[2]) throw Error("Ingredient line " + (index + 1) + " must use: quantity | unit | ingredient.");
      const q = parts[0] === "" ? null : Number(parts[0]);
      if (q !== null && (!Number.isFinite(q) || q < 0)) throw Error("Check the quantity on ingredient line " + (index + 1) + ".");
      return {q, u: parts[1], i: parts[2]};
    });
  }
  function downloadRecipes() {
    const content = "/* Miltier Family Recipes — replace the existing recipes.js with this file. */\n" +
      "window.RECIPES = " + JSON.stringify(recipes(), null, 2) + ";\n";
    const blob = new Blob([content], {type:"text/javascript;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = "recipes.js";
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status.textContent = "Downloaded recipes.js. Upload this file to GitHub to publish your recipes. Nothing has been changed on GitHub automatically.";
  }
  grid.addEventListener("click", e => {
    const fav = e.target.closest("[data-favorite]");
    if (fav) { toggleFavorite(fav.dataset.favorite); return; }
    const opener = e.target.closest("[data-open]");
    if (opener) viewRecipe(opener.dataset.open);
  });
  $("recipeDetail").addEventListener("click", e => {
    const adjust = e.target.closest("[data-serving]");
    if (adjust) { servings = Math.max(1, Math.min(1000, servings + Number(adjust.dataset.serving))); renderDetail(); }
    if (e.target.closest("#printRecipeButton")) window.print();
    if (e.target.closest("#saveDetailButton") && selected) toggleFavorite(selected.id);
  });
  search.addEventListener("input", renderCards);
  document.addEventListener("keydown", e => {
    if (e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName) &&
        !detailDialog.open && !editorDialog.open) { e.preventDefault(); search.focus(); }
  });
  $("favoritesToggle").addEventListener("click", () => {
    savedOnly = !savedOnly;
    $("favoritesToggle").setAttribute("aria-pressed", String(savedOnly));
    $("favoritesToggle").textContent = savedOnly ? "♥ SHOWING SAVED" : "♡ SAVED RECIPES";
    renderCards();
  });
  for (const id of ["newRecipeButton", "aboutAddButton", "emptyAction"]) $(id).addEventListener("click", openEditor);
  $("closeRecipeButton").addEventListener("click", () => detailDialog.close());
  $("closeEditorButton").addEventListener("click", () => editorDialog.close());
  $("downloadRecipesButton").addEventListener("click", downloadRecipes);
  form.addEventListener("submit", e => {
    e.preventDefault();
    try {
      const data = new FormData(form);
      const title = String(data.get("title") || "").trim();
      const createdBy = String(data.get("createdBy") || "").trim();
      const count = Number(data.get("servings"));
      if (!title || !createdBy || !Number.isInteger(count) || count < 1) throw Error("Please enter a title, contributor, and valid servings.");
      const ingredients = readIngredients(data.get("ingredients"));
      const steps = lines(data.get("steps"));
      if (!ingredients.length || !steps.length) throw Error("Add at least one ingredient and one direction.");
      const draft = {
        id: uniqueId(title), title, category: String(data.get("category")),
        createdBy, servings: count, time: String(data.get("time") || "").trim(),
        story: String(data.get("story") || "").trim(),
        tags: String(data.get("tags") || "").split(",").map(v => v.trim().toLowerCase()).filter(Boolean),
        ingredients, steps,
        swaps: lines(data.get("swaps")), extras: lines(data.get("extras")),
        pairs: [], pairIdeas: lines(data.get("pairIdeas"))
      };
      drafts.push(draft);
      const saved = persist(storageKey, drafts);
      category = CATEGORIES[0]; savedOnly = false; search.value = "";
      $("favoritesToggle").setAttribute("aria-pressed", "false");
      $("favoritesToggle").textContent = "♡ SAVED RECIPES";
      renderFilters(); renderCards();
      status.textContent = saved
        ? "Recipe saved on this device. Download recipes.js and upload it to GitHub to publish it."
        : "Local storage is unavailable. Download recipes.js now to keep this recipe.";
      form.reset();
    } catch (error) { status.textContent = error.message || "Could not save recipe."; }
  });
  renderFilters(); renderCards();
})();
