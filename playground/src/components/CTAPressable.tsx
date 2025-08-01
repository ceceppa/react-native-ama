import {
    type PressableProps,
} from 'react-native';
import React from 'react';
import {
    AccessibilityState,
    ActivityIndicator,
    StyleSheet,
    Text,
} from 'react-native';

import { theme } from '../theme';
import { Pressable } from './Pressable';

type CTAPressableProps = Omit<
    PressableProps,
    'children'
> & {
    title: string;
    accessibilityLabel?: string;
    textTransform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase' | undefined;
    hasMaring?: boolean
} & {
    marginLeft?: number;
    marginRight?: number;
} & {
    checked?: AccessibilityState['checked'];
    selected?: boolean;
    expanded?: boolean;
};

export const CTAPressable = ({
    title,
    onPress,
    disabled,
    textTransform,
    marginLeft,
    marginRight,
    role,
    hasMaring = false,
        style,
    ...rest
}: CTAPressableProps) => {
    return (
        <Pressable
            role={role ?? "button"}
            disabled={disabled}
            style={({ pressed }) => {
                const buttonStyles = getButtonStyle({
                    pressed,
                    disabled,
                    // @ts-ignore
                    checked: rest?.checked,
                    // @ts-ignore
                    selected: rest?.selected,
                });

                return [
                    styles.button,
                    buttonStyles,
                    {
                        marginLeft, marginRight,
                        marginBottom: hasMaring ? theme.padding.normal : undefined
                    },
                    style,

                ];
            }}
            onPress={onPress}
            {...rest}>
            {rest.busy ? <ActivityIndicator color={theme.color.white} /> : null}
            <Text
                style={[styles.text, { textTransform }]}
            >
                {title}
            </Text>
        </Pressable>
    );
};

function getButtonStyle({
    pressed,
    disabled,
    checked,
    selected,
}: {
    pressed: boolean;
    disabled?: boolean | null;
    checked?: AccessibilityState['checked'];
    selected?: boolean;
}) {
    if (disabled) {
        return styles.disabled;
    } else if (pressed) {
        return styles.pressed;
    } else if (checked) {
        return checked === 'mixed' ? styles.mixed : styles.checked;
    } else if (selected) {
        return styles.selected;
    }

    return {};
}

const styles = StyleSheet.create({
    button: {
        paddingVertical: theme.padding.normal,
        paddingHorizontal: theme.padding.big,
        backgroundColor: theme.color.black,
        minHeight: 48,
        minWidth: 48,
    },
    pressed: {
        backgroundColor: theme.color.hover,
    },
    checked: {
        backgroundColor: theme.color.checked,
    },
    mixed: {
        backgroundColor: theme.color.mixed,
    },
    selected: {
        backgroundColor: theme.color.selected,
    },
    disabled: {
        backgroundColor: theme.color.disabled,
    },
    text: {
        textAlign: 'center',
        color: theme.color.white,
        fontSize: theme.fontSize.medium,
    },
});
