/*
  Warnings:

  - You are about to drop the `notification-preference` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "notification-preference" DROP CONSTRAINT "notification-preference_userId_fkey";

-- DropTable
DROP TABLE "notification-preference";

-- DropEnum
DROP TYPE "NotificationStatus";

-- CreateTable
CREATE TABLE "notification_preference" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "important" "MediumTypeEnum"[] DEFAULT ARRAY['mobile']::"MediumTypeEnum"[],
    "promotional" "MediumTypeEnum"[] DEFAULT ARRAY['email']::"MediumTypeEnum"[],
    "notice" "MediumTypeEnum"[] DEFAULT ARRAY['email']::"MediumTypeEnum"[],
    "billing" "MediumTypeEnum"[] DEFAULT ARRAY['mobile']::"MediumTypeEnum"[],
    "updates" "MediumTypeEnum"[] DEFAULT ARRAY['email']::"MediumTypeEnum"[],
    "createdAt" TEXT NOT NULL,
    "updatedAt" TEXT,

    CONSTRAINT "notification_preference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "notification_preference_userId_key" ON "notification_preference"("userId");

-- AddForeignKey
ALTER TABLE "notification_preference" ADD CONSTRAINT "notification_preference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
