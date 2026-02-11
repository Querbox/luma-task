import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import clsx from 'clsx';
import styles from './Button.module.css';

interface ButtonProps extends HTMLMotionProps<"button"> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'icon';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    className,
    children,
    ...props
}) => {
    return (
        <motion.button
            whileTap={{ scale: 0.96 }}
            className={clsx(
                styles.button,
                styles[variant],
                styles[size],
                className
            )}
            {...props}
        >
            {children}
        </motion.button>
    );
};
