import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Preferences, PreferencesState, Symlink } from '../../types';

export const preferencesSlice = createSlice({
    name: 'preferences',
    initialState: {
        hydratedSymlinks: [],
        symlinks: [],
        useDefaultSymlinks: true,
    } as PreferencesState,
    reducers: {
        hydratePreferences: (state, action: PayloadAction<Preferences>) => {
            state.hydratedSymlinks = action.payload.symlinks;
            state.useDefaultSymlinks = action.payload.useDefaultSymlinks;
        },
        updateSymlinks: (state, action: PayloadAction<Symlink[]>) => {
            state.symlinks = action.payload;
        },
        updateUseDefaultSymlinks: (state, action: PayloadAction<boolean>) => {
            state.useDefaultSymlinks = action.payload;
        },
    },
});
