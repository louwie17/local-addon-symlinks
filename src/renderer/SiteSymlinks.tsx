import React, { Fragment, useState } from 'react';
import os from 'os';
import fs from 'fs-extra';
import { remote, ipcRenderer } from 'electron';
import { TableListRepeater, BrowseInput } from '@getflywheel/local-components';
import { confirm } from '@getflywheel/local/renderer';
import { formatHomePath } from '../helpers';
import { IPC_EVENTS } from '../constants';

type Symlink = {
    dest: string;
    source: string;
};

const { dialog } = remote;

export function SiteSymlinks(props) {
    const [symlinks, setSymlinks] = useState<Symlink[]>(
        props.site.symlinks || []
    );
    const [provisioning, setProvisiong] = useState(false);
    const [isChanged, setIsChanged] = useState(false);

    const remapSymlinks = async (addedSymlinks: Symlink[]) => {
        const errors = [];

        addedSymlinks.forEach((symlink) => {
            if (!symlink.source.trim() || !symlink.dest.trim()) {
                errors.push('Empty source or destination.');
            }

            if (!fs.existsSync(symlink.source)) {
                errors.push('"' + symlink.source + '" is not a directory.');
            } else if (os.platform() === 'win32') {
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
            return dialog.showErrorBox(
                'There were errors with the path symlinks',
                errors.join('\n')
            );
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

        setProvisiong(false);
        setSymlinks(addedSymlinks);

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
                }}
            />
        </div>
    );
}
