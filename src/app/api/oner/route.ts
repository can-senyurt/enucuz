import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getRepository } from "@/data/repository";

/**
 * GET /api/oner?q=ayak : type-ahead suggestions for the search box.
 * The query comes from the URL, so it is validated before use.
 */
const querySchema = z.string().trim().min(1).max(60);

export async function GET(request: NextRequest) {
  const parsed = querySchema.safeParse(
    request.nextUrl.searchParams.get("q") ?? "",
  );
  if (!parsed.success) {
    return NextResponse.json(
      { products: [], categories: [], brands: [] },
      { status: 200 },
    );
  }
  const result = await getRepository().suggest(parsed.data, 4);
  return NextResponse.json(result, {
    // Suggestions are the same for everyone, so browsers and the CDN may reuse them briefly.
    headers: { "Cache-Control": "public, max-age=30, s-maxage=60" },
  });
}
