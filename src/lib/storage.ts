import {
  DeleteObjectsCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Variável de ambiente ausente: ${name}`);
  return value;
}

// Inicializacao preguicosa: se o client fosse criado no import, um `next build`
// sem .env quebraria antes mesmo de compilar.
let client: S3Client | null = null;

export function s3(): S3Client {
  if (!client) {
    client = new S3Client({
      endpoint: env("S3_ENDPOINT"),
      region: process.env.S3_REGION ?? "auto",
      credentials: {
        accessKeyId: env("S3_ACCESS_KEY_ID"),
        secretAccessKey: env("S3_SECRET_ACCESS_KEY"),
      },
      // MinIO exige path-style (localhost:9000/bucket/key).
      // No R2 use virtual-host: S3_FORCE_PATH_STYLE=false.
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
    });
  }
  return client;
}

export function bucket(): string {
  return env("S3_BUCKET");
}

/** URL de leitura publica — bucket anonimo no MinIO, dominio publico no R2. */
export function publicUrl(key: string): string {
  return `${env("NEXT_PUBLIC_MEDIA_URL").replace(/\/+$/, "")}/${key}`;
}

/** URL assinada de PUT: o celular envia o arquivo direto pro storage. */
export function presignUpload(
  key: string,
  contentType: string,
  expiresIn = 600,
): Promise<string> {
  return getSignedUrl(
    s3(),
    new PutObjectCommand({
      Bucket: bucket(),
      Key: key,
      ContentType: contentType,
    }),
    { expiresIn },
  );
}

export async function getObjectBuffer(key: string): Promise<Buffer> {
  const res = await s3().send(
    new GetObjectCommand({ Bucket: bucket(), Key: key }),
  );
  if (!res.Body) throw new Error(`Objeto vazio ou inexistente: ${key}`);
  return Buffer.from(await res.Body.transformToByteArray());
}

export async function putObject(
  key: string,
  body: Buffer,
  contentType: string,
): Promise<void> {
  await s3().send(
    new PutObjectCommand({
      Bucket: bucket(),
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}

export async function deleteObjects(
  keys: (string | null | undefined)[],
): Promise<void> {
  const targets = keys.filter((k): k is string => Boolean(k));
  if (targets.length === 0) return;
  await s3().send(
    new DeleteObjectsCommand({
      Bucket: bucket(),
      Delete: { Objects: targets.map((Key) => ({ Key })) },
    }),
  );
}
