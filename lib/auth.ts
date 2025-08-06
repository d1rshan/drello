import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "@/lib/db/index";
import * as schema from "@/lib/db/schema"; // path must match your schema file

import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  user: {
    modelName: "usersTable",
  },
  session: {
    modelName: "sessionsTable",
  },
  account: {
    modelName: "accountsTable",
    accountLinking: {
      // this will make sure if user signed up with email and tries to continue with google then it is the same user
      enabled: true,
    },
  },
  verification: {
    modelName: "verificationsTable",
  },
  database: drizzleAdapter(db, {
    schema,
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },

  plugins: [nextCookies()], // Now, when you call functions that set cookies, they will be automatically set. (like sign in, sign up)
  // TODO:
  //   socialProviders: {
  //     github: {
  //       clientId: process.env.GITHUB_CLIENT_ID as string,
  //       clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
  //     },
  //   },
});
