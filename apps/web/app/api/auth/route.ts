// app/api/auth/route.ts
export async function GET() {
  return new Response(
    JSON.stringify({
      message: "NextAuth API root — use /api/auth/signin/google for OAuth",
      ok: true,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
