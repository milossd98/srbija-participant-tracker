import { ClientTable } from "@/components/ClientTable";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ClientWithLinks } from "@/types/database";

export const dynamic = "force-dynamic";

async function loadClients(): Promise<ClientWithLinks[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("clients")
      .select(
        `
        id,
        name,
        email,
        company,
        phone,
        notes,
        last_contact_at,
        created_at,
        updated_at,
        client_drive_links (
          id,
          client_id,
          label,
          url,
          link_date,
          created_at
        )
      `
      )
      .order("name", { ascending: true });

    if (error) {
      console.error(error);
      return [];
    }

    const rows = (data ?? []) as (ClientWithLinks & {
      client_drive_links: ClientWithLinks["client_drive_links"] | null;
    })[];

    return rows.map((row) => ({
      ...row,
      client_drive_links: row.client_drive_links ?? [],
    }));
  } catch (e) {
    console.error(e);
    return [];
  }
}

export default async function HomePage() {
  const hasEnv =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const clients = hasEnv ? await loadClients() : [];

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.25rem" }}>
      <header style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ margin: 0, fontSize: "1.5rem" }}>CRM — klijenti</h1>
        <p style={{ margin: "0.35rem 0 0", color: "var(--muted)", fontSize: "0.9rem" }}>
          Podaci iz Supabase-a. Žuti red: nema kontakta ili je poslednji stariji od 6 meseci.
        </p>
      </header>

      {!hasEnv && (
        <div
          style={{
            padding: "1rem",
            background: "#422006",
            border: "1px solid #a16207",
            borderRadius: 8,
            marginBottom: "1rem",
            fontSize: "0.9rem",
          }}
        >
          Postavi <code>NEXT_PUBLIC_SUPABASE_URL</code> i{" "}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> u <code>.env.local</code>, zatim pokreni
          migraciju iz <code>supabase/migrations/</code> na projektu.
        </div>
      )}

      <ClientTable clients={clients} />
    </main>
  );
}
