import { ServiceError } from "@/services/errors";

export type CatalogSortBy = "name" | "price" | "createdAt";
export type SortOrder = "asc" | "desc";

export type SearchProductsInput = {
  query?: string;
  category?: string;
  minPriceInPaise?: number;
  maxPriceInPaise?: number;
  activeOnly: boolean;
  page: number;
  pageSize: number;
  sortBy: CatalogSortBy;
  sortOrder: SortOrder;
};

function parseIntParam(value: string | null, fieldName: string): number | undefined {
  if (value === null || value === "") {
    return undefined;
  }
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed)) {
    throw new ServiceError("BAD_REQUEST", `${fieldName} must be an integer`);
  }
  return parsed;
}

export function parseSearchProductsInput(searchParams: URLSearchParams): SearchProductsInput {
  const query = searchParams.get("query")?.trim() || undefined;
  const category = searchParams.get("category")?.trim() || undefined;
  const minPriceInPaise = parseIntParam(searchParams.get("minPriceInPaise"), "minPriceInPaise");
  const maxPriceInPaise = parseIntParam(searchParams.get("maxPriceInPaise"), "maxPriceInPaise");
  const page = parseIntParam(searchParams.get("page"), "page") ?? 1;
  const pageSize = parseIntParam(searchParams.get("pageSize"), "pageSize") ?? 10;
  const sortBy = (searchParams.get("sortBy") as CatalogSortBy | null) ?? "name";
  const sortOrder = (searchParams.get("sortOrder") as SortOrder | null) ?? "asc";
  const activeOnly = searchParams.get("activeOnly") !== "false";

  if (page < 1) {
    throw new ServiceError("BAD_REQUEST", "page must be >= 1");
  }
  if (pageSize < 1 || pageSize > 100) {
    throw new ServiceError("BAD_REQUEST", "pageSize must be between 1 and 100");
  }
  if (minPriceInPaise !== undefined && minPriceInPaise < 0) {
    throw new ServiceError("BAD_REQUEST", "minPriceInPaise cannot be negative");
  }
  if (maxPriceInPaise !== undefined && maxPriceInPaise < 0) {
    throw new ServiceError("BAD_REQUEST", "maxPriceInPaise cannot be negative");
  }
  if (
    minPriceInPaise !== undefined &&
    maxPriceInPaise !== undefined &&
    minPriceInPaise > maxPriceInPaise
  ) {
    throw new ServiceError("BAD_REQUEST", "minPriceInPaise cannot exceed maxPriceInPaise");
  }
  if (!["name", "price", "createdAt"].includes(sortBy)) {
    throw new ServiceError("BAD_REQUEST", "Invalid sortBy value");
  }
  if (!["asc", "desc"].includes(sortOrder)) {
    throw new ServiceError("BAD_REQUEST", "Invalid sortOrder value");
  }

  return {
    query,
    category,
    minPriceInPaise,
    maxPriceInPaise,
    activeOnly,
    page,
    pageSize,
    sortBy,
    sortOrder,
  };
}
