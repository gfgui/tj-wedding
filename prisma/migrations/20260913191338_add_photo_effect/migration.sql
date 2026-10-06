-- CreateEnum
CREATE TYPE "PhotoEffect" AS ENUM ('NONE', 'POLAROID');

-- AlterTable
ALTER TABLE "Photo" ADD COLUMN     "effect" "PhotoEffect" NOT NULL DEFAULT 'NONE';
