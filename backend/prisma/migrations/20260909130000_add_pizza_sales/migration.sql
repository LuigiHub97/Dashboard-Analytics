-- CreateTable
CREATE TABLE "PizzaSale" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pizzaId" TEXT,
    "pizzaName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "commissionPct" DOUBLE PRECISION NOT NULL,
    "unitCmv" DOUBLE PRECISION NOT NULL,
    "totalRevenue" DOUBLE PRECISION NOT NULL,
    "totalCost" DOUBLE PRECISION NOT NULL,
    "totalProfit" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PizzaSale_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PizzaSale_userId_idx" ON "PizzaSale"("userId");

-- CreateIndex
CREATE INDEX "PizzaSale_userId_date_idx" ON "PizzaSale"("userId", "date");

-- AddForeignKey
ALTER TABLE "PizzaSale" ADD CONSTRAINT "PizzaSale_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PizzaSale" ADD CONSTRAINT "PizzaSale_pizzaId_fkey" FOREIGN KEY ("pizzaId") REFERENCES "Pizza"("id") ON DELETE SET NULL ON UPDATE CASCADE;
