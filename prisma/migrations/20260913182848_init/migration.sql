-- CreateEnum
CREATE TYPE "GuestRole" AS ENUM ('NOIVO', 'NOIVA', 'PADRINHO', 'MADRINHA', 'FAMILIA', 'CONVIDADO');

-- CreateEnum
CREATE TYPE "PhotoStatus" AS ENUM ('PENDING', 'READY', 'HIDDEN');

-- CreateTable
CREATE TABLE "Guest" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(60) NOT NULL,
    "role" "GuestRole" NOT NULL,
    "avatarId" VARCHAR(8) NOT NULL,
    "sessionToken" VARCHAR(64) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Guest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Photo" (
    "id" TEXT NOT NULL,
    "objectKey" VARCHAR(200) NOT NULL,
    "thumbKey" VARCHAR(200),
    "caption" VARCHAR(140) NOT NULL,
    "mimeType" VARCHAR(40) NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "rotation" INTEGER NOT NULL DEFAULT 0,
    "status" "PhotoStatus" NOT NULL DEFAULT 'PENDING',
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guestId" TEXT NOT NULL,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Like" (
    "photoId" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("photoId","guestId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Guest_sessionToken_key" ON "Guest"("sessionToken");

-- CreateIndex
CREATE INDEX "Guest_createdAt_idx" ON "Guest"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Photo_objectKey_key" ON "Photo"("objectKey");

-- CreateIndex
CREATE INDEX "Photo_status_createdAt_idx" ON "Photo"("status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Photo_guestId_createdAt_idx" ON "Photo"("guestId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Like_guestId_idx" ON "Like"("guestId");

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "Photo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
