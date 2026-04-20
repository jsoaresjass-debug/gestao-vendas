import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireUserEmail(allowedEmail: string) {
  const user = await requireUser();
  const email = user.email?.toLowerCase() ?? "";

  if (email !== allowedEmail.toLowerCase()) {
    redirect("/home");
  }

  return user;
}
