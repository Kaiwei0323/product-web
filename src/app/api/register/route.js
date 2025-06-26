import { User } from "../../models/User";
import mongoose from "mongoose";
import { withRateLimit } from "../../models/RateLimiter";

async function createUser(req) {
  const body = await req.json();
  await mongoose.connect(process.env.MONGO_URL);
  const createdUser = await User.create(body);
  return Response.json(createdUser);
}

export const POST = withRateLimit(createUser, { limit: 100, windowMs: 1000 });
