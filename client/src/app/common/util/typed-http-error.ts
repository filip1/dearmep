import { HttpErrorResponse } from "@angular/common/http";

export interface TypedHttpError<T> extends HttpErrorResponse {
  readonly error: T | null | undefined
}
