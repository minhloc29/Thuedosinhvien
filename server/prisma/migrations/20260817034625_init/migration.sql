-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "studentId" TEXT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PickupPoint" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hours" TEXT NOT NULL,

    CONSTRAINT "PickupPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Consignment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "seniorId" TEXT NOT NULL,
    "estimatedValue" INTEGER NOT NULL,
    "desc" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "productId" TEXT,

    CONSTRAINT "Consignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "pricePerDay" INTEGER NOT NULL,
    "marketValue" INTEGER NOT NULL,
    "grade" TEXT NOT NULL,
    "sealCode" TEXT NOT NULL,
    "appraisedAt" TIMESTAMP(3) NOT NULL,
    "lastTestedAt" TIMESTAMP(3) NOT NULL,
    "desc" TEXT NOT NULL,
    "specs" TEXT NOT NULL,
    "included" TEXT NOT NULL,
    "notIncluded" TEXT NOT NULL,
    "seniorId" TEXT NOT NULL,
    "splitSeniorPct" INTEGER NOT NULL,
    "splitPlatformPct" INTEGER NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "rentedCount" INTEGER NOT NULL DEFAULT 0,
    "earnedSoFar" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "unavailableDays" TEXT NOT NULL DEFAULT '[]',

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "renterId" TEXT NOT NULL,
    "pickupPointId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "nights" INTEGER NOT NULL,
    "rentalCost" INTEGER NOT NULL,
    "deposit" INTEGER NOT NULL,
    "insuranceFee" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "handoverAt" TIMESTAMP(3),
    "returnAt" TIMESTAMP(3),
    "depositReturned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LedgerEntry" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "bookingId" TEXT,
    "productId" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_studentId_key" ON "User"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Consignment_productId_key" ON "Consignment"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sealCode_key" ON "Product"("sealCode");

-- AddForeignKey
ALTER TABLE "Consignment" ADD CONSTRAINT "Consignment_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consignment" ADD CONSTRAINT "Consignment_seniorId_fkey" FOREIGN KEY ("seniorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consignment" ADD CONSTRAINT "Consignment_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_seniorId_fkey" FOREIGN KEY ("seniorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_renterId_fkey" FOREIGN KEY ("renterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_pickupPointId_fkey" FOREIGN KEY ("pickupPointId") REFERENCES "PickupPoint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
