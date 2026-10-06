"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CapturedPhoto } from "@/components/camera/CameraCapture";
import { CameraCapture } from "@/components/camera/CameraCapture";
import { FullscreenLightbox } from "@/components/gallery/FullscreenLightbox";
import { AddPhotoScreen } from "@/components/screens/AddPhotoScreen";
import { AvatarScreen } from "@/components/screens/AvatarScreen";
import { CharacterScreen } from "@/components/screens/CharacterScreen";
import type { GalleryTab } from "@/components/screens/GalleryScreen";
import { GalleryScreen } from "@/components/screens/GalleryScreen";
import { WelcomeScreen } from "@/components/screens/WelcomeScreen";
import type { GuestRole } from "@/generated/prisma/enums";
import { PhotoEffect } from "@/generated/prisma/enums";
import {
  fetchPhotos,
  fetchRanking,
  saveGuest,
  toggleLike,
  uploadPhoto,
} from "@/lib/api";
import type { GuestDTO, PhotoDTO, RankingEntryDTO } from "@/lib/dto";
import {
  ACCEPTED_UPLOAD_MIME,
  MAX_UPLOAD_BYTES,
} from "@/lib/upload-constraints";
import {
  createQueueItem,
  MAX_BATCH,
  type QueueItem,
  releaseQueueItem,
  resolveCaption,
} from "@/lib/upload-queue";

type Step = "welcome" | "character" | "avatar" | "gallery" | "add-photo";

const POLL_INTERVAL_MS = 10_000;

function messageOf(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Algo deu errado. Tente de novo.";
}

