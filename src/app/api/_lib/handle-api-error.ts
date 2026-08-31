import { NextResponse } from "next/server";

import { ServiceError, serviceErrorToStatusCode } from "@/services/errors";

export function handleApiError(error: unknown) {
  if (error instanceof ServiceError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
      { status: serviceErrorToStatusCode(error) },
    );
  }

  console.error("Unhandled API error", error);
  return NextResponse.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "Unexpected server error",
      },
    },
    { status: 500 },
  );
}
