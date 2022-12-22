// Functions below are copied from https://github.com/getflywheel/create-local-addon as they are not exported otherwise.

import path from 'path';
import os from 'os';
import fs from 'fs-extra';

export const platforms = {
    macOS: 'darwin',
    windows: 'win32',
    linux: 'linux',
};

export const apps = {
    local: 'Local',
    localBeta: 'Local Beta',
};

/**
 * returns a list of all local installations found on the system
 *
 * @returns {Set<string>} Local Installations
 */
export const confirmLocalInstallations = function () {
    var localInstallations = new Set();
    if (fs.existsSync(getLocalDirectory(apps.local))) {
        localInstallations.add(apps.local);
    }
    if (fs.existsSync(getLocalDirectory(apps.localBeta))) {
        localInstallations.add(apps.localBeta);
    }
    return localInstallations;
};

/**
 * constructs a path to the directory for a Local application
 *
 * @param {string} localApp - Local or Local Beta
 */
export const getLocalDirectory = function (localApp) {
    const platform = os.platform();
    if (platform === platforms.macOS) {
        // EXAMPLE: `/Users/username/Library/Application Support/Local`
        return path.join(
            os.homedir(),
            'Library',
            'Application Support',
            localApp
        );
    } else if (platform === platforms.windows) {
        // EXAMPLE: `C:\Users\username\AppData\Roaming\Local`
        return path.join(os.homedir(), 'AppData', 'Roaming', localApp);
    } else if (platform === platforms.linux) {
        // EXAMPLE: `/home/username/.config/Local`
        return path.join(os.homedir(), '.config', localApp);
    }
    return '';
};
