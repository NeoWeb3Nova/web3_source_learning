import { useState, useEffect, useCallback } from 'react';
const useNetworkStatus = () => {
    const [networkStatus, setNetworkStatus] = useState({
        isOnline: navigator.onLine,
        isSlowConnection: false,
        connectionType: 'unknown',
        effectiveType: 'unknown',
        downlink: 0,
        rtt: 0,
    });
    const getNetworkInfo = useCallback(() => {
        const connection = navigator.connection ||
            navigator.mozConnection ||
            navigator.webkitConnection;
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
    const checkConnection = useCallback(async () => {
        try {
            const response = await fetch('/favicon.ico', {
                method: 'HEAD',
                cache: 'no-cache',
                signal: AbortSignal.timeout(5000),
            });
            return response.ok;
        }
        catch (error) {
            console.warn('Connection check failed:', error);
            return false;
        }
    }, []);
    const retryConnection = useCallback(async () => {
        const maxRetries = 3;
        const baseDelay = 1000;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const isConnected = await checkConnection();
                if (isConnected) {
                    return true;
                }
            }
            catch (error) {
                console.warn(`Connection retry ${attempt} failed:`, error);
            }
            if (attempt < maxRetries) {
                const delay = baseDelay * Math.pow(2, attempt - 1);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        return false;
    }, [checkConnection]);
    const updateNetworkStatus = useCallback(() => {
        const networkInfo = getNetworkInfo();
        setNetworkStatus(prev => ({
            ...prev,
            isOnline: navigator.onLine,
            ...networkInfo,
        }));
    }, [getNetworkInfo]);
    useEffect(() => {
        updateNetworkStatus();
        const handleOnline = () => {
            updateNetworkStatus();
            checkConnection().then(isActuallyOnline => {
                if (!isActuallyOnline) {
                    setNetworkStatus(prev => ({ ...prev, isOnline: false }));
                }
            });
        };
        const handleOffline = () => {
            updateNetworkStatus();
        };
        const handleConnectionChange = () => {
            updateNetworkStatus();
        };
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        const connection = navigator.connection ||
            navigator.mozConnection ||
            navigator.webkitConnection;
        if (connection) {
            connection.addEventListener('change', handleConnectionChange);
        }
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
