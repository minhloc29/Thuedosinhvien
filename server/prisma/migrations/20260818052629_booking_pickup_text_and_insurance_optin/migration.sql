-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_pickupPointId_fkey";

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "pickupName" TEXT,
ALTER COLUMN "pickupPointId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_pickupPointId_fkey" FOREIGN KEY ("pickupPointId") REFERENCES "PickupPoint"("id") ON DELETE SET NULL ON UPDATE CASCADE;
