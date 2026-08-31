import type { Prisma, PrismaClient } from "@prisma/client";

import { ServiceError } from "@/services/errors";
import type { SearchProductsInput } from "@/validation/catalog";

export type CatalogProduct = {
  id: string;
  merchantId: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  priceInPaise: number;
  currency: string;
  inventoryQuantity: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type SearchProductsResult = {
  products: CatalogProduct[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

const productSelect = {
  id: true,
  merchantId: true,
  name: true,
  slug: true,
  description: true,
  category: true,
  priceInPaise: true,
  currency: true,
  inventoryQuantity: true,
  active: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ProductSelect;

function getOrderBy(sortBy: SearchProductsInput["sortBy"], sortOrder: SearchProductsInput["sortOrder"]) {
  if (sortBy === "price") {
    return [{ priceInPaise: sortOrder }, { id: "asc" }] satisfies Prisma.ProductOrderByWithRelationInput[];
  }

  if (sortBy === "createdAt") {
    return [{ createdAt: sortOrder }, { id: "asc" }] satisfies Prisma.ProductOrderByWithRelationInput[];
  }

  return [{ name: sortOrder }, { id: "asc" }] satisfies Prisma.ProductOrderByWithRelationInput[];
}

export async function searchProducts(
  prisma: PrismaClient,
  merchantId: string,
  input: SearchProductsInput,
): Promise<SearchProductsResult> {
  const where: Prisma.ProductWhereInput = {
    merchantId,
    ...(input.activeOnly ? { active: true } : {}),
    ...(input.category ? { category: { equals: input.category, mode: "insensitive" } } : {}),
    ...(input.query
      ? {
          OR: [
            { name: { contains: input.query, mode: "insensitive" } },
            { description: { contains: input.query, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(input.minPriceInPaise !== undefined || input.maxPriceInPaise !== undefined
      ? {
          priceInPaise: {
            ...(input.minPriceInPaise !== undefined ? { gte: input.minPriceInPaise } : {}),
            ...(input.maxPriceInPaise !== undefined ? { lte: input.maxPriceInPaise } : {}),
          },
        }
      : {}),
  };

  const [products, totalCount] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      orderBy: getOrderBy(input.sortBy, input.sortOrder),
      skip: (input.page - 1) * input.pageSize,
      take: input.pageSize,
      select: productSelect,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    page: input.page,
    pageSize: input.pageSize,
    totalCount,
    totalPages: Math.max(1, Math.ceil(totalCount / input.pageSize)),
  };
}

export async function getProduct(prisma: PrismaClient, merchantId: string, productId: string) {
  const product = await prisma.product.findFirst({
    where: { id: productId, merchantId },
    select: productSelect,
  });

  if (!product) {
    throw new ServiceError("NOT_FOUND", "Product not found");
  }

  return product;
}

export async function getProductBySlug(prisma: PrismaClient, merchantId: string, slug: string) {
  const product = await prisma.product.findUnique({
    where: {
      merchantId_slug: {
        merchantId,
        slug,
      },
    },
    select: productSelect,
  });

  if (!product) {
    throw new ServiceError("NOT_FOUND", "Product not found");
  }

  return product;
}
