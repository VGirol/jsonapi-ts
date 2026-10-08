import { ErrorInterceptor } from "../types";

// Returns the error instead of rejecting it, so that the error interceptors registered after this one still run.
export const ResponseErrorInterceptor: ErrorInterceptor = (error: unknown): unknown => error;
