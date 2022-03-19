import { Site } from '@getflywheel/local';

export type Symlink = {
    dest: string;
    source: string;
    enabled: boolean;
};

export type Preferences = {
    symlinks?: Symlink[];
    useDefaultSymlinks: boolean;
};

export type PreferencesState = {
    hydratedSymlinks?: Symlink[];
    symlinks?: Symlink[];
    useDefaultSymlinks: boolean;
};

export type SymlinkSite = Site & {
    symlinks: {
        dest: string;
        source: string;
    }[];
};