export function WeddingApp({
  initialGuest,
}: {
  initialGuest: GuestDTO | null;
}) {
  const [guest, setGuest] = useState<GuestDTO | null>(initialGuest);
  const [step, setStep] = useState<Step>(initialGuest ? "gallery" : "welcome");

  const [name, setName] = useState(initialGuest?.name ?? "");
  const [role, setRole] = useState<GuestRole | null>(
    initialGuest?.role ?? null,
  );
  const [avatarId, setAvatarId] = useState<string | null>(
    initialGuest?.avatarId ?? null,
  );
  const [savingGuest, setSavingGuest] = useState(false);
  const [onboardingError, setOnboardingError] = useState<string | null>(null);

  const [tab, setTab] = useState<GalleryTab>("all");
  const [photos, setPhotos] = useState<PhotoDTO[]>([]);
  const [ranking, setRanking] = useState<RankingEntryDTO[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Espelho das fotos para o handler de curtida ler o valor anterior sem
  // depender de quando o React executa o updater de estado.
  const photosRef = useRef<PhotoDTO[]>([]);
  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  const [items, setItems] = useState<QueueItem[]>([]);
  const [batchCaption, setBatchCaption] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Cada previa da fila segura um object URL; sem revogar ao desmontar, um
  // convidado que escolhe e troca fotos varias vezes vaza memoria do navegador.
  const itemsRef = useRef<QueueItem[]>([]);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);
  useEffect(() => {
    return () => {
      for (const item of itemsRef.current) releaseQueueItem(item);
    };
  }, []);

  const refresh = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!options?.silent) setLoadingFeed(true);
      try {
        if (tab === "ranking") {
          setRanking(await fetchRanking());
        } else {
          setPhotos(await fetchPhotos(tab));
        }
        setFeedError(null);
      } catch (error) {
        setFeedError(messageOf(error));
      } finally {
        setLoadingFeed(false);
      }
    },
    [tab],
  );

  // Polling: so enquanto a galeria esta aberta e a aba visivel. Num salao cheio
  // de celulares em 4G, continuar buscando com a tela apagada so gasta bateria.
  useEffect(() => {
    if (!guest || step !== "gallery") return;

    refresh();

    const timer = setInterval(() => {
      if (document.visibilityState === "visible") refresh({ silent: true });
    }, POLL_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [guest, step, refresh]);

  async function handleSaveGuest() {
    if (!role || !avatarId) return;
    setSavingGuest(true);
    setOnboardingError(null);
    try {
      const saved = await saveGuest({ name: name.trim(), role, avatarId });
      setGuest(saved);
      setStep("gallery");
    } catch (error) {
      setOnboardingError(messageOf(error));
    } finally {
      setSavingGuest(false);
    }
  }

  /** Curtida otimista: o coracao responde na hora e o servidor corrige depois. */
  const handleLike = useCallback(async (photoId: string) => {
    const before = photosRef.current.find((photo) => photo.id === photoId);
    if (!before) return;

    const patch = (values: Pick<PhotoDTO, "likedByMe" | "likes">) =>
      setPhotos((current) =>
        current.map((photo) =>
          photo.id === photoId ? { ...photo, ...values } : photo,
        ),
      );

    patch({
      likedByMe: !before.likedByMe,
      likes: Math.max(0, before.likes + (before.likedByMe ? -1 : 1)),
    });

    try {
      const result = await toggleLike(photoId);
      patch({ likedByMe: result.liked, likes: result.likes });
    } catch {
      patch({ likedByMe: before.likedByMe, likes: before.likes });
    }
  }, []);

  function updateItem(id: string, values: Partial<QueueItem>) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...values } : item)),
    );
  }

  function handlePickFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    const room = MAX_BATCH - items.length;
    const chosen = Array.from(files);
    const accepted: QueueItem[] = [];
    let problem: string | null = null;

    for (const file of chosen.slice(0, room)) {
      if (!(ACCEPTED_UPLOAD_MIME as readonly string[]).includes(file.type)) {
        problem = `"${file.name}" não é um formato de imagem aceito.`;
        continue;
      }
      if (file.size > MAX_UPLOAD_BYTES) {
        problem = `"${file.name}" passa de 20MB.`;
        continue;
      }
      accepted.push(createQueueItem(file, PhotoEffect.NONE));
    }

    if (chosen.length > room) {
      problem = `Só cabem mais ${room} foto(s) neste envio.`;
    }

    if (accepted.length > 0) setItems((current) => [...current, ...accepted]);
    setUploadError(problem);
  }

  function handleCapture({ file, filtered }: CapturedPhoto) {
    setCameraOpen(false);
    if (items.length >= MAX_BATCH) {
      setUploadError(`Limite de ${MAX_BATCH} fotos por envio.`);
      return;
    }
    setItems((current) => [
      ...current,
      createQueueItem(file, filtered ? PhotoEffect.POLAROID : PhotoEffect.NONE),
    ]);
    setUploadError(null);
  }

  function handleRemoveItem(id: string) {
    setItems((current) => {
      const target = current.find((item) => item.id === id);
      if (target) releaseQueueItem(target);
      return current.filter((item) => item.id !== id);
    });
  }

  /**
   * Envia uma de cada vez. Em paralelo, cinco fotos de celular saturam o uplink
   * do salao e todas ficam lentas; em serie a primeira ja aparece na galeria
   * enquanto as outras sobem.
   */
  async function handlePublish() {
    const queue = items.filter((item) => item.status !== "done");
    if (queue.length === 0) return;

    setUploading(true);
    setUploadError(null);

    const published: PhotoDTO[] = [];
    let failures = 0;

    for (const item of queue) {
      updateItem(item.id, {
        status: "uploading",
        progress: 0,
        error: undefined,
      });
      try {
        const photo = await uploadPhoto({
          file: item.file,
          caption: resolveCaption(item, batchCaption).trim(),
          effect: item.effect,
          onProgress: (pct) => updateItem(item.id, { progress: pct }),
        });
        published.push(photo);
        updateItem(item.id, { status: "done", progress: 100 });
      } catch (error) {
        failures++;
        updateItem(item.id, { status: "error", error: messageOf(error) });
      }
    }

    if (published.length > 0) {
      // O feed vem do mais novo para o mais antigo; invertendo o lote a ordem
      // de escolha do convidado e preservada no topo da galeria.
      setPhotos((current) => [...published.reverse(), ...current]);
    }

    setUploading(false);

    if (failures === 0) {
      for (const item of queue) releaseQueueItem(item);
      setItems([]);
      setBatchCaption("");
      setTab("all");
      setStep("gallery");
      return;
    }

    // As que subiram saem da fila; as que falharam ficam para tentar de novo.
    setItems((current) => {
      for (const item of current) {
        if (item.status === "done") releaseQueueItem(item);
      }
      return current.filter((item) => item.status !== "done");
    });
    setUploadError(
      `${failures} foto(s) não subiram. Toque em publicar para tentar de novo.`,
    );
  }

  return (
    <div className="max-w-md mx-auto relative" style={{ minHeight: "100vh" }}>
      {step === "welcome" && (
        <WelcomeScreen
          name={name}
          setName={setName}
          onContinue={() => setStep("character")}
        />
      )}

      {step === "character" && (
        <CharacterScreen
          role={role}
          setRole={setRole}
          onContinue={() => setStep("avatar")}
          onBack={() => setStep("welcome")}
        />
      )}

      {step === "avatar" && (
        <AvatarScreen
          avatarId={avatarId}
          setAvatarId={setAvatarId}
          onContinue={handleSaveGuest}
          onBack={() => setStep("character")}
          saving={savingGuest}
          error={onboardingError}
        />
      )}

      {step === "gallery" && guest && (
        <GalleryScreen
          guest={guest}
          photos={photos}
          ranking={ranking}
          tab={tab}
          setTab={setTab}
          loading={loadingFeed}
          error={feedError}
          onAdd={() => setStep("add-photo")}
          onSelect={setLightboxIndex}
        />
      )}

      {step === "add-photo" && guest && (
        <AddPhotoScreen
          guest={guest}
          items={items}
          batchCaption={batchCaption}
          setBatchCaption={setBatchCaption}
          onPickFiles={handlePickFiles}
          onOpenCamera={() => setCameraOpen(true)}
          onRemove={handleRemoveItem}
          onCaptionChange={(id, caption) =>
            updateItem(id, { caption, captionTouched: true })
          }
          onPublish={handlePublish}
          onBack={() => setStep("gallery")}
          uploading={uploading}
          error={uploadError}
        />
      )}

      {cameraOpen && (
        <CameraCapture
          onCapture={handleCapture}
          onClose={() => setCameraOpen(false)}
        />
      )}

      {lightboxIndex !== null && photos.length > 0 && (
        <FullscreenLightbox
          photos={photos}
          initialIndex={lightboxIndex}
          onLike={handleLike}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}
