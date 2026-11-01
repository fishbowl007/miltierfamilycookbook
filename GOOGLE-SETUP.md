# Google deployment connection

Status: GitHub source is prepared; automatic deployment is not connected yet.

The static app source is index.html, styles.css, app.js, and recipes.js. The google-apps-script directory contains the bundled copy currently used for Google hosting. Until a build step is configured, changes to the static source must also be applied to that bundle before Google deployment.

Next steps:
1. Enable the Apps Script API in https://script.google.com/home/usersettings . This allows authorized tools to manage Apps Script projects.
2. Authorize Google's clasp tool using the Google account that owns the existing project. This requires a supported Node.js installation and an interactive Google sign-in.
3. Store the resulting clasp credentials in a GitHub Actions encrypted repository secret, never in repository files or chat. The authorization can manage Apps Script projects for that account; review its scope before approving.
4. Configure and test a workflow that builds the Google HTML bundle, pushes to the existing Script ID, and updates the existing deployment ID so the shared URL stays the same.

No credentials or automated deployment workflow are included in this initial change. GitHub changes do not yet update the Google-hosted app.

Reference: https://developers.google.com/apps-script/guides/clasp
