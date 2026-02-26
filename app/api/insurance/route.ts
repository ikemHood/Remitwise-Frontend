
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { compose, validatedRoute, withAuth } from "@/lib/auth/middleware";
// import { getActivePolicies } from "@/lib/contracts/insurance";
import { getActivePolicies } from "@/lib/contracts/insurance-cached";
import { validateAuth, unauthorizedResponse } from "@/lib/auth";

const billSchema = z.object({
  policyName: z.string().min(4, "Name is too short"),
  coverageType: z.enum(["Health", "Emergency", "Life"] as const, "Please select a coverage type"),
  monthlyPremium: z.coerce.number().positive().gt(0),
  coverageAmount: z.coerce.number().positive().gt(0)
});

const addInsuranceHandler = validatedRoute(billSchema, "body", async (req, data) => {

  // DB logic here

  return NextResponse.json({
    success: "Insurance added successfully",
    policyName: data.policyName,
    coverageType: data.coverageType,
    monthlyPremium: data.monthlyPremium,
    coverageAmount: data.coverageAmount,
  });
});

// if auth is needed on a route
// compose auth + validation — order matters: auth runs first
// export const POST = compose(withAuth)(addInsuranceHandler);

// if you don't need auth on a route, just export directly:



// GET /api/insurance
// Returns active policies for the authenticated owner.
// Query param: ?owner=G... (Stellar account address)
const getInsuranceHandler = async (request: NextRequest)=> {


  const { searchParams } = new URL(request.url);
  const owner = searchParams.get("owner");

  if (!owner) {
    return NextResponse.json(
      { error: "Missing required query parameter: owner" },
      { status: 400 }
    );
  }

  try {
    const policies = await getActivePolicies(owner);
    return NextResponse.json({ policies });
  } catch (error: unknown) {
    const err = error as { code?: string };

    if (err.code === "INVALID_ADDRESS") {
      return NextResponse.json({ error: "Invalid Stellar address" }, { status: 400 });
    }

    console.error("[GET /api/insurance]", error);
    return NextResponse.json(
      { error: "Failed to fetch policies from contract" },
      { status: 502 }
    );
  }

}


export const POST = compose(withAuth)(addInsuranceHandler);
export const GET = compose(withAuth)(getInsuranceHandler);
