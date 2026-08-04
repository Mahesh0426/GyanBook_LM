import type { NextFunction, Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.js";

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  // Get the user's session
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session?.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  //   Attach session to request
  req.session = session;
  next();
};
// behind the scene of requireAuth middleware
// Browser -> Cookie: session_token=abc123 ->
// Express request -> requireAuth middleware -> Better Auth getSession() ->
// Check PostgreSQL Session table
