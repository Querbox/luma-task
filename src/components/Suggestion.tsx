import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import styles from './Suggestion.module.css';

interface SuggestionProps {
    message: string;
    onAccept: () => void;
    onDismiss: () => void;
    autoHideDuration?: number;
}

export const Suggestion: React.FC<SuggestionProps> = ({
    message,
    onAccept,
    onDismiss,
    autoHideDuration = 12000
}) => {
    const [isVisible, setIsVisible] = useState(true);

    React.useEffect(() => {
        if (!autoHideDuration) return;
        const timer = setTimeout(() => {
            setIsVisible(false);
            onDismiss();
        }, autoHideDuration);
        return () => clearTimeout(timer);
    }, [autoHideDuration, onDismiss]);

    const handleAccept = () => {
        setIsVisible(false);
        onAccept();
    };

    const handleDismiss = () => {
        setIsVisible(false);
        onDismiss();
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className={styles.container}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className={styles.content}>
                        <p className={styles.message}>{message}</p>
                    </div>
                    <div className={styles.actions}>
                        <button className={styles.accept} onClick={handleAccept}>
                            <Check size={18} />
                        </button>
                        <button className={styles.dismiss} onClick={handleDismiss}>
                            <X size={18} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
