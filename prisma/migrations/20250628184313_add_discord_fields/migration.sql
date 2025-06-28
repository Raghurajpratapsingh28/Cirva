-- AlterTable
ALTER TABLE "User" ADD COLUMN     "discordAvatar" TEXT,
ADD COLUMN     "discordDiscriminator" TEXT,
ADD COLUMN     "discordEmail" TEXT,
ADD COLUMN     "discordGuildCount" INTEGER,
ADD COLUMN     "discordId" TEXT,
ADD COLUMN     "discordMfaEnabled" BOOLEAN,
ADD COLUMN     "discordPremiumType" INTEGER,
ADD COLUMN     "discordProfileUrl" TEXT,
ADD COLUMN     "discordVerified" BOOLEAN;
