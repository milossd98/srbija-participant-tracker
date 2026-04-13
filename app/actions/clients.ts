"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type DriveLinkInput = {
  id?: string;
  label: string;
  url: string;
  link_date: string;
};

export async function updateClient(
  clientId: string,
  data: {
    name: string;
    email: string;
    company: string;
    phone: string;
    notes: string;
    last_contact_at: string | null;
  },
  driveLinks: DriveLinkInput[]
) {
  const supabase = await createSupabaseServerClient();

  const { error: clientError } = await supabase
    .from("clients")
    .update({
      name: data.name.trim(),
      email: data.email.trim() || null,
      company: data.company.trim() || null,
      phone: data.phone.trim() || null,
      notes: data.notes.trim() || null,
      last_contact_at: data.last_contact_at,
      updated_at: new Date().toISOString(),
    })
    .eq("id", clientId);

  if (clientError) throw new Error(clientError.message);

  const { data: existingRows, error: fetchErr } = await supabase
    .from("client_drive_links")
    .select("id")
    .eq("client_id", clientId);

  if (fetchErr) throw new Error(fetchErr.message);

  const existingIds = new Set((existingRows ?? []).map((r) => r.id));
  const keptIds = new Set(
    driveLinks.filter((l) => l.id).map((l) => l.id as string)
  );

  const toDelete = [...existingIds].filter((id) => !keptIds.has(id));
  if (toDelete.length > 0) {
    const { error: delErr } = await supabase
      .from("client_drive_links")
      .delete()
      .in("id", toDelete);
    if (delErr) throw new Error(delErr.message);
  }

  for (const link of driveLinks) {
    const label = link.label.trim();
    const url = link.url.trim();
    if (!label && !url) continue;

    if (link.id && existingIds.has(link.id)) {
      const { error: upErr } = await supabase
        .from("client_drive_links")
        .update({
          label: label || "Link",
          url: url || "#",
          link_date: link.link_date || new Date().toISOString().slice(0, 10),
        })
        .eq("id", link.id);
      if (upErr) throw new Error(upErr.message);
    } else if (label || url) {
      const { error: insErr } = await supabase.from("client_drive_links").insert({
        client_id: clientId,
        label: label || "Google Drive",
        url: url || "#",
        link_date: link.link_date || new Date().toISOString().slice(0, 10),
      });
      if (insErr) throw new Error(insErr.message);
    }
  }

  revalidatePath("/");
}

export async function createClient(
  data: {
    name: string;
    email: string;
    company: string;
    phone: string;
    notes: string;
    last_contact_at: string | null;
  },
  driveLinks: DriveLinkInput[]
) {
  const supabase = await createSupabaseServerClient();

  const { data: row, error: insClientErr } = await supabase
    .from("clients")
    .insert({
      name: data.name.trim(),
      email: data.email.trim() || null,
      company: data.company.trim() || null,
      phone: data.phone.trim() || null,
      notes: data.notes.trim() || null,
      last_contact_at: data.last_contact_at,
    })
    .select("id")
    .single();

  if (insClientErr) throw new Error(insClientErr.message);
  const clientId = row.id as string;

  for (const link of driveLinks) {
    const label = link.label.trim();
    const url = link.url.trim();
    if (!label && !url) continue;
    const { error: insErr } = await supabase.from("client_drive_links").insert({
      client_id: clientId,
      label: label || "Google Drive",
      url: url || "#",
      link_date: link.link_date || new Date().toISOString().slice(0, 10),
    });
    if (insErr) throw new Error(insErr.message);
  }

  revalidatePath("/");
}
