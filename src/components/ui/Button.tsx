import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import clsx from 'clsx';
import styles from './Button.module.css';
import { useHaptics, type HapticType } from '../../hooks/useHaptics';

interface ButtonProps extends HTMLMotionProps<"button"> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'icon';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    haptic?: HapticType;
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    haptic = 'light',
    className,
    children,
    onClick,
    ...props
}) => {
    const haptics = useHaptics();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        haptics.trigger(haptic);
        onClick?.(e as any);
    };

    return (
        <motion.button
            whileTap={{ scale: 0.96 }}
            className={clsx(
                styles.button,
                styles[variant],
                styles[size],
                className
            )}
            onClick={handleClick}
            {...props}
        >
            {children}
        </motion.button>
    );
};
