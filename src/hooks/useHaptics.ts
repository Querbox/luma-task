import { useWebHaptics } from 'web-haptics/react';
import { useCallback } from 'react';

export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'none';

export const useHaptics = () => {
    const { trigger, cancel } = useWebHaptics();

    const light = useCallback(() => {
        trigger('nudge', { intensity: 0.3 });
    }, [trigger]);

    const medium = useCallback(() => {
        trigger('nudge', { intensity: 0.5 });
    }, [trigger]);

    const heavy = useCallback(() => {
        trigger('nudge', { intensity: 0.8 });
    }, [trigger]);

    const success = useCallback(() => {
        trigger('success', { intensity: 0.6 });
    }, [trigger]);

    const error = useCallback(() => {
        trigger('error', { intensity: 0.7 });
    }, [trigger]);

    const threshold = useCallback(() => {
        trigger(30, { intensity: 0.5 });
    }, [trigger]);

    const triggerByType = useCallback((type: HapticType) => {
        switch (type) {
            case 'light': light(); break;
            case 'medium': medium(); break;
            case 'heavy': heavy(); break;
            case 'success': success(); break;
            case 'error': error(); break;
            case 'none': break;
        }
    }, [light, medium, heavy, success, error]);

    return {
        light,
        medium,
        heavy,
        success,
        error,
        threshold,
        trigger: triggerByType,
        cancel,
    };
};
