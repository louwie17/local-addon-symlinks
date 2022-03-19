import { createSelector } from '@reduxjs/toolkit';
import { store } from './store';

const getUnsavedPreferences = createSelector(
    () => store.getState(),
    (state) => {
        return {
            symlinks: state.preferences.symlinks,
        };
    }
);

export const selectors = {
    getUnsavedPreferences,
};
