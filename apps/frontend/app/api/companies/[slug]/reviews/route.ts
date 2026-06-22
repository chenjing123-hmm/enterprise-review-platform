import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

interface Review {
  id: string;
  content: string;
  issues: string;
  tags: string[];
  city: string;
  sourceCount: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Find company by slug
    const companiesPath = path.join(process.cwd(), "data", "companies.json");
    if (!fs.existsSync(companiesPath)) {
      return NextResponse.json({ reviews: [], total: 0 });
    }

    const companiesRaw = fs.readFileSync(companiesPath, "utf-8");
    const companies = JSON.parse(companiesRaw);
    const company = companies.find((c: any) => c.slug === slug);

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Load reviews
    const reviewPath = path.join(
      process.cwd(),
      "data",
      "reviews",
      `${company.id}.json`
    );

    if (!fs.existsSync(reviewPath)) {
      return NextResponse.json({ reviews: [], total: 0 });
    }

    const reviewRaw = fs.readFileSync(reviewPath, "utf-8");
    const reviewData = JSON.parse(reviewRaw);

    return NextResponse.json({
      companyName: reviewData.companyName,
      city: reviewData.city,
      reviews: reviewData.reviews as Review[],
      total: reviewData.reviews.length,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}