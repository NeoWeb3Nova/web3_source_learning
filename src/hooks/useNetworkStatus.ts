import { useState, useEffect, useCallback } from 'react';

export interface NetworkStatus {
  isOnline: boolean;
  isSlowConnection: boolean;
  connectionType: string;
  effectiveType: string;
  downlink: number;
  rtt: number;
}

export interface UseNetworkStatusReturn {
  networkStatus: NetworkStatus;
  isOnline: boolean;
  isOffline: boolean;
  isSlowConnection: boolean;
  checkConnection: () => Promise<boolean>;
  retryConnection: () => Promise<boolean>;
}

const useNetworkStatus = (): UseNetworkStatusReturn => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    isSlowConnection: false,
    connectionType: 'unknown',
    effectiveType: 'unknown',
    downlink: 0,
    rtt: 0,
  });

  // Get network information from Navigator API
  const getNetworkInfo = useCallback((): Partial<NetworkStatus> => {
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    if (connection) {
      return {
        connectionType: connection.type || 'unknown',
        effectiveType: connection.effectiveType || 'unknown',
        downlink: connection.downlink || 0,
        rtt: connection.rtt || 0,
        isSlowConnection: connection.effectiveType === 'slow-2g' || 
                         connection.effectiveType === '2g' ||
                         connection.downlink < 0.5,
      };
    }

    return {
      connectionType: 'unknown',
      effectiveType: 'unknown',
      downlink: 0,
      rtt: 0,
      isSlowConnection: false,
    };
  }, []);

  // Check actual connectivity by making a request
  const checkConnection = useCallback(async (): Promise<boolean> => {
    try {
      // Try to fetch a small resource to test connectivity
      const response = await fetch('/favicon.ico', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
      return response.ok;
    } catch (error) {
      console.warn('Connection check failed:', error);
      return false;
    }
  }, []);

  // Retry connection with exponential backoff
  const retryConnection = useCallback(async (): Promise<boolean> => {
    const maxRetries = 3;
    const baseDelay = 1000; // 1 second

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const isConnected = await checkConnection();
        if (isConnected) {
          return true;
        }
      } catch (error) {
        console.warn(`Connection retry ${attempt} failed:`, error);
      }

      // Wait before next retry with exponential backoff
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    return false;
  }, [checkConnection]);

  // Update network status
  const updateNetworkStatus = useCallback(() => {
    const networkInfo = getNetworkInfo();
    setNetworkStatus(prev => ({
      ...prev,
      isOnline: navigator.onLine,
      ...networkInfo,
    }));
  }, [getNetworkInfo]);

  useEffect(() => {
    // Initial network status
    updateNetworkStatus();

    // Listen for online/offline events
    const handleOnline = () => {
      updateNetworkStatus();
      // Verify actual connectivity when coming back online
      checkConnection().then(isActuallyOnline => {
        if (!isActuallyOnline) {
          setNetworkStatus(prev => ({ ...prev, isOnline: false }));
        }
      });
    };

    const handleOffline = () => {
      updateNetworkStatus();
    };

    // Listen for connection changes
    const handleConnectionChange = () => {
      updateNetworkStatus();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for network information changes
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
    }

    // Periodic connectivity check (every 30 seconds when online)
    const intervalId = setInterval(() => {
      if (navigator.onLine) {
        checkConnection().then(isActuallyOnline => {
          setNetworkStatus(prev => {
            if (prev.isOnline !== isActuallyOnline) {
              return { ...prev, isOnline: isActuallyOnline };
            }
            return prev;
          });
        });
      }
    }, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange);
      }
      
      clearInterval(intervalId);
    };
  }, [updateNetworkStatus, checkConnection]);

  return {
    networkStatus,
    isOnline: networkStatus.isOnline,
    isOffline: !networkStatus.isOnline,
    isSlowConnection: networkStatus.isSlowConnection,
    checkConnection,
    retryConnection,
  };
};

export default useNetworkStatus;