import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb://localhost:27017/foodzen";

const client = new MongoClient(MONGODB_URI);
await client.connect();
const db = client.db();

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client, // enables transactions
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || "http://localhost:3000",
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  ],
});
