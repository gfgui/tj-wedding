"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { PhotoDTO } from "@/lib/dto";
import { FONTS, PALETTE } from "@/lib/wedding";

/**
 * Quantas vizinhas de cada lado ja entram no DOM com `src` definido.
 *
 * Com `scroll-snap-stop: always` o dedo nunca passa de uma foto por gesto, logo
 * duas de folga bastam. Renderizar todas faria uma galeria de 300 fotos disparar
 * 300 downloads de ~1600px no instante em que a tela cheia abre.
 */
const PRELOAD_RADIUS = 2;

function scrollBehavior(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth";
}

export function FullscreenLightbox({
  photos,
  initialIndex,
  onLike,
  onClose,
}: {
  photos: PhotoDTO[];
  initialIndex: number;
  onLike: (photoId: string) => void;
  onClose: () => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(initialIndex);
  const [burst, setBurst] = useState(false);
  const lastTap = useRef(0);

  // O indice tambem vive num ref: o listener de scroll e o reposicionamento
  // precisam do valor atual sem entrar na lista de dependencias dos effects.
  const indexRef = useRef(initialIndex);
  const photosRef = useRef(photos);

  // Ancora de identidade: o que importa e a foto, nao a posicao dela. O feed e
  // recarregado a cada 10s e uma publicacao de outro convidado desloca o array
  // inteiro — sem isto, a foto na tela trocaria sozinha debaixo do dedo.
  const anchorRef = useRef<string | undefined>(photos[initialIndex]?.id);

  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });

  const jumpTo = useCallback((target: number, smooth: boolean) => {
    const track = trackRef.current;
    if (!track) return;
    indexRef.current = target;
    anchorRef.current = photosRef.current[target]?.id;
    setIndex(target);
    track.scrollTo({
      left: target * track.clientWidth,
      behavior: smooth ? scrollBehavior() : "auto",
    });
  }, []);

  // Abre direto na foto tocada, sem animar desde a primeira.
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (track) track.scrollLeft = initialIndex * track.clientWidth;
  }, [initialIndex]);

  // O scroll e a fonte da verdade da posicao: o contador anda junto com o dedo.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    function onScroll() {
      const width = track?.clientWidth ?? 0;
      if (!track || width === 0) return;
      const next = Math.round(track.scrollLeft / width);
      if (next === indexRef.current) return;
      indexRef.current = next;
      anchorRef.current = photosRef.current[next]?.id;
      setIndex(next);
    }

    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, []);

  // Realinha a foto em foco quando o array muda (polling, moderacao, publicacao).
  useEffect(() => {
    photosRef.current = photos;

    if (photos.length === 0) {
      closeRef.current();
      return;
    }

    const anchor = anchorRef.current;
    const target = anchor ? photos.findIndex((p) => p.id === anchor) : -1;

    if (target === -1) {
      // A foto em foco saiu da lista — moderada, por exemplo. Fica no vizinho
      // mais proximo em vez de fechar a tela na cara do convidado.
      jumpTo(Math.min(indexRef.current, photos.length - 1), false);
      return;
    }
    if (target !== indexRef.current) jumpTo(target, false);
  }, [photos, jumpTo]);

  /**
   * Fechar sempre passa pelo historico.
   *
   * A entrada sintetica abaixo existe para o botao voltar do Android fechar a
   * foto em vez de tirar o convidado do app. Mandando o X e o Escape por
   * `history.back()`, os dois caminhos convergem no mesmo listener e a pilha de
   * historico nunca fica com uma entrada orfa.
   */
  const close = useCallback(() => window.history.back(), []);

  useEffect(() => {
    window.history.pushState({ lightbox: true }, "");
    const onPop = () => closeRef.current();
    window.addEventListener("popstate", onPop);
    // Sem `history.back()` na limpeza: se o convidado sair por um link (a
    // galeria do autor), desfazer a navegacao o traria de volta na hora.
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const prev = useCallback(
    () => jumpTo(Math.max(0, indexRef.current - 1), true),
    [jumpTo],
  );
  const next = useCallback(
    () =>
      jumpTo(
        Math.min(photosRef.current.length - 1, indexRef.current + 1),
        true,
      ),
    [jumpTo],
  );

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") prev();
      if (event.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close, prev, next]);

  const safeIndex = Math.min(Math.max(index, 0), photos.length - 1);
  const photo = photos[safeIndex];

  const triggerBurst = useCallback(() => {
    setBurst(true);
    setTimeout(() => setBurst(false), 700);
  }, []);

  const handleDoubleTap = useCallback(() => {
    const current = photosRef.current[indexRef.current];
    if (!current) return;
    if (!current.likedByMe) onLike(current.id);
    triggerBurst();
  }, [onLike, triggerBurst]);

  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTap.current < 300) handleDoubleTap();
    else lastTap.current = now;
  }, [handleDoubleTap]);

  if (!photo) return null;

  const liked = photo.likedByMe;
  const progress = ((safeIndex + 1) / photos.length) * 100;

  return (
    <div
      className="animate-fade-in"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        // dvh e nao vh: no iOS o vh conta a barra de endereco que colapsa, e a
        // tela cheia ficava com uma faixa morta embaixo.
        height: "100dvh",
        background: "rgba(20,12,8,0.96)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px 12px",
          paddingTop: "calc(env(safe-area-inset-top, 0px) + 18px)",
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Fechar"
          style={{
            color: "rgba(249,245,238,0.7)",
            background: "none",
            border: "none",
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
            color: "rgba(249,245,238,0.4)",
            letterSpacing: "0.1em",
          }}
        >
          {safeIndex + 1} / {photos.length}
        </span>

        <button
          type="button"
          onClick={() => onLike(photo.id)}
          aria-label={liked ? "Remover curtida" : "Curtir"}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            background: "none",
            border: "none",
            padding: 4,
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 14 14"
            fill={liked ? PALETTE.gold : "none"}
            stroke={liked ? PALETTE.gold : "rgba(249,245,238,0.6)"}
            strokeWidth="1.4"
            style={{
              transition: "transform 0.15s",
              transform: liked ? "scale(1.2)" : "scale(1)",
            }}
            aria-hidden="true"
          >
            <path d="M7 12.5S1 8.5 1 4.5A3 3 0 0 1 7 3.27 3 3 0 0 1 13 4.5c0 4-6 8-6 8Z" />
          </svg>
          <span
            style={{
              fontFamily: FONTS.body,
              fontSize: "0.72rem",
              color: liked ? PALETTE.gold : "rgba(249,245,238,0.5)",
            }}
          >
            {photo.likes}
          </span>
        </button>
      </div>

      <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
        {/* biome-ignore lint/a11y/noStaticElementInteractions: area de gesto (toque duplo para curtir); a acao equivalente esta no botao do cabecalho */}
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: teclado tratado no listener global de setas e Escape */}
        <div
          ref={trackRef}
          className="swipe-track"
          style={{ height: "100%" }}
          onClick={handleTap}
          onDoubleClick={handleDoubleTap}
        >
          {photos.map((item, i) => (
            <div key={item.id} className="swipe-slide">
              {Math.abs(i - safeIndex) <= PRELOAD_RADIUS && (
                <Slide photo={item} />
              )}
            </div>
          ))}
        </div>

        {burst && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <svg
              width="80"
              height="80"
              viewBox="0 0 14 14"
              fill={PALETTE.gold}
              style={{
                animation: "heartBurst 0.65s ease forwards",
                filter: "drop-shadow(0 4px 12px rgba(196,135,12,0.7))",
              }}
              aria-hidden="true"
            >
              <path d="M7 12.5S1 8.5 1 4.5A3 3 0 0 1 7 3.27 3 3 0 0 1 13 4.5c0 4-6 8-6 8Z" />
            </svg>
          </div>
        )}

        {safeIndex > 0 && (
          <button
            type="button"
            className="lightbox-arrow"
            aria-label="Foto anterior"
            onClick={prev}
            style={{
              position: "absolute",
              left: 8,
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(249,245,238,0.1)",
              border: "1px solid rgba(249,245,238,0.15)",
              color: "rgba(249,245,238,0.7)",
              padding: "10px 8px",
              borderRadius: 2,
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
              <path
                d="M10 3L5 8l5 5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

        {safeIndex < photos.length - 1 && (
          <button
            type="button"
            className="lightbox-arrow"
            aria-label="Próxima foto"
            onClick={next}
            style={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(249,245,238,0.1)",
              border: "1px solid rgba(249,245,238,0.15)",
              color: "rgba(249,245,238,0.7)",
              padding: "10px 8px",
              borderRadius: 2,
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
              <path
                d="M6 3l5 5-5 5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Barra no lugar da tira de bolinhas: 300 fotos nao cabem em pontinhos
          numa tela de 375px, e o numero exato ja esta no cabecalho. */}
      <div
        style={{
          flexShrink: 0,
          padding: "14px 32px",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 18px)",
        }}
      >
        <div
          style={{
            height: 2,
            borderRadius: 2,
            background: "rgba(249,245,238,0.15)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: PALETTE.gold,
              transition: "width 0.2s ease",
            }}
          />
        </div>
      </div>
    </div>
  );
}

function Slide({ photo }: { photo: PhotoDTO }) {
  return (
    <div
      style={{
        background: PALETTE.polaroid,
        padding: "10px 10px 20px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        maxWidth: "min(90vw, 430px)",
        width: "100%",
      }}
    >
      {/** biome-ignore lint/performance/noImgElement: versao de exibicao ja redimensionada no servidor */}
      <img
        src={photo.url}
        alt={photo.caption || `Foto de ${photo.author}`}
        draggable={false}
        width={photo.width}
        height={photo.height}
        style={{
          width: "100%",
          height: "auto",
          display: "block",
          maxHeight: "62dvh",
          objectFit: "contain",
        }}
      />
      <div style={{ marginTop: 8, textAlign: "center" }}>
        <p
          style={{
            fontFamily: FONTS.script,
            fontSize: "1.1rem",
            color: PALETTE.brown,
          }}
        >
          {photo.caption}
        </p>
        <Link
          href={`/convidado/${photo.guestId}`}
          // O container e area de gesto: sem isto, abrir a galeria do autor
          // tambem contaria como metade de um toque duplo.
          onClick={(event) => event.stopPropagation()}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            marginTop: 4,
            textDecoration: "none",
          }}
        >
          {photo.avatarSrc && (
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                overflow: "hidden",
                border: "1.5px solid rgba(196,135,12,0.4)",
                background: "#fff",
                flexShrink: 0,
              }}
            >
              {/** biome-ignore lint/performance/noImgElement: avatar SVG remoto */}
              <img
                src={photo.avatarSrc}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </span>
          )}
          <span
            style={{
              fontFamily: FONTS.body,
              fontSize: "0.65rem",
              color: PALETTE.gold,
              borderBottom: "1px solid rgba(196,135,12,0.35)",
            }}
          >
            {photo.emoji} {photo.author}
          </span>
        </Link>
      </div>
    </div>
  );
}
