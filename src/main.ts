import * as LocalMain from '@getflywheel/local/main';
import * as path from 'path';
import * as fs from 'fs-extra';
import { IPC_EVENTS } from './constants';
import { Preferences, SymlinkSite } from './types';
import {
    readPreferencesFromDisk,
    savePreferencesToDisk,
} from './main/preferences';
import { NewSiteInfo } from '@getflywheel/local';

async function linkSymlinks(symlinks, siteId: string) {
    for (const symlink of symlinks) {
        if (!symlink.enabled) {
            continue;
        }
        const site = LocalMain.SiteData.getSite(siteId);
        LocalMain.getServiceContainer().cradle.localLogger.log(
            'info',
            `Symlinking ${symlink.source} to ${path.join(
                site.paths.webRoot,
                symlink.dest
            )}.`
        );
        await fs.symlink(
            symlink.source,
            path.join(site.paths.webRoot, symlink.dest),
            'dir'
        );
    }
}

async function unlinkOldSymlinks(newSymlinks, siteId: string) {
    const site = LocalMain.SiteData.getSite(siteId) as SymlinkSite;
    if (site && site.symlinks) {
        for (const symlink of site.symlinks) {
            if (!newSymlinks.find((v) => v.dest === symlink.dest)) {
                await fs.unlink(path.join(site.paths.webRoot, symlink.dest));
            }
        }
    }
}

export default function (context) {
    const { electron } = context;
    const { ipcMain } = electron;

    ipcMain.on(
        IPC_EVENTS.SAVE_SITE_SYMLINKS,
        async (event, siteId, symlinks) => {
            await unlinkOldSymlinks(symlinks, siteId);
            LocalMain.getServiceContainer().cradle.localLogger.log(
                'info',
                `Saving symlinks for site ${siteId}.`
            );
            const dataService = new LocalMain.Services.SiteDataService();
            dataService.updateSite(siteId, {
                id: siteId,
                symlinks,
            } as Partial<SymlinkSite>);
            await linkSymlinks(symlinks, siteId);
        }
    );

    /**
     * Read a Preferences object from disk
     */
    LocalMain.addIpcAsyncListener(
        IPC_EVENTS.READ_PREFERENCES_FROM_DISK,
        async () => readPreferencesFromDisk()
    );

    /**
     * Save a Preferences object to disk
     */
    LocalMain.addIpcAsyncListener(
        IPC_EVENTS.SAVE_PREFERENCES_TO_DISK,
        async (preferences: Preferences) => {
            savePreferencesToDisk(preferences);
            LocalMain.sendIPCEvent(
                IPC_EVENTS.SAVE_PREFERENCES_TO_DISK_SUCCESS,
                readPreferencesFromDisk()
            );
        }
    );

    // add cloudBackupMeta to the newly created site object before it's saved to disk
    LocalMain.HooksMain.addFilter(
        'modifyAddSiteObjectBeforeCreation',
        (site: SymlinkSite, newSiteInfo: NewSiteInfo) => {
            LocalMain.getServiceContainer().cradle.localLogger.log(
                'info',
                `Modifying site object before creation.` + JSON.stringify(site)
            );
            const preferences = readPreferencesFromDisk();
            if (
                preferences.useDefaultSymlinks &&
                (!newSiteInfo.customOptions ||
                    newSiteInfo?.customOptions?.useDefaultSymlinks === 'on')
            ) {
                site.symlinks = preferences.symlinks;
            }
            return site;
        }
    );

    // kick off backup restore after site creation is complete
    LocalMain.HooksMain.addAction('siteAdded', async (site: SymlinkSite) => {
        if (site.symlinks && site.symlinks.length > 0) {
            LocalMain.getServiceContainer().cradle.localLogger.log(
                'info',
                `Adding symlinks upon site added.` +
                    JSON.stringify(site.symlinks)
            );
            await linkSymlinks(site.symlinks, site.id);
        }
    });

    LocalMain.HooksMain.addAction('siteDeleted', (siteID: string) => {
        unlinkOldSymlinks([], siteID);
    });
}
