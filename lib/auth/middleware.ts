import { z } from 'zod';
import { NextRequest, NextResponse } from "next/server";

export type ActionState = {
  error?: string;
  success?: string;
  validationErrors?: {path: string, message: string}[]
  [key: string]: any; // This allows for additional properties
};

// type ValidatedActionFunction<S extends z.ZodType<any, any>, T> = (
//   data: z.infer<S>,
//   formData: FormData
// ) => Promise<T>;

// export function validatedAction<S extends z.ZodType<any, any>, T>(
//   schema: S,
//   action: ValidatedActionFunction<S, T>
// ) {
//   return async (prevState: ActionState, formData: FormData) => {
//     const result = schema.safeParse(Object.fromEntries(formData));
//     console.log(result, 'result')
//     if (!result.success) {
//       return { validationErrors: result.error.issues.map((err)=> ({message: err.message, path: err.path[0]})) };
//     }

//     return action(result.data, formData);
//   };
// }



type RouteHandler<S extends z.ZodType<any, any>> = (
  req: NextRequest,
  data: z.infer<S>
) => Promise<NextResponse>;

export function validatedRoute<S extends z.ZodType<any, any>>(
  schema: S,
  handler: RouteHandler<S>
) {
  return async (req: NextRequest) => {
    const contentType = req.headers.get("content-type") || "";

    const raw = contentType.includes("application/json")
      ? await req.json()
      : Object.fromEntries(await req.formData());

    const result = schema.safeParse(raw);
    console.log(result, 'result')

    if (!result.success) {
      return NextResponse.json(
        {
          validationErrors: result.error.issues.map((err) => ({
            message: err.message,
            path: err.path[0],
          })),
          // ...(result.data ? { fields: result.data })
        },
        { status: 400 }
      );
    }

    return handler(req, result.data);
  };
}


type NextHandler = (req: NextRequest) => Promise<NextResponse>;


export function withAuth(handler: NextHandler) {
  return async (req: NextRequest) => {
    const session = ()=> "sessionToken"; // your session logic
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return handler(req);
  };
}

// compose multiple middlewares left to right
export function compose(...middlewares: Array<(h: NextHandler) => NextHandler>) {
  return (handler: NextHandler): NextHandler =>
    middlewares.reduceRight((acc, mw) => mw(acc), handler);
}