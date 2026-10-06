"use client";

import { useRef } from "react";
import type { GuestDTO } from "@/lib/dto";
import { ACCEPTED_UPLOAD_MIME } from "@/lib/upload-constraints";
import { MAX_BATCH, type QueueItem } from "@/lib/upload-queue";
import { FONTS, PALETTE } from "@/lib/wedding";

export function AddPhotoScreen({
  guest,
  items,
  batchCaption,
  setBatchCaption,
  onPickFiles,
  onOpenCamera,
  onRemove,
  onCaptionChange,
  onPublish,
  onBack,
  uploading,
  error,
}: {
  guest: GuestDTO;
  items: QueueItem[];
  batchCaption: string;
  setBatchCaption: (value: string) => void;
  onPickFiles: (files: FileList | null) => void;
  onOpenCamera: () => void;
  onRemove: (id: string) => void;
  onCaptionChange: (id: string, caption: string) => void;
  onPublish: () => void;
  onBack: () => void;
  uploading: boolean;
  error: string | null;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const full = items.length >= MAX_BATCH;

  return (
    <div
      className="min-h-screen flex flex-col texture-overlay"
      style={{ background: PALETTE.cream }}
    >
      <div className="pt-12 pb-5 px-5 flex items-center gap-4 animate-fade-in">
        <button
          type="button"
          onClick={onBack}
          aria-label="Voltar"
          disabled={uploading}
          style={{ color: PALETTE.gold, opacity: uploading ? 0.4 : 1 }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path
              d="M14 4 L7 11 L14 18"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div>
          <h2
            className="text-xl"
            style={{ fontFamily: FONTS.display, color: PALETTE.brown }}
          >
            Adicionar Memórias
          </h2>
          <p
            className="text-xs"
            style={{ color: PALETTE.mutedBrown, fontFamily: FONTS.body }}
          >
            {guest.emoji} {guest.name}
          </p>
        </div>
      </div>

      <div className="flex-1 px-5 pb-10 overflow-y-auto flex flex-col gap-6">
        <div className="animate-fade-in-up grid grid-cols-2 gap-3">
          <SourceButton
            label="Câmera do app"
            hint="com filtro polaroide"
            disabled={uploading || full}
            onClick={onOpenCamera}
          >
            <rect x="2" y="6" width="28" height="22" rx="3" />
            <circle cx="16" cy="17" r="6" />
            <path d="M10 6 L12 2 L20 2 L22 6" />
          </SourceButton>

          <SourceButton
            label="Galeria"
            hint="várias de uma vez"
            disabled={uploading || full}
            onClick={() => fileInputRef.current?.click()}
          >
            <rect x="2" y="5" width="28" height="22" rx="3" />
            <path
              d="M2 22 L11 13 L18 20 L22 16 L30 24"
              strokeLinejoin="round"
            />
            <circle cx="11" cy="11" r="2.5" />
          </SourceButton>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_UPLOAD_MIME.join(",")}
          multiple
          onChange={(event) => {
            onPickFiles(event.target.files);
            // Sem isso, escolher o mesmo arquivo duas vezes seguidas nao
            // dispara change e a foto parece sumir.
            event.target.value = "";
          }}
          className="hidden"
        />

        {items.length === 0 ? (
          <div className="flex flex-col items-center py-14 animate-fade-in">
            <span style={{ fontSize: "2.6rem" }}>📷</span>
            <p
              className="mt-4 text-center"
              style={{ fontFamily: FONTS.display, color: PALETTE.mutedBrown }}
            >
              Nenhuma foto escolhida ainda.
              <br />
              Você pode enviar até {MAX_BATCH} de uma vez.
            </p>
          </div>
        ) : (
          <>
            <div className="animate-fade-in-up">
              <label
                htmlFor="legenda-lote"
                className="block text-xs tracking-widest uppercase mb-3"
                style={{ color: PALETTE.mutedBrown, fontFamily: FONTS.body }}
              >
                Legenda de todas
              </label>
              <input
                id="legenda-lote"
                type="text"
                value={batchCaption}
                maxLength={140}
                disabled={uploading}
                onChange={(event) => setBatchCaption(event.target.value)}
                placeholder="Escreva algo especial..."
                className="input-elegant w-full pb-3"
                style={{
                  fontFamily: FONTS.script,
                  fontSize: "1.1rem",
                  color: PALETTE.brown,
                }}
              />
            </div>

            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <QueueCard
                  key={item.id}
                  item={item}
                  batchCaption={batchCaption}
                  uploading={uploading}
                  onRemove={() => onRemove(item.id)}
                  onCaptionChange={(caption) =>
                    onCaptionChange(item.id, caption)
                  }
                />
              ))}
            </div>
          </>
        )}

        {full && (
          <p
            className="text-center text-xs"
            style={{ color: PALETTE.mutedBrown, fontFamily: FONTS.body }}
          >
            Limite de {MAX_BATCH} fotos por envio. Publique estas e envie mais
            depois.
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="text-center text-xs"
            style={{ color: "#B3261E", fontFamily: FONTS.body }}
          >
            {error}
          </p>
        )}

        <div className="animate-fade-in-up delay-200 mt-1">
          <button
            type="button"
            onClick={onPublish}
            disabled={items.length === 0 || uploading}
            className="btn-gold w-full py-4 text-white text-sm tracking-[0.2em] uppercase disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ fontFamily: FONTS.body }}
          >
            {uploading
              ? "Publicando..."
              : items.length > 1
                ? `Publicar ${items.length} memórias`
                : "Publicar Memória"}
          </button>
          <p
            className="text-center mt-3 text-xs"
            style={{ color: PALETTE.mutedBrown, fontFamily: FONTS.body }}
          >
            Suas fotos aparecerão na galeria para todos
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 mt-1">
          <div
            style={{
              width: 40,
              height: 1,
              background: PALETTE.gold,
              opacity: 0.3,
            }}
          />
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M6 0.5 L7.2 4.8 L11.5 6 L7.2 7.2 L6 11.5 L4.8 7.2 L0.5 6 L4.8 4.8 Z"
              fill={PALETTE.gold}
              opacity="0.5"
            />
          </svg>
          <div
            style={{
              width: 40,
              height: 1,
              background: PALETTE.gold,
              opacity: 0.3,
            }}
          />
        </div>
      </div>
    </div>
  );
}

