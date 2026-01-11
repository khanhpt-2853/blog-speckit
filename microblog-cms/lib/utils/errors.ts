import { NextResponse } from "next/server";

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "RATE_LIMIT_EXCEEDED"
  | "INTERNAL_ERROR";

export interface ApiError {
  code: ApiErrorCode;
  message: string;
  details?: Record<string, string[]>;
}

/**
 * Create a standardized error response
 * @param code - Error code
 * @param message - Error message
 * @param status - HTTP status code
 * @param details - Optional field-level error details
 */
export function createErrorResponse(
  code: ApiErrorCode,
  message: string,
  status: number,
  details?: Record<string, string[]>
) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
    },
    { status }
  );
}

/**
 * Create a standardized success response
 * @param data - Response data
 * @param meta - Optional metadata (pagination, etc.)
 */
export function createSuccessResponse<T>(data: T, meta?: Record<string, unknown>) {
  return NextResponse.json({
    success: true,
    data,
    ...(meta && { meta }),
  });
}

/**
 * Validation error response (400)
 */
export function validationError(message: string, details?: Record<string, string[]>) {
  return createErrorResponse("VALIDATION_ERROR", message, 400, details);
}

/**
 * Unauthorized error response (401)
 */
export function unauthorizedError(message: string = "Authentication required") {
  return createErrorResponse("UNAUTHORIZED", message, 401);
}

/**
 * Forbidden error response (403)
 */
export function forbiddenError(message: string = "Insufficient permissions") {
  return createErrorResponse("FORBIDDEN", message, 403);
}

/**
 * Not found error response (404)
 */
export function notFoundError(message: string = "Resource not found") {
  return createErrorResponse("NOT_FOUND", message, 404);
}

/**
 * Rate limit error response (429)
 */
export function rateLimitError(retryAfter?: number) {
  const response = createErrorResponse(
    "RATE_LIMIT_EXCEEDED",
    "Too many requests. Please try again later.",
    429
  );

  if (retryAfter) {
    response.headers.set("Retry-After", retryAfter.toString());
  }

  return response;
}

/**
 * Internal server error response (500)
 */
export function internalError(message: string = "An unexpected error occurred") {
  return createErrorResponse("INTERNAL_ERROR", message, 500);
}
