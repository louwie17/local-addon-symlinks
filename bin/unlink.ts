import fs from 'fs-extra';
import path from 'path';
import {
    apps,
    confirmLocalInstallations,
    getLocalDirectory,
} from './symlink-utils';

let localApp = 'Local';
const preferLocalBeta = false;
const localInstallations = confirmLocalInstallations();
if (localInstallations.size == 2) {
    // both applications installed
    localApp = preferLocalBeta ? apps.localBeta : apps.local;
} else if (localInstallations.size == 1) {
    // only Local or Local Beta installed
    localApp = localInstallations.has(apps.local) ? apps.local : apps.localBeta;
} else {
    console.error(
        'No installations of Local found! Please install Local at https://localwp.com before you create an add-on.',
        'No Local directory found: ' // + formatPath(getLocalDirectory(apps.local))
    );
}

const addonDirectoryName = path.basename(path.resolve(__dirname, '..'));
const localDirectory = getLocalDirectory(localApp);
try {
    if (localDirectory) {
        const localAddOnPath = path.join(
            localDirectory,
            'addons',
            addonDirectoryName
        );
        const stats = fs.lstatSync(localAddOnPath);
        if (stats.isSymbolicLink()) {
            console.log(`Unlinking: ${localAddOnPath}`);
            fs.unlinkSync(localAddOnPath);
        } else {
            console.warn(`${localAddOnPath} is not a symlink.`);
        }
    }
} catch (error) {
    console.error(
        `There was a problem unlinking your add-on from the Local add-ons directory.`,
        error
    );
}
