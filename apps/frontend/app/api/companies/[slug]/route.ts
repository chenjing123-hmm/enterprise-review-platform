import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dataPath = path.join(process.cwd(), "data", "companies.json");

interface Company {
  id: string;
  name: string;
  slug: string;
  city: string;
  reviewCount: number;
  summary: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    if (!fs.existsSync(dataPath)) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const raw = fs.readFileSync(dataPath, "utf-8");
    const companies: Company[] = JSON.parse(raw);

    const company = companies.find((c) => c.slug === slug);
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}