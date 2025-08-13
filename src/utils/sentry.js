export const initSentry = () => {
    console.log('Sentry would be initialized here in production');
};
export const setSentryUser = (user) => {
    console.log('Sentry user would be set:', user);
};
export const setSentryTag = (key, value) => {
    console.log('Sentry tag would be set:', key, value);
};
export const setSentryContext = (key, context) => {
    console.log('Sentry context would be set:', key, context);
};
export const captureException = (error, context) => {
    console.error('Sentry would capture exception:', error, context);
};
export const captureMessage = (message, level = 'info') => {
    console.log('Sentry would capture message:', message, level);
};
export const addBreadcrumb = (breadcrumb) => {
    console.log('Sentry would add breadcrumb:', breadcrumb);
};
export const startTransaction = (name, op) => {
    console.log('Sentry would start transaction:', name, op);
    return {
        finish: () => console.log('Transaction finished'),
        setTag: (key, value) => console.log('Transaction tag:', key, value),
    };
};
export const SentryErrorBoundary = (component) => component;
export const withSentryProfiling = (component) => component;
