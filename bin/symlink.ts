import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import {
    apps,
    confirmLocalInstallations,
    getLocalDirectory,
    platforms,
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

const targetDirectoryPath = path.resolve(__dirname, '../..');
const addonDirectoryName = path.basename(path.resolve(__dirname, '..'));
const localDirectory = getLocalDirectory(localApp);
try {
    if (localDirectory) {
        const targetPath = path.join(targetDirectoryPath, addonDirectoryName);
        const localAddOnPath = path.join(
            localDirectory,
            'addons',
            addonDirectoryName
        );
        console.log(`Symlinking: ${targetPath} to ${localAddOnPath}`);
        fs.symlinkSync(
            path.join(targetDirectoryPath, addonDirectoryName),
            path.join(localDirectory, 'addons', addonDirectoryName)
        );
    }
} catch (error) {
    if (os.platform() === platforms.windows) {
        // Windows system symlink failure
        console.warn(
            `We will not be able to create a symlink pointing to your add-on within the Local add-ons directory; this can happen when you are using a Windows system that does not support symlinks or the add-on generator has insufficient permissions to create a symlink. We will skip this linking step. See https://github.com/getflywheel/create-local-addon#for-our-windows-users for more information.\n`,
            error
        );
    } else {
        // Non-Windows system symlink failure
        console.log(
            `New add-on directory: ${path.join(
                targetDirectoryPath,
                addonDirectoryName
            )}`
        );
        console.error(
            `There was a problem linking your add-on into the Local add-ons directory. The add-on has been created, but may not appear in the Local application until you link and build it yourself. See https://github.com/getflywheel/create-local-addon#buildingenabling-your-add-on-manually for more information.`,
            error
        );
    }
}
