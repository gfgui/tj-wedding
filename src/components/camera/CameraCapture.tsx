"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  bakePolaroid,
  POLAROID_CSS_FILTER,
  POLAROID_VEIL_CSS,
  POLAROID_VIGNETTE_CSS,
} from "@/lib/photo-filter";
import { FONTS, PALETTE } from "@/lib/wedding";

export type CapturedPhoto = { file: File; filtered: boolean };

type Facing = "environment" | "user";

type CameraState =
  | { kind: "starting" }
  | { kind: "live" }
  | { kind: "blocked"; message: string };

export function CameraCapture({
  onCapture,
  onClose,
}: {
  onCapture: (photo: CapturedPhoto) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [state, setState] = useState<CameraState>({ kind: "starting" });
  const [facing, setFacing] = useState<Facing>("environment");
  const [filterOn, setFilterOn] = useState(true);
  const [processing, setProcessing] = useState(false);

  const stopStream = useCallback(() => {
    for (const track of streamRef.current?.getTracks() ?? []) track.stop();
    streamRef.current = null;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      // getUserMedia so existe em contexto seguro. Sem esse aviso o botao
      // simplesmente nao faria nada ao ser tocado por HTTP na rede do salao.
      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
        setState({
          kind: "blocked",
          message:
            "A câmera do app precisa de uma conexão segura (HTTPS). Use o botão da galeria para enviar uma foto.",
        });
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facing,
            width: { ideal: 1920 },
            height: { ideal: 1920 },
          },
          audio: false,
        });

        // A troca de câmera pode resolver depois do componente sair de cena;
        // sem isso a stream nova ficaria aberta para sempre.
        if (cancelled) {
          for (const track of stream.getTracks()) track.stop();
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
        }
        setState({ kind: "live" });
      } catch (error) {
        if (cancelled) return;
        const denied =
          error instanceof DOMException &&
          (error.name === "NotAllowedError" || error.name === "SecurityError");
        setState({
          kind: "blocked",
          message: denied
            ? "Permissão de câmera negada. Libere o acesso nas configurações do navegador ou escolha uma foto da galeria."
            : "Não foi possível abrir a câmera deste aparelho. Tente enviar uma foto da galeria.",
        });
      }
    }

    start();

    return () => {
      cancelled = true;
      stopStream();
    };
  }, [facing, stopStream]);

  function handleShutter() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;

    setProcessing(true);

    // A previa e um quadrado com `object-fit: cover`. Gravar o frame inteiro
    // entregaria uma foto 16:9, com mais cena do que a pessoa enquadrou — e a
    // vinheta circular sairia deformada. Aqui repetimos o mesmo recorte central.
    const side = Math.min(video.videoWidth, video.videoHeight);
    const sourceX = (video.videoWidth - side) / 2;
    const sourceY = (video.videoHeight - side) / 2;

    const canvas = document.createElement("canvas");
    canvas.width = side;
    canvas.height = side;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      setProcessing(false);
      return;
    }

    // A previa da camera frontal e espelhada; gravar sem espelho entregaria
    // uma foto diferente da que a pessoa acabou de ver.
    if (facing === "user") {
      ctx.translate(side, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, sourceX, sourceY, side, side, 0, 0, side, side);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    if (filterOn) bakePolaroid(canvas);

    canvas.toBlob(
      (blob) => {
        setProcessing(false);
        if (!blob) return;
        const file = new File([blob], `camera-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        onCapture({ file, filtered: filterOn });
      },
      "image/jpeg",
      0.92,
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        background: "#140C08",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "48px 20px 12px",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar câmera"
          style={{
            color: "rgba(249,245,238,0.8)",
            background: "none",
            padding: 4,
          }}
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
            <path d="M1 1l20 20M21 1L1 21" strokeLinecap="round" />
          </svg>
        </button>

        <span
          style={{
            fontFamily: FONTS.body,
            fontSize: "0.7rem",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "rgba(249,245,238,0.5)",
          }}
        >
          Câmera
        </span>

        <button
          type="button"
          onClick={() =>
            setFacing((f) => (f === "user" ? "environment" : "user"))
          }
          aria-label="Trocar de câmera"
          disabled={state.kind !== "live"}
          style={{
            color: "rgba(249,245,238,0.8)",
            background: "none",
            padding: 4,
            opacity: state.kind === "live" ? 1 : 0.35,
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path
              d="M3 8a4 4 0 0 1 4-4h9l-2.5-2.5M21 16a4 4 0 0 1-4 4H8l2.5 2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 16px",
        }}
      >
        {state.kind === "blocked" ? (
          <p
            role="alert"
            style={{
              fontFamily: FONTS.body,
              color: "rgba(249,245,238,0.75)",
              textAlign: "center",
              fontSize: "0.85rem",
              lineHeight: 1.6,
              maxWidth: 320,
            }}
          >
            {state.message}
          </p>
        ) : (
          // Moldura polaroide em volta da previa: o convidado ja enquadra
          // vendo o formato final.
          <div
            style={{
              background: PALETTE.polaroid,
              padding: "10px 10px 44px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.55)",
              width: "100%",
              maxWidth: 360,
            }}
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                aspectRatio: "1",
                overflow: "hidden",
                background: "#000",
              }}
            >
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  transform: facing === "user" ? "scaleX(-1)" : undefined,
                  filter: filterOn ? POLAROID_CSS_FILTER : undefined,
                }}
              />
              {filterOn && (
                <>
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: POLAROID_VEIL_CSS,
                      pointerEvents: "none",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: POLAROID_VIGNETTE_CSS,
                      pointerEvents: "none",
                    }}
                  />
                </>
              )}
              {state.kind === "starting" && (
                <p
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: FONTS.body,
                    fontSize: "0.75rem",
                    color: "rgba(249,245,238,0.6)",
                  }}
                >
                  Abrindo a câmera...
                </p>
              )}
            </div>
            <p
              style={{
                fontFamily: FONTS.script,
                fontSize: "0.95rem",
                color: "rgba(44,24,16,0.35)",
                textAlign: "center",
                marginTop: 10,
              }}
            >
              {filterOn ? "com filtro polaroide" : "sem filtro"}
            </p>
          </div>
        )}
      </div>

      <div style={{ padding: "16px 24px 44px" }}>
        <button
          type="button"
          onClick={() => setFilterOn((on) => !on)}
          aria-pressed={filterOn}
          disabled={state.kind !== "live"}
          style={{
            display: "block",
            margin: "0 auto 22px",
            padding: "8px 18px",
            border: `1px solid ${filterOn ? PALETTE.gold : "rgba(249,245,238,0.25)"}`,
            background: filterOn ? "rgba(196,135,12,0.16)" : "transparent",
            color: filterOn ? PALETTE.goldLight : "rgba(249,245,238,0.6)",
            fontFamily: FONTS.body,
            fontSize: "0.72rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            opacity: state.kind === "live" ? 1 : 0.35,
          }}
        >
          Filtro polaroide {filterOn ? "ligado" : "desligado"}
        </button>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            type="button"
            onClick={handleShutter}
            disabled={state.kind !== "live" || processing}
            aria-label="Tirar foto"
            style={{
              width: 74,
              height: 74,
              borderRadius: "50%",
              border: `3px solid ${PALETTE.goldLight}`,
              background:
                state.kind === "live" && !processing
                  ? `linear-gradient(135deg, ${PALETTE.gold} 0%, ${PALETTE.goldLight} 100%)`
                  : "rgba(249,245,238,0.15)",
              boxShadow:
                state.kind === "live"
                  ? "0 6px 28px rgba(196,135,12,0.45)"
                  : undefined,
            }}
          />
        </div>

        <p
          style={{
            textAlign: "center",
            marginTop: 14,
            fontFamily: FONTS.body,
            fontSize: "0.7rem",
            color: "rgba(249,245,238,0.4)",
          }}
        >
          {processing ? "Revelando..." : "Toque para fotografar"}
        </p>
      </div>
    </div>
  );
}
