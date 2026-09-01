import { describe, expect, it } from "vitest";

import { handleApiError } from "../../src/app/api/_lib/handle-api-error";
import { ServiceError } from "../../src/services/errors";

describe("handleApiError", () => {
  it("maps service errors to HTTP status", async () => {
    const response = handleApiError(new ServiceError("NOT_FOUND", "Not found"));
    expect(response.status).toBe(404);
    const body = (await response.json()) as { error: { message: string } };
    expect(body.error.message).toBe("Not found");
  });
});
