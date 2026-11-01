import { readFile, writeFile, mkdir } from 'node:fs/promises';
import vm from 'node:vm';

const read = name => readFile(new URL('../' + name, import.meta.url), 'utf8');
const [page, css, recipes, app] = await Promise.all(['index.html', 'styles.css', 'recipes.js', 'app.js'].map(read));
new vm.Script(app);
const context = { window: {} };
vm.runInNewContext(recipes, context, { timeout: 1000 });
if (!Array.isArray(context.window.RECIPES)) throw new Error('window.RECIPES must be an array');
const ids = new Set();
for (const recipe of context.window.RECIPES) {
  if (!recipe.id || ids.has(recipe.id) || !recipe.title || !Number.isFinite(recipe.servings) || recipe.servings <= 0 || !Array.isArray(recipe.ingredients) || !Array.isArray(recipe.steps)) {
    throw new Error('Recipe has missing fields, invalid servings, or a duplicate id: ' + recipe.id);
  }
  ids.add(recipe.id);
}
const html = page
  .replace('  <link rel="stylesheet" href="styles.css">', () => '<style>\n' + css + '\n</style>')
  .replace('  <script src="recipes.js" defer></script>\n  <script src="app.js" defer></script>', '')
  .replace('href="./"', 'href="#"')
  .replace('</body>', () => '<script>\n' + recipes + '\n' + app + '\n</script>\n</body>');
if (html.includes('src="app.js"') || html.includes('href="styles.css"')) throw new Error('Bundling failed');
await mkdir(new URL('../google-apps-script/', import.meta.url), { recursive: true });
await writeFile(new URL('../google-apps-script/Index.html', import.meta.url), html);
console.log('Built Google cookbook with ' + ids.size + ' recipes.');
