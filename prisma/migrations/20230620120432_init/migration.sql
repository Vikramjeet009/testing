-- CreateEnum
CREATE TYPE "RoleTypeEnum" AS ENUM ('user');

-- CreateEnum
CREATE TYPE "AccountTypeEnum" AS ENUM ('active', 'deactive', 'banned');

-- CreateEnum
CREATE TYPE "LanguageEnum" AS ENUM ('en', 'ar', 'hi', 'fr', 'pt');

-- CreateEnum
CREATE TYPE "AuthProviderEnum" AS ENUM ('google', 'facebook');

-- CreateEnum
CREATE TYPE "MediumTypeEnum" AS ENUM ('sms', 'mobile', 'email', 'whatsapp', 'web');

-- CreateEnum
CREATE TYPE "NotificationTypeEnum" AS ENUM ('promotional', 'important', 'notice', 'billing', 'updates');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('pending', 'delivered', 'failed');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL,
    "mobile" INTEGER NOT NULL,
    "mobileVerified" BOOLEAN NOT NULL,
    "fullname" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "image" TEXT,
    "role" "RoleTypeEnum" NOT NULL DEFAULT 'user',
    "accountStatus" "AccountTypeEnum" NOT NULL DEFAULT 'active',
    "language" "LanguageEnum" NOT NULL DEFAULT 'en',
    "timezone" TEXT NOT NULL,
    "createdAt" TEXT NOT NULL,
    "updatedAt" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_token" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "provider" "AuthProviderEnum" NOT NULL,
    "token" JSONB NOT NULL,
    "tokenExpiresIn" TEXT NOT NULL,
    "createdAt" TEXT NOT NULL,
    "updatedAt" TEXT,

    CONSTRAINT "user_token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_login_activity" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "source" TEXT,
    "ip" TEXT NOT NULL,
    "country" TEXT,
    "state" TEXT,
    "city" TEXT,
    "platform" TEXT,
    "browser" TEXT,
    "device" TEXT,
    "createdAt" TEXT NOT NULL,
    "updatedAt" TEXT,

    CONSTRAINT "user_login_activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_otp" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "otp" TEXT NOT NULL,
    "expiresAt" TEXT NOT NULL,
    "createdAt" TEXT NOT NULL,

    CONSTRAINT "user_otp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification-preference" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "important" "MediumTypeEnum"[] DEFAULT ARRAY['mobile']::"MediumTypeEnum"[],
    "promotional" "MediumTypeEnum"[] DEFAULT ARRAY['email']::"MediumTypeEnum"[],
    "notice" "MediumTypeEnum"[] DEFAULT ARRAY['email']::"MediumTypeEnum"[],
    "billing" "MediumTypeEnum"[] DEFAULT ARRAY['mobile']::"MediumTypeEnum"[],
    "updates" "MediumTypeEnum"[] DEFAULT ARRAY['email']::"MediumTypeEnum"[],
    "createdAt" TEXT NOT NULL,
    "updatedAt" TEXT,

    CONSTRAINT "notification-preference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "notificationType" "NotificationTypeEnum"[],
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "seen" BOOLEAN NOT NULL,
    "createdAt" TEXT NOT NULL,
    "updatedAt" TEXT,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_mobile_key" ON "users"("mobile");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_id_username_idx" ON "users"("id", "username");

-- CreateIndex
CREATE INDEX "user_token_userId_idx" ON "user_token"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_otp_otp_key" ON "user_otp"("otp");

-- CreateIndex
CREATE UNIQUE INDEX "notification-preference_userId_key" ON "notification-preference"("userId");

-- AddForeignKey
ALTER TABLE "user_token" ADD CONSTRAINT "user_token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_login_activity" ADD CONSTRAINT "user_login_activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_otp" ADD CONSTRAINT "user_otp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification-preference" ADD CONSTRAINT "notification-preference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
