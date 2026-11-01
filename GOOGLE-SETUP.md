# Publish the cookbook from GitHub to Google

The workflow publishes changes to main, or a manual run on main, to the existing Google app and keeps the shared URL. Changes on review branches do not deploy. Add the encrypted repository secret CLASPRC_JSON containing the Google clasp authorization before enabling the first deployment. Never commit that credential or paste it into a chat.

Edit recipes.js for new recipes. The build script regenerates google-apps-script/Index.html from the static source before each deployment, so the two copies stay consistent. Run `node scripts/build-google.mjs` to check the recipe structure and generate the Google page locally.

The Google manifest matches the existing app: America/New_York, V8, runs as the deploying owner, and public access. Publishing replaces the Google editor files with this repository's google-apps-script directory. Keep future changes in GitHub so manual Google editor changes are not overwritten.

The authorization currently belongs to the Google account that owns the cookbook. It includes the permissions approved during clasp sign-in and is not restricted to this one script. Store it only as an encrypted GitHub Actions secret. Revoke it through Google Account connections if no longer needed. If it expires or is revoked, repeat sign-in and replace the secret. Workflow logs should never print the credential.

To publish: review and merge the cookbook pull request. Open the repository Actions tab and check that Publish cookbook to Google succeeds. Then open the existing web app URL and verify the update. The first end-to-end deployment must still be tested after the secret is saved.

Reference: https://developers.google.com/apps-script/guides/clasp
