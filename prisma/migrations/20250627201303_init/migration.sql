-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "publicKey" TEXT NOT NULL,
    "githubUsername" TEXT,
    "twitterUsername" TEXT,
    "discordUsername" TEXT,
    "isVerifiedGithub" BOOLEAN NOT NULL DEFAULT false,
    "isVerifiedTwitter" BOOLEAN NOT NULL DEFAULT false,
    "isVerifiedDiscord" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_publicKey_key" ON "User"("publicKey");
