import { useToast as useChakraToast } from '@chakra-ui/react';
import { useCallback } from 'react';
const useToast = () => {
    const chakraToast = useChakraToast();
    const showToast = useCallback((options) => {
        const { type = 'info', ...rest } = options;
        return chakraToast({
            status: type,
            duration: 5000,
            isClosable: true,
            position: 'top',
            ...rest,
        });
    }, [chakraToast]);
    const success = useCallback((title, description) => {
        return showToast({
            type: 'success',
            title,
            description,
        });
    }, [showToast]);
    const error = useCallback((title, description) => {
        return showToast({
            type: 'error',
            title,
            description,
        });
    }, [showToast]);
    const warning = useCallback((title, description) => {
        return showToast({
            type: 'warning',
            title,
            description,
        });
    }, [showToast]);
    const info = useCallback((title, description) => {
        return showToast({
            type: 'info',
            title,
            description,
        });
    }, [showToast]);
    return {
        toast: showToast,
        success,
        error,
        warning,
        info,
    };
};
export default useToast;
