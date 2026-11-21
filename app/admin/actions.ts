"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdmin, login, logout } from "@/lib/auth";
import { isValidUrl, saveSlot, seedSlots } from "@/lib/sheets";

export async function loginAction(formData: FormData) {
  const ok = await login(String(formData.get("password") || ""));
  redirect(ok ? "/admin" : "/admin?error=1");
}

export async function logoutAction() {
  await logout();
  redirect("/admin");
}

export async function saveAction(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin");
  const slug = String(formData.get("slug") || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-");
  const nama = String(formData.get("nama") || "").trim();
  const url = String(formData.get("url") || "").trim();
  // url kosong = lepaskan pasangan; selain itu harus link yang valid
  if (!slug || (url && !isValidUrl(url))) redirect(`/admin?error=input#${slug}`);
  await saveSlot(slug, nama || slug, url);
  revalidatePath("/admin");
  redirect(`/admin?ok=${slug}#${slug}`);
}

export async function seedAction() {
  if (!(await isAdmin())) redirect("/admin");
  await seedSlots(50);
  revalidatePath("/admin");
  redirect("/admin?ok=seed");
}
