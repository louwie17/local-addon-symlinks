import { useSelector, TypedUseSelectorHook } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { preferencesSlice } from './preferences';
// import { sitesSlice } from './sites';

export { selectors } from './selectors';

export const store = configureStore({
    reducer: {
        preferences: preferencesSlice.reducer,
        // sites: sitesSlice.reducer,
    },
});

export const actions = {
    ...preferencesSlice.actions,
    // ...sitesSlice.actions,
};

type State = ReturnType<typeof store.getState>;
export const useStoreSelector = useSelector as TypedUseSelectorHook<State>;
