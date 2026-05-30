// Public entrypoint for the shared data-access layer.
// Apps import the singleton client and all Prisma model types/enums from here
// (never directly from "@prisma/client") — see ADR-0003.

export { prisma } from "./client";

// Re-export the generated Prisma types, enums, and the Prisma namespace so
// consumers get model types (User, Listing, ...), enums (UserType, AdminRole,
// ModerationStatus, ...), and Prisma.* utility types from a single module.
export * from "@prisma/client";
