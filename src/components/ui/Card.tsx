import React from 'react';
import clsx from 'clsx';
import styles from './Card.module.css';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    glass?: boolean;
}

export const Card: React.FC<CardProps> = ({
    className,
    children,
    glass = true,
    ...props
}) => {
    return (
        <div
            className={clsx(
                styles.card,
                glass && 'glass',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};
