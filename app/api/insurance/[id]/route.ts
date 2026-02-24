import { NextRequest, NextResponse } from "next/server";
import { getPolicy } from "@/lib/contracts/insurance";
import { validateAuth, unauthorizedResponse } from "@/lib/auth";

// GET /api/insurance/:id
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!validateAuth(request)) {
    return unauthorizedResponse();
  }

  try {
    const policy = await getPolicy(params.id);
    return NextResponse.json({ policy });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      (error as { code?: string }).code === "NOT_FOUND"
    ) {
      return NextResponse.json({ error: "Policy not found" }, { status: 404 });
    }

    console.error("[GET /api/insurance/[id]]", error);
    return NextResponse.json(
      { error: "Failed to fetch policy from contract" },
      { status: 502 }
    );
  }
}