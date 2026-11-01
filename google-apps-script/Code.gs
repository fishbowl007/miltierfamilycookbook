function doGet() {
  return HtmlService.createHtmlOutputFromFile("Index")
    .setTitle("Miltier Family Recipes")
    .addMetaTag("viewport", "width=device-width, initial-scale=1");
}
