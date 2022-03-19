import * as LocalMain from '@getflywheel/local/main';
import { Preferences } from '../types';
import { PREFERENCES_FILE_NAME } from '../constants';

const serviceContainer = LocalMain.getServiceContainer().cradle;

export function readPreferencesFromDisk(): Preferences {
    return serviceContainer.userData.get(PREFERENCES_FILE_NAME, {});
}

export function savePreferencesToDisk(preferences: Preferences): void {
    serviceContainer.userData.set(PREFERENCES_FILE_NAME, preferences);
}
