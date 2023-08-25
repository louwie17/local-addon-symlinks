# Local Symlink Add-on

A [Local](https://localwp.com/) add on for adding symlinks for plugins to new sites. These can be set on individual sites, or in preferences as a default.

![](./symlinks-full-demo.gif)

## Installation

-   Download the latest release bundle (local-addon-symlinks-<version>.tgz) from [releases](https://github.com/louwie17/local-addon-symlinks/releases)
-   Open local and go to Add-ons > Installed
-   Click 'Install from disk' and select the previously downloaded bundle.

### Clone

Clone the repository into the following directory depending on your platform:

-   macOS: `~/Library/Application Support/Local/addons`
-   Windows: `C:\Users\username\AppData\Roaming\Local\addons`
-   Debian Linux: `~/.config/Local/addons`

_You can replace 'Local' with 'Local Beta' if you want to create the add-on for Local Beta._

### Install Add-on Dependencies

`yarn install` or `npm install`

### Add Add-on to Local for Development

1. Clone repo directly into the add-ons folder (paths described above)
2. `yarn install` or `npm install` (install dependencies)
3. `yarn build` or `npm run build`
4. `yarn link-addon`
5. Open Local and enable add-on

## License

MIT
