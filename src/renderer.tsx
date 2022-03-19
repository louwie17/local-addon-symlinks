import fs from 'fs-extra';
import path from 'path';
import { Provider } from 'react-redux';
import { ipcRenderer } from 'electron';
import * as LocalRenderer from '@getflywheel/local/renderer';
import { IPC_EVENTS } from './constants';
import { DefaultSymlinks } from './renderer/DefaultSymlinks';
import { SiteSymlinks } from './renderer/SiteSymlinks';
import { actions, store } from './renderer/store/store';
import { Preferences } from './types';
import { SymlinkEnvironmentSelect } from './renderer/SymlinkEnvironmentSelect';

const packageJSON = fs.readJsonSync(path.join(__dirname, '../package.json'));
const addonName = packageJSON['productName'];
const addonID = packageJSON['slug'];
fs.readdir(path.join(__dirname, '../'), (err, files) => {
    files.forEach((file) => {
        console.log(file);
    });
});

export default async function (context) {
    const { React, hooks } = context;
    const { Route } = context.ReactRouter;

    const stylesheetPath = path.resolve(__dirname, '../style.css');

    hooks.addContent('stylesheets', () => (
        <link
            rel="stylesheet"
            key="symlink-addon-styleesheet"
            href={stylesheetPath}
        />
    ));

    const preferences: Preferences = await LocalRenderer.ipcAsync(
        IPC_EVENTS.READ_PREFERENCES_FROM_DISK
    );
    store.dispatch(actions.hydratePreferences(preferences));

    ipcRenderer.on(
        IPC_EVENTS.SAVE_PREFERENCES_TO_DISK_SUCCESS,
        (event, updatedPreferences) => {
            store.dispatch(actions.hydratePreferences(updatedPreferences));
        }
    );

    // Create the route/page of content that will be displayed when the menu option is clicked
    hooks.addContent('routesSiteInfo', ({ routeChildrenProps }) => {
        return (
            <Route
                key={`${addonID}-addon`}
                path={`/main/site-info/:siteID/${addonID}`}
                render={(props) => (
                    <>
                        <SiteSymlinks
                            {...props}
                            site={routeChildrenProps.site}
                        />
                    </>
                )}
            />
        );
    });

    hooks.addContent('routesSiteOptions', ({ routeChildrenProps }) => {
        return (
            <Route
                key={`${addonID}-addon`}
                path={`/main/site-info/:siteID/${addonID}`}
                render={(props) => (
                    <>
                        <SiteSymlinks
                            {...props}
                            site={routeChildrenProps.site}
                        />
                    </>
                )}
            />
        );
    });

    // Add menu option within the site menu bar
    hooks.addFilter('siteInfoMoreMenu', function (menu, site) {
        menu.push({
            label: `${addonName}`,
            enabled: true,
            click: () => {
                context.events.send(
                    'goToRoute',
                    `/main/site-info/${site.id}/${addonID}`
                );
            },
        });

        return menu;
    });

    const withStoreProvider = (Component) => (props) =>
        (
            <Provider store={store}>
                <Component {...props} />
            </Provider>
        );

    const preferenceItem = {
        path: 'symlinks',
        displayName: 'Symlinks',
        sections: withStoreProvider(DefaultSymlinks),
        onApply: () => {
            LocalRenderer.ipcAsync(IPC_EVENTS.SAVE_PREFERENCES_TO_DISK, {
                symlinks: store.getState().preferences.symlinks,
                useDefaultSymlinks:
                    store.getState().preferences.useDefaultSymlinks,
            });
        },
        componentProps: {},
    };

    hooks.addFilter('preferencesMenuItems', (menu) => {
        menu.push(preferenceItem);

        return menu;
    });

    hooks.addContent(
        'NewSiteEnvironment_EnvironmentDetails',
        ({ disableButton, ...props }) => {
            console.log(props);
            return (
                <Provider store={store}>
                    <SymlinkEnvironmentSelect disableButton={disableButton} />
                </Provider>
            );
        }
    );
}
