import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/server";
import { ApiError } from "@/lib/api";
import type { UserRole } from "@/types";

const ADMIN_ROLES: UserRole[] = ["super_admin", "quiz_admin", "quiz_host"];

export async function getAuthenticatedUser(): Promise<User> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new ApiError(
      "unauthorized",
      "Unable to verify the authenticated user.",
      401
    );
  }

  if (!user) {
    throw new ApiError("unauthorized", "Authentication is required.", 401);
  }

  return user;
}

export async function getAuthenticatedUserRole(
  userId: string
): Promise<UserRole> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (error) {
    throw new ApiError(
      "internal_error",
      "Unable to load the user's role.",
      500
    );
  }

  if (!isUserRole(data.role)) {
    throw new ApiError("forbidden", "The user's role is not valid.", 403);
  }

  return data.role;
}

export async function requireRole(
  allowedRoles: readonly UserRole[]
): Promise<{ user: User; role: UserRole }> {
  const user = await getAuthenticatedUser();
  const role = await getAuthenticatedUserRole(user.id);

  if (!allowedRoles.includes(role)) {
    throw new ApiError("forbidden", "You do not have permission for this action.", 403);
  }

  return { user, role };
}

export async function requireAdmin(): Promise<{
  user: User;
  role: UserRole;
}> {
  return requireRole(ADMIN_ROLES);
}

function isUserRole(value: unknown): value is UserRole {
  return (
    typeof value === "string" &&
    (value === "super_admin" ||
      value === "quiz_admin" ||
      value === "quiz_host" ||
      value === "participant")
  );
}
