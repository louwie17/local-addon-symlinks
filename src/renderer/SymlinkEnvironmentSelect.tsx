import React, { useState } from 'react';
import { Checkbox, Text } from '@getflywheel/local-components';
import { useStoreSelector } from './store/store';

type Props = {
    disableButton: (value: boolean) => void;
};

export const SymlinkEnvironmentSelect: React.FC<Props> = (props) => {
    const preferences = useStoreSelector((state) => state.preferences);
    const useDefaultSymlinks = preferences.useDefaultSymlinks;
    const [checked, setChecked] = useState(useDefaultSymlinks);

    const onChange = (value: boolean) => {
        setChecked(value);
        props.disableButton(false);
    };

    return (
        <div>
            <div
                className="FormRow FormRow__Center SymlinkCheckboxSelect"
                style={{ marginTop: 30 }}
            >
                <div>
                    <Checkbox
                        name="useDefaultSymlinks"
                        style={{ marginTop: 10 }}
                        checked={checked}
                        label="Enable Default Symlinks."
                        onChange={(checked) => onChange(checked)}
                    />
                    <div className="SymlinkTextLink">
                        <Text>
                            Default symlinks will be used, defined under
                            Preferences.
                        </Text>
                    </div>
                </div>
            </div>
        </div>
    );
};
