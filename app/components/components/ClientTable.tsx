"use client";

import { useState } from "react";
import type { ClientWithLinks } from "@/types/database";
import { isFollowUpOverdue } from "@/lib/followup";
import { ClientFormModal } from "./ClientFormModal";

type Props = {
  clients: ClientWithLinks[];
};

export function ClientTable({ clients }: Props) {
  const [editing, setEditing] = useState<ClientWithLinks | null>(null);
  const [adding, setAdding] = useState(false);

  return (
    <>
      <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "flex-end" }}>
        <button
          type="button"
          onClick={() => setAdding(true)}
          style={{
            background: "var(--accent)",
            border: "none",
            color: "#fff",
            borderRadius: 8,
            padding: "0.5rem 1rem",
            fontWeight: 600,
          }}
        >
          + Novi klijent
        </button>
      </div>

      <div style={{ overflowX: "auto", border: "1px solid var(--border)", borderRadius: 10 }}>
        <table>
          <thead>
            <tr>
              <th>Ime</th>
              <th>Kompanija</th>
              <th>Email</th>
              <th>Poslednji kontakt</th>
              <th>Drive linkovi</th>
              <th style={{ width: 100 }}>Akcije</th>
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ color: "var(--muted)", padding: "2rem" }}>
                  Nema klijenata. Dodaj prvog ili proveri Supabase konekciju.
                </td>
              </tr>
            ) : (
              clients.map((c) => {
                const stale = isFollowUpOverdue(c.last_contact_at);
                return (
                  <tr key={c.id} className={stale ? "row-stale" : undefined}>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td>{c.company ?? "—"}</td>
                    <td>{c.email ?? "—"}</td>
                    <td>
                      {c.last_contact_at
                        ? new Date(c.last_contact_at).toLocaleString("sr-RS")
                        : "—"}
                      {stale && (
                        <span
                          style={{
                            display: "block",
                            fontSize: "0.75rem",
                            color: "#fbbf24",
                            marginTop: 4,
                          }}
                        >
                          Follow-up (&gt; 6 mes.)
                        </span>
                      )}
                    </td>
                    <td>
                      {c.client_drive_links.length === 0 ? (
                        "—"
                      ) : (
                        <ul
                          style={{
                            margin: 0,
                            paddingLeft: "1.1rem",
                            fontSize: "0.9rem",
                          }}
                        >
                          {c.client_drive_links.map((l) => (
                            <li key={l.id} style={{ marginBottom: 4 }}>
                              <a href={l.url} target="_blank" rel="noreferrer">
                                {l.label}
                              </a>
                              <span style={{ color: "var(--muted)", marginLeft: 6 }}>
                                ({l.link_date})
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => setEditing(c)}
                        style={{
                          background: "transparent",
                          border: "1px solid var(--border)",
                          color: "var(--text)",
                          borderRadius: 6,
                          padding: "0.35rem 0.65rem",
                          fontSize: "0.85rem",
                        }}
                      >
                        Izmeni
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <ClientFormModal
        open={adding}
        onClose={() => setAdding(false)}
        client={null}
      />
      <ClientFormModal
        open={editing !== null}
        onClose={() => setEditing(null)}
        client={editing}
      />
    </>
  );
}
