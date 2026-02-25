
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { compose, validatedRoute, withAuth } from "@/lib/auth/middleware";

const billSchema = z.object({
  name: z.string().min(4, "Name is too short"),
  amount: z.coerce.number().positive().gt(0),
  dueDate: z.coerce.date(),
  recurring: z.preprocess((val) => val === "on" || val === true, z.boolean()),
});

const addBillHandler = validatedRoute(billSchema, "body", async (req, data) => {
  // data is fully typed as { name: string, amount: number, dueDate: Date, recurring: boolean }
//   console.log(data, 'data in handler');

  // your DB logic here

  return NextResponse.json({
    success: "Bill added successfully",
    name: data.name,
    amount: data.amount,
  });
});

// if auth is needed on a route
// compose auth + validation — order matters: auth runs first
// export const POST = compose(withAuth)(addBillHandler);

// if you don't need auth on a route, just export directly:
// export const POST = addBillHandler;
// import { withAuth } from '@/lib/auth';

async function getHandler(request: NextRequest) {
  // TODO: Fetch bills from Soroban bill_payments contract
  return NextResponse.json({ bills: [] });
}


export const GET = compose(withAuth)(getHandler);
export const POST = compose(withAuth)(addBillHandler);
