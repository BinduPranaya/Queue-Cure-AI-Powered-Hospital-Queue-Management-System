package com.queuecure.dto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Standard error response shape returned by the global exception handler.
 */
public record ApiErrorResponse(
        LocalDateTime timestamp,
        int status,
        String error,
        String message,
        List<String> details
) {
    public static ApiErrorResponse of(int status, String error, String message) {
        return new ApiErrorResponse(LocalDateTime.now(), status, error, message, null);
    }

    public static ApiErrorResponse of(int status, String error, String message, List<String> details) {
        return new ApiErrorResponse(LocalDateTime.now(), status, error, message, details);
    }
}
