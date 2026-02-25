
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { validatedRoute } from "@/lib/auth/middleware";

const billSchema = z.object({
  policyName: z.string().min(4, "Name is too short"),
  coverageType: z.enum(["Health", "Emergency", "Life"] as const, "Please select a coverage type"),
  monthlyPremium: z.coerce.number().positive().gt(0),
  coverageAmount: z.coerce.number().positive().gt(0)
});

const addInsuranceHandler = validatedRoute(billSchema, async (req, data) => {

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
export const POST = addInsuranceHandler;