import React, { Fragment, useState } from 'react';
import os from 'os';
import { remote } from 'electron';
import {
    TableListRepeater,
    BrowseInput,
    TitleBar,
    Divider,
    Text,
    Switch,
} from '@getflywheel/local-components';
import { formatHomePath, useDebounce } from '../helpers';
import { actions, store, useStoreSelector } from './store/store';
import { Symlink } from '../types';
import path from 'path';
import { FlyModal } from '@getflywheel/local-components';
import { TextButton } from '@getflywheel/local-components';

const { dialog } = remote;

export function DefaultSymlinks(props) {
    const [showScreenshot, setShowScreenshot] = useState(false);
    const { setApplyButtonDisabled } = props;
    const preferences = useStoreSelector((state) => state.preferences);
    const symlinks = preferences?.hydratedSymlinks || [];
    const useDefaultSymlinks = preferences.useDefaultSymlinks;

    const onSymlinkChange = useDebounce(async (updatedSymlinks: Symlink[]) => {
        const errors = [];

        updatedSymlinks.forEach((symlink) => {
            if (!symlink.source.trim() || !symlink.dest.trim()) {
                errors.push('Empty source or destination.');
            }

            if (os.platform() === 'win32') {
                if (formatHomePath(symlink.source).indexOf('C:\\Users') !== 0) {
                    errors.push('Path does not start with C:\\Users');
                }
            } else {
                if (
                    symlink.source.indexOf('/') !== 0 ||
                    symlink.dest.indexOf('/') !== 0
                ) {
                    errors.push('Path does not start with slash.');
                }

                if (
                    formatHomePath(symlink.source).indexOf('/Users') !== 0 &&
                    formatHomePath(symlink.dest).indexOf('/wp-content') !== 0
                ) {
                    errors.push(
                        'Path does not start with /Users or /wp-content'
                    );
                }
            }
        });

        if (errors.length) {
            setApplyButtonDisabled(true);
            return dialog.showErrorBox(
                'There were errors with the path symlinks',
                errors.join('\n')
            );
        }

        store.dispatch(actions.updateSymlinks(updatedSymlinks));
        setApplyButtonDisabled();
    }, 200);

    const renderInstructions = () => {
        if (!showScreenshot) {
            return null;
        }
        return (
            <FlyModal
                isOpen={showScreenshot}
                onRequestClose={() => setShowScreenshot(false)}
                className="symlinks-addon__modal"
            >
                <div style={{ padding: '20px' }}>
                    <img
                        width="600px"
                        src={path.join(
                            __dirname,
                            '../images/environment-step-symlink-setting.png'
                        )}
                        alt="Environment screenshot"
                    />
                </div>
            </FlyModal>
        );
    };

    const header = (
        <Fragment>
            <strong
                className="TableListRowHeader__SeparatorRight"
                style={{ width: '45%' }}
            >
                Host Source
            </strong>
            <strong
                style={{ width: '45%' }}
                className="TableListRowHeader__SeparatorRight"
            >
                Container Destination
            </strong>
            <strong style={{ width: '10%' }}>Enabled</strong>
        </Fragment>
    );

    const repeatingContent = (symlink, index, updateItem) => (
        <Fragment>
            <div className="TableListRow__SeparatorRight">
                <BrowseInput
                    placeholder="Host Source"
                    value={symlink.source || ''}
                    onChange={(source) => {
                        symlink.source = formatHomePath(source);

                        if (
                            os.platform() === 'win32' &&
                            symlink.source.indexOf('C:\\Users') !== 0
                        ) {
                            dialog.showErrorBox(
                                'Error',
                                'Sorry! You must provide a path in C:\\Users.'
                            );

                            return false;
                        } else if (symlink.source.indexOf('/Users') !== 0) {
                            dialog.showErrorBox(
                                'Error',
                                'Sorry! You must provide a path in /Users.'
                            );

                            return false;
                        }

                        updateItem(symlink);
                        return true;
                    }}
                    dialogTitle="Host Source"
                    dialogProperties={['createDirectory', 'openDirectory']}
                />
            </div>

            <div className="TableListRow__Input TableListRow__SeparatorRight">
                <input
                    placeholder="Container Destination"
                    value={symlink.dest}
                    onChange={(e) => {
                        symlink.dest = e.target.value;
                        updateItem(symlink);
                    }}
                />
            </div>
            <div className="TableListRow__Input">
                <Switch
                    style={{ justifyContent: 'center' }}
                    checked={symlink.enabled}
                    onChange={() => {
                        symlink.enabled = !symlink.enabled;
                        updateItem(symlink);
                    }}
                />
            </div>
        </Fragment>
    );

    return (
        <div className="symlinks-addon__default_symlinks">
            {renderInstructions()}
            <TitleBar title="Default Symlinks">
                <Switch
                    checked={useDefaultSymlinks}
                    onChange={() => {
                        store.dispatch(
                            actions.updateUseDefaultSymlinks(
                                !useDefaultSymlinks
                            )
                        );
                        setApplyButtonDisabled();
                    }}
                />
            </TitleBar>
            <Divider />
            <div className="symlinks-addon__description">
                <Text>Default symlinks added upon new site creation.</Text>
                <br />
                <Text>
                    You can also disable this during the Site creation process
                    on the environment step{' '}
                    <TextButton
                        onClick={() => setShowScreenshot(true)}
                        style={{ display: 'inline-block' }}
                    >
                        ( see screenshot )
                    </TextButton>
                </Text>
            </div>
            <TableListRepeater
                className="symlinks-addon__symlink_table"
                header={header}
                repeatingContent={repeatingContent}
                onChange={onSymlinkChange}
                labelSingular="Symlink"
                data={symlinks}
                itemTemplate={{
                    source: os.platform() === 'win32' ? 'C:\\Users' : '/Users',
                    dest: '/wp-content/plugins',
                    enabled: true,
                }}
            />
        </div>
    );
}
