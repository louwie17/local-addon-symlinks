# Changelog

## [2.1.0] - 2023-08-25

-   Fix: Move `showErrorBox` call to main process, as it is not available in Renderer.
-   Add: Add `unlink-addon` package script unlinking for local development.

## [2.0.0] - 2022-12-22

-   Fix: Update add-on support for Electron 21 and Local 6.6.0
-   Add: Add `link-addon` package script for easy linking for local development.
-   Update: Update several dependencies.

## [1.1.0] - 2022-04-10

-   Fix: Allow users to successfully add symlinks for individual sites.
-   Fix: Make sure new sites don't include disabled symlinks set in default section.
-   Fix: Issue where Linux users are not able to add new symlinks.
-   Add: Better error logging when adding and removing symlinks.

## [1.0.0]

-   Initial release
