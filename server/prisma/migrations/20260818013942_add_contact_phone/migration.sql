-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "contactName" TEXT,
ADD COLUMN     "contactPhone" TEXT;

-- AlterTable
ALTER TABLE "Consignment" ADD COLUMN     "contactName" TEXT,
ADD COLUMN     "contactPhone" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phone" TEXT;
