import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Load companies data
const dataPath = path.join(process.cwd(), "data", "companies.json");

interface Company {
  id: string;
  name: string;
  slug: string;
  city: string;
  reviewCount: number;
  summary: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const city = searchParams.get("city") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!fs.existsSync(dataPath)) {
      return NextResponse.json({ companies: [], total: 0 });
    }

    const raw = fs.readFileSync(dataPath, "utf-8");
    let companies: Company[] = JSON.parse(raw);

    // Filter by search query
    if (q) {
      const lower = q.toLowerCase();
      companies = companies.filter(
        (c) =>
          c.name.toLowerCase().includes(lower) ||
          c.slug.toLowerCase().includes(lower) ||
          (c.city && c.city.toLowerCase().includes(lower))
      );
    }

    // Filter by city
    if (city) {
      companies = companies.filter((c) => c.city === city);
    }

    // Sort by review count descending
    companies.sort((a, b) => b.reviewCount - a.reviewCount);

    const total = companies.length;
    const start = (page - 1) * limit;
    const paged = companies.slice(start, start + limit);

    return NextResponse.json({
      companies: paged,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}