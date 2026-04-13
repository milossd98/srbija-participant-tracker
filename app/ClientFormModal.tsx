"use client";

import { useEffect, useState } from "react";
import {
  createClient,
  updateClient,
  type DriveLinkInput,
} from "@/app/actions/clients";
import type { ClientWithLinks } from "@/types/database";

type Props = {
  open: boolean;
  onClose: () => void;
  client: ClientWithLinks | null;
};

function emptyLink(): DriveLinkInput {
  return {
    label: "",
    url: "",
    link_date: new Date().toISOString().slice(0, 10),
  };
}

export function ClientFormModal({ open, onClose, client }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [lastContact, setLastContact] = useState("");
  const [links, setLinks] = useState<DriveLinkInput[]>([emptyLink()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (client) {
      setName(client.name);
      setEmail(client.email ?? "");
      setCompany(client.company ?? "");
      setPhone(client.phone ?? "");
      setNotes(client.notes ?? "");
      setLastContact(
        client.last_contact_at
          ? client.last_contact_at.slice(0, 16)
          : ""
      );
      const existing = client.client_drive_links;
      setLinks(
        existing.length > 0
          ? existing.map((l) => ({
              id: l.id,
              label: l.label,
              url: l.url,
              link_date: l.link_date.slice(0, 10),
            }))
          : [emptyLink()]
      );
    } else {
      setName("");
      setEmail("");
      setCompany("");
      setPhone("");
      setNotes("");
      setLastContact("");
      setLinks([emptyLink()]);
    }
  }, [open, client]);

  if (!open) return null;

  const lastContactIso = lastContact.trim()
    ? new Date(lastContact).toISOString()
    : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Ime je obavezno.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name,
        email,
        company,
        phone,
        notes,
        last_contact_at: lastContactIso,
      };
      if (client) {
        await updateClient(client.id, payload, links);
      } else {
        await createClient(payload, links);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Greška pri čuvanju.");
    } finally {
      setSaving(false);
    }
  }

  function addLinkRow() {
    setLinks((prev) => [...prev, emptyLink()]);
  }

  function removeLinkRow(index: number) {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  }

  function setLinkField(
    index: number,
    field: keyof DriveLinkInput,
    value: string
  ) {
    setLinks((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        zIndex: 50,
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="client-modal-title"
      onMouseDown={(ev) => {
        if (ev.target === ev.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: 520,
          maxHeight: "90vh",
          overflow: "auto",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: "1.25rem",
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 id="client-modal-title" style={{ margin: "0 0 1rem", fontSize: "1.15rem" }}>
          {client ? "Izmeni klijenta" : "Novi klijent"}
        </h2>

        <div style={{ display: "grid", gap: "0.75rem" }}>
          <label style={{ display: "grid", gap: 4 }}>
            <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>Ime *</span>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label style={{ display: "grid", gap: 4 }}>
            <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label style={{ display: "grid", gap: 4 }}>
            <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>Kompanija</span>
            <input value={company} onChange={(e) => setCompany(e.target.value)} />
          </label>
          <label style={{ display: "grid", gap: 4 }}>
            <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>Telefon</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>
          <label style={{ display: "grid", gap: 4 }}>
            <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
              Poslednji kontakt
            </span>
            <input
              type="datetime-local"
              value={lastContact}
              onChange={(e) => setLastContact(e.target.value)}
            />
          </label>
          <label style={{ display: "grid", gap: 4 }}>
            <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>Beleške</span>
            <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </label>

          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                Google Drive linkovi
              </span>
              <button
                type="button"
                onClick={addLinkRow}
                style={{
                  background: "transparent",
                  border: "1px solid var(--border)",
                  color: "var(--text)",
                  borderRadius: 6,
                  padding: "0.25rem 0.5rem",
                  fontSize: "0.8rem",
                }}
              >
                + Link
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {links.map((row, index) => (
                <div
                  key={row.id ?? `new-${index}`}
                  style={{
                    display: "grid",
                    gap: 8,
                    padding: 10,
                    background: "var(--bg)",
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                  }}
                >
                  <input
                    placeholder="Naziv"
                    value={row.label}
                    onChange={(e) => setLinkField(index, "label", e.target.value)}
                  />
                  <input
                    placeholder="https://drive.google.com/..."
                    value={row.url}
                    onChange={(e) => setLinkField(index, "url", e.target.value)}
                  />
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <label style={{ flex: 1, display: "grid", gap: 4 }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                        Datum
                      </span>
                      <input
                        type="date"
                        value={row.link_date}
                        onChange={(e) =>
                          setLinkField(index, "link_date", e.target.value)
                        }
                      />
                    </label>
                    {links.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLinkRow(index)}
                        style={{
                          alignSelf: "end",
                          background: "transparent",
                          border: "1px solid var(--border)",
                          color: "#f87171",
                          borderRadius: 6,
                          padding: "0.35rem 0.5rem",
                          fontSize: "0.8rem",
                        }}
                      >
                        Ukloni
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <p style={{ color: "#f87171", fontSize: "0.9rem", marginTop: "0.75rem" }}>
            {error}
          </p>
        )}

        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "flex-end",
            marginTop: "1.25rem",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            style={{
              background: "transparent",
              border: "1px solid var(--border)",
              color: "var(--text)",
              borderRadius: 8,
              padding: "0.5rem 1rem",
            }}
          >
            Otkaži
          </button>
          <button
            type="submit"
            disabled={saving}
            style={{
              background: "var(--accent)",
              border: "none",
              color: "#fff",
              borderRadius: 8,
              padding: "0.5rem 1rem",
            }}
          >
            {saving ? "Čuvam…" : "Sačuvaj"}
          </button>
        </div>
      </form>
    </div>
  );
}
