import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function getServerUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) return null;

  return {
    email: session.user.email,
    name: session.user.name,
    user_id: (session.user as any).user_id,
    user_type: (session.user as any).user_type,
  };
}
