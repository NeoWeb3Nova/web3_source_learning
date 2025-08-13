export var ApiStatus;
(function (ApiStatus) {
    ApiStatus["SUCCESS"] = "success";
    ApiStatus["ERROR"] = "error";
    ApiStatus["LOADING"] = "loading";
})(ApiStatus || (ApiStatus = {}));
export var ApiErrorType;
(function (ApiErrorType) {
    ApiErrorType["NETWORK_ERROR"] = "network_error";
    ApiErrorType["TIMEOUT_ERROR"] = "timeout_error";
    ApiErrorType["VALIDATION_ERROR"] = "validation_error";
    ApiErrorType["AUTHENTICATION_ERROR"] = "authentication_error";
    ApiErrorType["AUTHORIZATION_ERROR"] = "authorization_error";
    ApiErrorType["NOT_FOUND_ERROR"] = "not_found_error";
    ApiErrorType["SERVER_ERROR"] = "server_error";
    ApiErrorType["RATE_LIMIT_ERROR"] = "rate_limit_error";
    ApiErrorType["UNKNOWN_ERROR"] = "unknown_error";
})(ApiErrorType || (ApiErrorType = {}));
