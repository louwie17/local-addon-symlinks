import React, { Fragment, useEffect, useRef, useState } from 'react';
import os from 'os';
import fs from 'fs-extra';
import path from 'path';
import { ipcRenderer } from 'electron';
import {
    TableListRepeater,
    BrowseInput,
    Banner,
} from '@getflywheel/local-components';
import { confirm } from '@getflywheel/local/renderer';
import { formatHomePath } from '../helpers';
import { IPC_EVENTS } from '../constants';

type Symlink = {
    dest: string;
    source: string;
    enabled: boolean;
};

export function SiteSymlinks(props) {
    const [symlinks, setSymlinks] = useState<Symlink[]>(
        props.site.symlinks || []
    );
    const symlinksBeingSaved = useRef<Symlink[]>();
    const [provisioning, setProvisioning] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        const successCallback = (event) => {
            setShowSuccess(true);
            setSymlinks(symlinksBeingSaved.current);
            setProvisioning(false);
            setTimeout(() => {
                setShowSuccess(false);
            }, 8000);
        };
        ipcRenderer.on(IPC_EVENTS.SAVE_SITE_SYMLINKS_SUCCESS, successCallback);
        const failureCallback = (event, errors) => {
            const errorMessages = [];
            for (const error of errors) {
                if (error && error.code) {
                    if (error.code === 'EEXIST' && error.dest) {
                        errorMessages.push(`"${error.dest}" already exists.`);
                    } else {
                        errorMessages.push(
                            `"${error.dest}" failed with code: ${error.code}.`
                        );
                    }
                }
            }
            ipcRenderer.send(
                IPC_EVENTS.SHOW_ERROR_DIALOG,
                'Failed to save config and update symlink folders.',
                errorMessages.join('\n')
            );
            setProvisioning(false);
        };
        ipcRenderer.on(IPC_EVENTS.SAVE_SITE_SYMLINKS_FAILURE, failureCallback);
        return () => {
            ipcRenderer.removeListener(
                IPC_EVENTS.SAVE_SITE_SYMLINKS_SUCCESS,
                successCallback
            );
            ipcRenderer.removeListener(
                IPC_EVENTS.SAVE_SITE_SYMLINKS_FAILURE,
                failureCallback
            );
        };
    }, []);

    const remapSymlinks = async (addedSymlinks: Symlink[]) => {
        const errors = [];

        addedSymlinks.forEach((symlink) => {
            if (!symlink.source.trim() || !symlink.dest.trim()) {
                errors.push('Empty source or destination.');
            }

            if (!fs.existsSync(symlink.source)) {
                errors.push(`"${symlink.source}" does not exist.`);
            }

            if (formatHomePath(symlink.dest).indexOf('/wp-content') !== 0) {
                errors.push('Destination does not start with /wp-content');
            }
        });

        if (errors.length) {
            ipcRenderer.send(
                IPC_EVENTS.SHOW_ERROR_DIALOG,
                'There were errors with the path symlinks',
                errors.join('\n')
            );
            return;
        }

        await confirm({
            title: 'Are you sure you want to symlink these folders for this site?',
            buttonText: 'Symlink folders',
            cancelButtonText: '',
            buttonClass: '',
            topIcon: undefined,
            topIconColor: undefined,
            largeConfirmButtonText: '',
            showBottomHr: false,
        });

        setProvisioning(true);
        symlinksBeingSaved.current = addedSymlinks;

        ipcRenderer.send(
            IPC_EVENTS.SAVE_SITE_SYMLINKS,
            props.match.params.siteID,
            addedSymlinks
        );
    };

    const header = (
        <Fragment>
            <strong
                className="TableListRowHeader__SeparatorRight"
                style={{ width: '50%' }}
            >
                Host Source
            </strong>
            <strong style={{ width: '50%' }}>Container Destination</strong>
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
                            ipcRenderer.send(
                                IPC_EVENTS.SHOW_ERROR_DIALOG,
                                'Error',
                                'Sorry! You must provide a path in C:\\Users.'
                            );

                            return false;
                        } else if (symlink.source.indexOf('/Users') !== 0) {
                            ipcRenderer.send(
                                IPC_EVENTS.SHOW_ERROR_DIALOG,
                                'Error',
                                'Sorry! You must provide a path in /Users.'
                            );

                            return false;
                        }

                        if (symlink.dest === '/wp-content/plugins') {
                            const sourceFolderName = symlink.source
                                .split(path.sep)
                                .pop();
                            symlink.dest =
                                '/wp-content/plugins/' + sourceFolderName;
                        }
                        updateItem(symlink);
                        return true;
                    }}
                    dialogTitle="Host Source"
                    dialogProperties={[
                        'createDirectory',
                        'openDirectory',
                        'openFile',
                    ]}
                />
            </div>

            <div className="TableListRow__Input">
                <input
                    placeholder="Container Destination"
                    value={symlink.dest}
                    onChange={(e) => {
                        symlink.dest = e.target.value;
                        updateItem(symlink);
                    }}
                />
            </div>
        </Fragment>
    );

    return (
        <div style={{ flex: '1', overflowY: 'auto' }}>
            {showSuccess ? (
                <Banner
                    className="successNotificationBanner"
                    variant="success"
                    icon="false"
                >
                    Successfully saved and symlinked folders.
                </Banner>
            ) : null}
            <TableListRepeater
                header={header}
                repeatingContent={repeatingContent}
                onSubmit={remapSymlinks}
                submitDisabled={provisioning}
                submitLabel={
                    provisioning
                        ? 'Remapping Symlinks...'
                        : props.siteStatus == 'running'
                        ? 'Remap Symlinks'
                        : 'Start Site to Remap Symlinks'
                }
                labelSingular="Symlink"
                data={symlinks}
                itemTemplate={{
                    source: '~',
                    dest: '/wp-content/plugins',
                    enabled: true,
                }}
            />
        </div>
    );
}
