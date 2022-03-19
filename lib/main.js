"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const LocalMain = __importStar(require("@getflywheel/local/main"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const constants_1 = require("./constants");
const preferences_1 = require("./main/preferences");
function linkSymlinks(symlinks, siteId) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const symlink of symlinks) {
            if (!symlink.enabled) {
                continue;
            }
            const site = LocalMain.SiteData.getSite(siteId);
            LocalMain.getServiceContainer().cradle.localLogger.log('info', `Symlinking ${symlink.source} to ${path.join(site.paths.webRoot, symlink.dest)}.`);
            yield fs.symlink(symlink.source, path.join(site.paths.webRoot, symlink.dest), 'dir');
        }
    });
}
function unlinkOldSymlinks(newSymlinks, siteId) {
    return __awaiter(this, void 0, void 0, function* () {
        const site = LocalMain.SiteData.getSite(siteId);
        if (site && site.symlinks) {
            for (const symlink of site.symlinks) {
                if (!newSymlinks.find((v) => v.dest === symlink.dest)) {
                    yield fs.unlink(path.join(site.paths.webRoot, symlink.dest));
                }
            }
        }
    });
}
function default_1(context) {
    const { electron } = context;
    const { ipcMain } = electron;
    ipcMain.on(constants_1.IPC_EVENTS.SAVE_SITE_SYMLINKS, (event, siteId, symlinks) => __awaiter(this, void 0, void 0, function* () {
        yield unlinkOldSymlinks(symlinks, siteId);
        LocalMain.getServiceContainer().cradle.localLogger.log('info', `Saving symlinks for site ${siteId}.`);
        const dataService = new LocalMain.Services.SiteDataService();
        dataService.updateSite(siteId, {
            id: siteId,
            symlinks,
        });
        yield linkSymlinks(symlinks, siteId);
    }));
    /**
     * Read a Preferences object from disk
     */
    LocalMain.addIpcAsyncListener(constants_1.IPC_EVENTS.READ_PREFERENCES_FROM_DISK, () => __awaiter(this, void 0, void 0, function* () { return preferences_1.readPreferencesFromDisk(); }));
    /**
     * Save a Preferences object to disk
     */
    LocalMain.addIpcAsyncListener(constants_1.IPC_EVENTS.SAVE_PREFERENCES_TO_DISK, (preferences) => __awaiter(this, void 0, void 0, function* () {
        preferences_1.savePreferencesToDisk(preferences);
        LocalMain.sendIPCEvent(constants_1.IPC_EVENTS.SAVE_PREFERENCES_TO_DISK_SUCCESS, preferences_1.readPreferencesFromDisk());
    }));
    // add cloudBackupMeta to the newly created site object before it's saved to disk
    LocalMain.HooksMain.addFilter('modifyAddSiteObjectBeforeCreation', (site, newSiteInfo) => {
        var _a;
        LocalMain.getServiceContainer().cradle.localLogger.log('info', `Modifying site object before creation.` + JSON.stringify(site));
        const preferences = preferences_1.readPreferencesFromDisk();
        if (preferences.useDefaultSymlinks &&
            (!newSiteInfo.customOptions ||
                ((_a = newSiteInfo === null || newSiteInfo === void 0 ? void 0 : newSiteInfo.customOptions) === null || _a === void 0 ? void 0 : _a.useDefaultSymlinks) === 'on')) {
            site.symlinks = preferences.symlinks;
        }
        return site;
    });
    // kick off backup restore after site creation is complete
    LocalMain.HooksMain.addAction('siteAdded', (site) => __awaiter(this, void 0, void 0, function* () {
        if (site.symlinks && site.symlinks.length > 0) {
            LocalMain.getServiceContainer().cradle.localLogger.log('info', `Adding symlinks upon site added.` +
                JSON.stringify(site.symlinks));
            yield linkSymlinks(site.symlinks, site.id);
        }
    }));
    LocalMain.HooksMain.addAction('siteDeleted', (siteID) => {
        unlinkOldSymlinks([], siteID);
    });
}
exports.default = default_1;
//# sourceMappingURL=main.js.map