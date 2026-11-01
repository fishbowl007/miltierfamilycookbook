(() => {
  'use strict';
  const recipes = Array.isArray(window.RECIPES) ? window.RECIPES : [];
  const categories = ['All recipes', 'Mains', 'Sides', 'Appetizers', 'Breakfast', 'Desserts', 'Holiday'];
  const $ = selector => document.querySelector(selector);
  const make = (tag, className, content) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (content !== undefined) element.textContent = content;
    return element;
  };
  let saved;
  try {
    const value = JSON.parse(localStorage.getItem('miltier-favorites') || '[]');
    saved = new Set(Array.isArray(value) ? value.filter(id => typeof id === 'string') : []);
  } catch { saved = new Set(); }
  let category = 'All recipes', savedOnly = false, activeRecipe = null, opener = null;
  const list = value => Array.isArray(value) ? value : [];
  const servingBase = recipe => Number(recipe.servings) > 0 ? Number(recipe.servings) : 4;
  function saveButton(recipe) {
    const button = make('button', 'save', saved.has(recipe.id) ? '♥' : '♡');
    button.type = 'button';
    button.setAttribute('aria-label', `${saved.has(recipe.id) ? 'Unsave' : 'Save'} ${recipe.title}`);
    button.setAttribute('aria-pressed', String(saved.has(recipe.id)));
    button.addEventListener('click', () => {
      if (saved.has(recipe.id)) saved.delete(recipe.id); else saved.add(recipe.id);
      try { localStorage.setItem('miltier-favorites', JSON.stringify([...saved])); } catch { /* Favorites remain available during this visit. */ }
      render();
      const replacement = [...document.querySelectorAll('.save')].find(item => item.dataset.recipeId === recipe.id);
      (replacement || $('#favorites')).focus();
    });
    button.dataset.recipeId = recipe.id;
    return button;
  }
  function render() {
    const query = $('#search').value.trim().toLowerCase();
    const filtered = recipes.filter(recipe => {
      const searchable = [recipe.title, recipe.createdBy, ...list(recipe.tags), ...list(recipe.ingredients).map(item => item.i)].join(' ').toLowerCase();
      return (category === 'All recipes' || recipe.category === category) && (!savedOnly || saved.has(recipe.id)) && searchable.includes(query);
    }).sort((a, b) => String($('#sort').value === 'source' ? a.createdBy || '' : a.title || '').localeCompare(String($('#sort').value === 'source' ? b.createdBy || '' : b.title || '')));
    $('#recipe-grid').replaceChildren();
    for (const recipe of filtered) {
      const card = make('article', 'recipe-card');
      card.append(make('p', 'card-category', recipe.category || 'Recipe'), saveButton(recipe));
      const heading = make('h3');
      const open = make('button', 'card-open', recipe.title);
      open.addEventListener('click', () => openRecipe(recipe, open));
      heading.append(open);
      card.append(heading, make('p', 'card-source', recipe.createdBy ? `From ${recipe.createdBy}` : 'From the family collection'));
      const meta = make('div', 'card-meta');
      meta.append(make('span', '', `Serves ${servingBase(recipe)}`), make('span', '', recipe.time || 'View recipe →'));
      card.append(meta);
      $('#recipe-grid').append(card);
    }
    $('#result-count').textContent = `${filtered.length} ${filtered.length === 1 ? 'recipe' : 'recipes'}${savedOnly ? ' saved' : ''}`;
    $('#empty').hidden = filtered.length > 0;
    const firstVisit = recipes.length === 0;
    $('#empty-title').textContent = firstVisit ? 'The next family favorite starts here.' : 'No recipes found.';
    $('#empty-message').textContent = firstVisit ? 'Your cookbook is ready. Once family recipes are added, you can find them here, save your favorites, and print a copy for the kitchen.' : 'Try another search or category, or clear your filters to see the full collection.';
    $('#clear-filters').hidden = firstVisit;
  }
  function formatQuantity(value) {
    return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(3)));
  }
  function renderIngredients(servings) {
    const ingredients = $('#detail-ingredients');
    ingredients.replaceChildren();
    for (const item of list(activeRecipe.ingredients)) {
      const quantity = typeof item.q === 'number' ? formatQuantity(item.q * servings / servingBase(activeRecipe)) : '';
      ingredients.append(make('li', '', [quantity, item.u, item.i].filter(part => part !== '' && part != null).join(' ')));
    }
    $('.print-servings').textContent = `Servings: ${servings}`;
  }
  function openRecipe(recipe, trigger) {
    activeRecipe = recipe;
    opener = trigger;
    const detail = $('#recipe-detail');
    detail.replaceChildren(make('p', 'eyebrow', recipe.category || 'FAMILY RECIPE'));
    const title = make('h2', 'detail-title', recipe.title);
    title.id = 'recipe-title';
    detail.append(title, make('p', 'detail-meta', [recipe.createdBy ? `From ${recipe.createdBy}` : '', recipe.time].filter(Boolean).join(' · ')));
    if (recipe.story) detail.append(make('p', 'story', recipe.story));
    const control = make('label', 'serving-control', 'Servings');
    const servings = make('input');
    servings.type = 'number'; servings.min = '1'; servings.max = '1000'; servings.step = '1'; servings.value = servingBase(recipe);
    servings.addEventListener('input', () => {
      if (servings.validity.valid && servings.value !== '') renderIngredients(Number(servings.value));
    });
    servings.addEventListener('change', () => {
      if (!servings.validity.valid || servings.value === '') servings.value = servingBase(recipe);
      renderIngredients(Number(servings.value));
    });
    control.append(servings);
    detail.append(control, make('p', 'print-servings'));
    const columns = make('div', 'recipe-columns');
    const left = make('section'), right = make('section');
    const ingredients = make('ul', 'ingredients'); ingredients.id = 'detail-ingredients';
    left.append(make('h3', '', 'Ingredients'), ingredients);
    const steps = make('ol', 'directions');
    for (const step of list(recipe.steps)) steps.append(make('li', '', step));
    right.append(make('h3', '', 'Directions'), steps);
    columns.append(left, right); detail.append(columns);
    for (const [key, label] of [['swaps', 'Simple swaps'], ['extras', 'Make it your own'], ['pairIdeas', 'Serve it with']]) {
      if (!list(recipe[key]).length) continue;
      const section = make('section', 'detail-extras'), items = make('ul');
      for (const item of recipe[key]) items.append(make('li', '', item));
      section.append(make('h3', '', label), items); detail.append(section);
    }
    renderIngredients(servingBase(recipe));
    $('#recipe-dialog').showModal();
    $('#close-recipe').focus();
  }
  for (const name of categories) {
    const button = make('button', 'category', name);
    button.setAttribute('aria-pressed', String(name === category));
    button.addEventListener('click', () => {
      category = name;
      document.querySelectorAll('.category').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      render();
    });
    $('.categories').append(button);
  }
  $('#search').addEventListener('input', render);
  $('#sort').addEventListener('change', render);
  $('#favorites').addEventListener('click', () => {
    savedOnly = !savedOnly;
    $('#favorites').setAttribute('aria-pressed', String(savedOnly));
    $('#favorites').textContent = `${savedOnly ? '♥' : '♡'} Saved recipes`;
    render();
  });
  $('#clear-filters').addEventListener('click', () => {
    category = 'All recipes'; savedOnly = false; $('#search').value = '';
    $('#favorites').setAttribute('aria-pressed', 'false'); $('#favorites').textContent = '♡ Saved recipes';
    document.querySelectorAll('.category').forEach(item => item.setAttribute('aria-pressed', String(item.textContent === category)));
    render(); $('#search').focus();
  });
  $('#close-recipe').addEventListener('click', () => $('#recipe-dialog').close());
  $('#recipe-dialog').addEventListener('close', () => { if (opener?.isConnected) opener.focus(); });
  $('#print-recipe').addEventListener('click', () => window.print());
  $('#total-count').textContent = `${recipes.length} ${recipes.length === 1 ? 'recipe' : 'recipes'} in the collection`;
  render();
})();
