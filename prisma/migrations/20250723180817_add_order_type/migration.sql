-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('ONLINE', 'FISICA');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "orderType" "OrderType" NOT NULL DEFAULT 'ONLINE';
