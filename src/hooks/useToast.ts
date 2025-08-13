import { useToast as useChakraToast, UseToastOptions } from '@chakra-ui/react';
import { useCallback } from 'react';

export interface CustomToastOptions extends Omit<UseToastOptions, 'status'> {
  type?: 'success' | 'error' | 'warning' | 'info';
}

const useToast = () => {
  const chakraToast = useChakraToast();

  const showToast = useCallback((options: CustomToastOptions) => {
    const { type = 'info', ...rest } = options;
    
    return chakraToast({
      status: type,
      duration: 5000,
      isClosable: true,
      position: 'top',
      ...rest,
    });
  }, [chakraToast]);

  const success = useCallback((title: string, description?: string) => {
    return showToast({
      type: 'success',
      title,
      description,
    });
  }, [showToast]);

  const error = useCallback((title: string, description?: string) => {
    return showToast({
      type: 'error',
      title,
      description,
    });
  }, [showToast]);

  const warning = useCallback((title: string, description?: string) => {
    return showToast({
      type: 'warning',
      title,
      description,
    });
  }, [showToast]);

  const info = useCallback((title: string, description?: string) => {
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