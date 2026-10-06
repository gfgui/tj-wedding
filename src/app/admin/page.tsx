"use client";

import { useCallback, useEffect, useState } from "react";
import { FONTS, PALETTE } from "@/lib/wedding";

interface AdminPhoto {
  id: string;
  thumbUrl: string;
  caption: string;
  author: string;
  emoji: string;
  status: "READY" | "HIDDEN";
  likes: number;
  createdAt: string;
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [photos, setPhotos] = useState<AdminPhoto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadPhotos = useCallback(async () => {
    const res = await fetch("/api/admin/photos", { cache: "no-store" });
    if (!res.ok) {
      setAuthenticated(false);
      return;
    }
    const body = (await res.json()) as { photos: AdminPhoto[] };
    setPhotos(body.photos);
    setAuthenticated(true);
  }, []);

  useEffect(() => {
    fetch("/api/admin/session", { cache: "no-store" })
      .then((res) => res.json())
      .then((body: { authenticated: boolean }) => {
        if (body.authenticated) loadPhotos();
        else setAuthenticated(false);
      })
      .catch(() => setAuthenticated(false));
  }, [loadPhotos]);

  async function login(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const res = await fetch("/api/admin/session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      setError(body?.error ?? "Não foi possível entrar");
      return;
    }
    setPassword("");
    await loadPhotos();
  }

  async function setStatus(id: string, status: "READY" | "HIDDEN") {
    setBusyId(id);
    const res = await fetch(`/api/admin/photos/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setPhotos((current) =>
        current.map((p) => (p.id === id ? { ...p, status } : p)),
      );
    }
    setBusyId(null);
  }

  async function remove(id: string) {
    if (
      !window.confirm(
        "Apagar esta foto para sempre? O arquivo original também será removido.",
      )
    ) {
      return;
    }
    setBusyId(id);
    const res = await fetch(`/api/admin/photos/${id}`, { method: "DELETE" });
    if (res.ok) setPhotos((current) => current.filter((p) => p.id !== id));
    setBusyId(null);
  }

  if (authenticated === null) {
    return (
      <main style={pageStyle}>
        <p style={{ fontFamily: FONTS.body, color: PALETTE.mutedBrown }}>
          Carregando...
        </p>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main style={pageStyle}>
        <form onSubmit={login} style={{ width: "100%", maxWidth: 320 }}>
          <h1
            className="text-2xl text-center mb-6"
            style={{ fontFamily: FONTS.display, color: PALETTE.brown }}
          >
            Moderação
          </h1>
          <label
            htmlFor="senha-admin"
            className="block text-xs tracking-widest uppercase mb-3 text-center"
            style={{ color: PALETTE.mutedBrown, fontFamily: FONTS.body }}
          >
            Senha
          </label>
          <input
            id="senha-admin"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="input-elegant w-full text-center pb-3"
            style={{ fontFamily: FONTS.body, color: PALETTE.brown }}
          />
          {error && (
            <p
              role="alert"
              className="text-center mt-4 text-xs"
              style={{ color: "#B3261E", fontFamily: FONTS.body }}
            >
              {error}
            </p>
          )}
          <button
            type="submit"
            className="btn-gold w-full py-4 mt-8 text-white text-sm tracking-[0.2em] uppercase"
            style={{ fontFamily: FONTS.body }}
          >
            Entrar
          </button>
        </form>
      </main>
    );
  }

  return (
    <main style={{ ...pageStyle, display: "block", padding: "48px 20px 80px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <h1
          className="text-2xl mb-1"
          style={{ fontFamily: FONTS.display, color: PALETTE.brown }}
        >
          Moderação
        </h1>
        <p
          className="mb-8 text-xs"
          style={{ color: PALETTE.mutedBrown, fontFamily: FONTS.body }}
        >
          {photos.length} foto(s) · ocultar tira da galeria sem apagar o arquivo
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {photos.map((photo) => (
            <div
              key={photo.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                background: "#FFF",
                padding: 12,
                border: "1px solid rgba(196,135,12,0.15)",
                opacity: photo.status === "HIDDEN" ? 0.55 : 1,
              }}
            >
              {/** biome-ignore lint/performance/noImgElement: miniatura ja gerada no servidor */}
              <img
                src={photo.thumbUrl}
                alt=""
                loading="lazy"
                style={{
                  width: 64,
                  height: 64,
                  objectFit: "cover",
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  className="truncate"
                  style={{
                    fontFamily: FONTS.script,
                    fontSize: "1rem",
                    color: PALETTE.brown,
                  }}
                >
                  {photo.caption || "(sem legenda)"}
                </p>
                <p
                  style={{
                    fontFamily: FONTS.body,
                    fontSize: "0.7rem",
                    color: PALETTE.mutedBrown,
                  }}
                >
                  {photo.emoji} {photo.author} · {photo.likes} curtida(s)
                  {photo.status === "HIDDEN" && " · OCULTA"}
                </p>
              </div>
              <button
                type="button"
                disabled={busyId === photo.id}
                onClick={() =>
                  setStatus(
                    photo.id,
                    photo.status === "HIDDEN" ? "READY" : "HIDDEN",
                  )
                }
                style={actionStyle}
              >
                {photo.status === "HIDDEN" ? "Mostrar" : "Ocultar"}
              </button>
              <button
                type="button"
                disabled={busyId === photo.id}
                onClick={() => remove(photo.id)}
                style={{
                  ...actionStyle,
                  color: "#B3261E",
                  borderColor: "rgba(179,38,30,0.35)",
                }}
              >
                Apagar
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: PALETTE.cream,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
};

const actionStyle: React.CSSProperties = {
  flexShrink: 0,
  border: "1px solid rgba(196,135,12,0.35)",
  background: "transparent",
  color: PALETTE.gold,
  fontFamily: FONTS.body,
  fontSize: "0.72rem",
  padding: "8px 12px",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
};
