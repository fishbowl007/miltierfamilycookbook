function doGet() {
  return HtmlService.createHtmlOutputFromFile("Index")
    .setTitle("Miltier Family Recipes")
    .setFaviconUrl("https://raw.githubusercontent.com/fishbowl007/miltierfamilycookbook/main/assets/miltier-icon.png")
    .addMetaTag("viewport", "width=device-width, initial-scale=1");
}