function SourceButton({
  label,
  hint,
  disabled,
  onClick,
  children,
}: {
  label: string;
  hint: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex flex-col items-center justify-center gap-2 py-5 px-3 transition-all disabled:opacity-40"
      style={{
        background: "#FFFFFF",
        border: "1px solid rgba(196,135,12,0.25)",
        boxShadow: "0 2px 8px rgba(44,24,16,0.06)",
        color: PALETTE.gold,
      }}
    >
      <svg
        width="30"
        height="30"
        viewBox="0 0 32 32"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        aria-hidden="true"
      >
        {children}
      </svg>
      <span
        className="text-sm"
        style={{ fontFamily: FONTS.display, color: PALETTE.brown }}
      >
        {label}
      </span>
      <span
        className="text-xs"
        style={{ fontFamily: FONTS.body, color: PALETTE.mutedBrown }}
      >
        {hint}
      </span>
    </button>
  );
}

function QueueCard({
  item,
  batchCaption,
  uploading,
  onRemove,
  onCaptionChange,
}: {
  item: QueueItem;
  batchCaption: string;
  uploading: boolean;
  onRemove: () => void;
  onCaptionChange: (caption: string) => void;
}) {
  const done = item.status === "done";
  const failed = item.status === "error";

  return (
    <div
      className="animate-fade-in-up flex items-center gap-3"
      style={{
        background: "#FFFFFF",
        padding: 10,
        border: failed
          ? "1px solid rgba(179,38,30,0.4)"
          : "1px solid rgba(196,135,12,0.15)",
        boxShadow: "0 2px 8px rgba(44,24,16,0.06)",
        opacity: done ? 0.6 : 1,
      }}
    >
      <div
        style={{
          flexShrink: 0,
          background: PALETTE.polaroid,
          padding: "4px 4px 12px",
          boxShadow: "0 2px 6px rgba(44,24,16,0.14)",
          transform: "rotate(-2deg)",
        }}
      >
        {/* biome-ignore lint/performance/noImgElement: blob local do arquivo escolhido */}
        <img
          src={item.previewUrl}
          alt=""
          style={{
            width: 56,
            height: 56,
            objectFit: "cover",
            display: "block",
          }}
        />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <input
          type="text"
          value={item.caption}
          maxLength={140}
          disabled={uploading}
          onChange={(event) => onCaptionChange(event.target.value)}
          // O placeholder mostra a legenda do lote: da para ver o que essa foto
          // vai receber sem precisar digitar nada.
          placeholder={batchCaption || "Legenda desta foto..."}
          aria-label="Legenda desta foto"
          className="w-full"
          style={{
            fontFamily: FONTS.script,
            fontSize: "1rem",
            color: PALETTE.brown,
            background: "transparent",
            border: "none",
            borderBottom: "1px solid rgba(196,135,12,0.25)",
            outline: "none",
            paddingBottom: 4,
          }}
        />
        <p
          className="mt-1.5 text-xs"
          style={{
            fontFamily: FONTS.body,
            color: failed ? "#B3261E" : PALETTE.mutedBrown,
            fontSize: "0.65rem",
          }}
        >
          {failed
            ? (item.error ?? "Falhou")
            : done
              ? "Publicada ✓"
              : item.status === "uploading"
                ? `Enviando ${item.progress}%`
                : item.effect === "POLAROID"
                  ? "Câmera · filtro polaroide"
                  : "Da galeria"}
        </p>
        {item.status === "uploading" && (
          <div
            style={{
              height: 2,
              background: "rgba(196,135,12,0.15)",
              marginTop: 5,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${item.progress}%`,
                background: PALETTE.gold,
                transition: "width 0.2s",
              }}
            />
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onRemove}
        disabled={uploading}
        aria-label="Remover esta foto"
        style={{
          flexShrink: 0,
          color: PALETTE.mutedBrown,
          padding: 6,
          opacity: uploading ? 0.3 : 1,
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path d="M2 2l12 12M14 2L2 14" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
