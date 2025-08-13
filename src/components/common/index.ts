// Common components exports
export { default as LoadingSkeleton } from './LoadingSkeleton';
export { default as ErrorBoundary } from './ErrorBoundary';
export { default as NetworkStatus, NetworkRetry, useNetworkStatus } from './NetworkStatus';

// Responsive components
export {
  ResponsiveContainer,
  ResponsiveGrid,
  ResponsiveCard,
  ResponsivePage,
} from './ResponsiveContainer';

// Touch optimized components
export {
  TouchOptimizedBox,
  TouchOptimizedButton,
  TouchOptimizedIconButton,
  TouchOptimizedLink,
} from './TouchOptimized';

// Platform adaptive components
export {
  PlatformAdaptiveBox,
  PlatformAdaptiveButton,
  PlatformAdaptiveIconButton,
  SafeAreaBox,
  ThemeToggle,
  usePlatformDetection,
} from './PlatformAdaptive';

// Enhanced skeleton components
export {
  EnhancedSkeleton,
  CardSkeleton,
  ListSkeleton,
  TableSkeleton,
  VisualFeedback,
} from './LoadingSkeleton';

// Hooks
export { useResponsive, useThemeToggle, DeviceType, ScreenOrientation } from '@/hooks/useResponsive';

// Data persistence components
export { DataBackup, StorageStatusIndicator } from './DataBackup';
export { AutoSaveStatus, FloatingAutoSaveStatus } from './AutoSaveStatus';

// Data persistence hooks
export { useDataPersistence, useAppStateRestore } from '@/hooks/useDataPersistence';

// App state restore components
export { 
  AppStateRestore, 
  RestoreSuccessIndicator, 
  DataMigrationPrompt 
} from './AppStateRestore';

// Pull to refresh components
export { 
  PullToRefresh, 
  SimplePullToRefresh, 
  CustomRefreshIndicator 
} from './PullToRefresh';

// Content update components
export { 
  ContentUpdateNotification, 
  UpdateBanner, 
  FloatingUpdateButton,
  UpdateType,
  UpdateStatus 
} from './ContentUpdateNotification';

// Pull to refresh and content update hooks
export { usePullToRefresh, PullToRefreshState } from '@/hooks/usePullToRefresh';
export { useContentUpdate } from '@/hooks/useContentUpdate';

// Error handling components
export { ErrorBoundary, SimpleErrorBoundary, useErrorHandler } from './ErrorBoundary';
export { 
  NetworkStatusIndicator, 
  OfflineAlert, 
  NetworkRetry, 
  NetworkStatusProvider,
  useNetworkStatus,
  NetworkStatus 
} from './NetworkStatus';
export { 
  useFormValidation, 
  FormField, 
  ErrorSummary, 
  SuccessMessage, 
  ValidationIndicator,
  ValidationRules 
} from './FormValidation';
export { 
  useErrorHandler as useErrorHandlerAdvanced, 
  ErrorDisplay, 
  ErrorList, 
  ErrorModal,
  createError,
  ErrorType,
  ErrorSeverity 
} from './ErrorHandler';