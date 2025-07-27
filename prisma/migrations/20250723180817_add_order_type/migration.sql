/*
  Warnings:

  - The `orderType` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('ONLINE', 'FISICA');

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "orderType",
ADD COLUMN     "orderType" "OrderType" NOT NULL DEFAULT 'ONLINE';
