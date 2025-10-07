// env.ts
import { z } from "zod";

/** Public (client-safe) variables — must exist at build time */
const publicSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().url(),
  NEXT_PUBLIC_API_MOCKING: z.enum(["enabled", "disabled"]).default("disabled"),
  NEXT_PUBLIC_DEBUG: z.enum(["true", "false"]).default("false"),
  NEXT_PUBLIC_LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

/** Server-only variables — optional so this module can be imported on client */
const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("production"),
  BACKBLAZE_APPLICATION_KEY_ID: z.string().optional(),
  BACKBLAZE_APPLICATION_KEY: z.string().optional(),
  BACKBLAZE_BUCKET_NAME: z.string().optional(),
  BACKBLAZE_BUCKET_ID: z.string().optional(),
  BACKBLAZE_ENDPOINT: z.string().url().optional(),
  BACKBLAZE_REGION: z.string().optional(),
  BACKBLAZE_CUSTOM_DOMAIN: z.string().optional(),
  BACKBLAZE_URL_EXPIRATION: z
    .string()
    .transform((v) => (v ? Number(v) : undefined))
    .optional(),
});

const publicEnv = publicSchema.parse({
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_API_MOCKING: process.env.NEXT_PUBLIC_API_MOCKING,
  NEXT_PUBLIC_DEBUG: process.env.NEXT_PUBLIC_DEBUG,
  NEXT_PUBLIC_LOG_LEVEL: process.env.NEXT_PUBLIC_LOG_LEVEL,
});

const serverEnv = serverSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  BACKBLAZE_APPLICATION_KEY_ID: process.env.BACKBLAZE_APPLICATION_KEY_ID,
  BACKBLAZE_APPLICATION_KEY: process.env.BACKBLAZE_APPLICATION_KEY,
  BACKBLAZE_BUCKET_NAME: process.env.BACKBLAZE_BUCKET_NAME,
  BACKBLAZE_BUCKET_ID: process.env.BACKBLAZE_BUCKET_ID,
  BACKBLAZE_ENDPOINT: process.env.BACKBLAZE_ENDPOINT,
  BACKBLAZE_REGION: process.env.BACKBLAZE_REGION,
  BACKBLAZE_CUSTOM_DOMAIN: process.env.BACKBLAZE_CUSTOM_DOMAIN,
  BACKBLAZE_URL_EXPIRATION: process.env.BACKBLAZE_URL_EXPIRATION,
});

export const env = { ...publicEnv, ...serverEnv };

// Convenience helpers
export const isDevelopment = () => env.NODE_ENV === "development";
export const isProduction = () => env.NODE_ENV === "production";
export const isTest = () => env.NODE_ENV === "test";
export const isApiMockingEnabled = () => env.NEXT_PUBLIC_API_MOCKING === "enabled";
export const isDebugEnabled = () => env.NEXT_PUBLIC_DEBUG === "true";

/** Only returns server config on the server */
export const getBackblazeConfig = () => {
  if (typeof window !== "undefined") return undefined;
  return {
    applicationKeyId: env.BACKBLAZE_APPLICATION_KEY_ID,
    applicationKey: env.BACKBLAZE_APPLICATION_KEY,
    bucketName: env.BACKBLAZE_BUCKET_NAME,
    bucketId: env.BACKBLAZE_BUCKET_ID,
    endpoint: env.BACKBLAZE_ENDPOINT,
    region: env.BACKBLAZE_REGION,
    customDomain: env.BACKBLAZE_CUSTOM_DOMAIN,
    urlExpiration: env.BACKBLAZE_URL_EXPIRATION,
  };
};

