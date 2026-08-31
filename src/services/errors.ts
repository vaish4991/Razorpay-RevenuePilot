export type ServiceErrorCode =
  | "BAD_REQUEST"
  | "NOT_FOUND"
  | "CONFLICT"
  | "PRECONDITION_FAILED"
  | "INTERNAL_ERROR";

export class ServiceError extends Error {
  readonly code: ServiceErrorCode;
  readonly details?: unknown;

  constructor(code: ServiceErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = "ServiceError";
    this.code = code;
    this.details = details;
  }
}

export function serviceErrorToStatusCode(error: ServiceError): number {
  switch (error.code) {
    case "BAD_REQUEST":
      return 400;
    case "NOT_FOUND":
      return 404;
    case "CONFLICT":
      return 409;
    case "PRECONDITION_FAILED":
      return 412;
    default:
      return 500;
  }
}
