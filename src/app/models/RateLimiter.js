import mongoose from "mongoose";

const RateLimitSchema = new mongoose.Schema({
  key: String, // IP or user identifier
  count: Number,
  lastRequest: Date,
});

const RateLimit = mongoose.models.RateLimit || mongoose.model("RateLimit", RateLimitSchema);

export function withRateLimit(handler, options = { limit: 10, windowMs: 60000 }) {
  return async (req) => {
    await mongoose.connect(process.env.MONGO_URL);

    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const now = new Date();
    const windowStart = new Date(now - options.windowMs);

    const record = await RateLimit.findOne({ key: ip });

    if (!record || record.lastRequest < windowStart) {
      await RateLimit.findOneAndUpdate(
        { key: ip },
        { count: 1, lastRequest: now },
        { upsert: true, new: true }
      );
    } else if (record.count >= options.limit) {
      const retryAfter = options.windowMs - (now - record.lastRequest);
      return new Response(
        JSON.stringify({
          error: `Rate limit exceeded. Try again in ${Math.ceil(retryAfter / 1000)} seconds.`,
        }),
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(retryAfter / 1000).toString(),
          },
        }
      );
    } else {
      await RateLimit.updateOne(
        { key: ip },
        { $inc: { count: 1 }, $set: { lastRequest: now } }
      );
    }

    return handler(req);
  };
}
