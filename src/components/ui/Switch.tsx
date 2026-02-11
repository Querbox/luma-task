import React from 'react';
import styles from './Switch.module.css';
import clsx from 'clsx';

interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
}

export const Switch: React.FC<SwitchProps> = ({ checked, onChange, label }) => {
    return (
        <label className={styles.container}>
            {label && <span className={styles.label}>{label}</span>}
            <div
                className={clsx(styles.switch, checked && styles.checked)}
                onClick={() => onChange(!checked)}
            >
                <div className={styles.thumb} />
            </div>
        </label>
    );
};
