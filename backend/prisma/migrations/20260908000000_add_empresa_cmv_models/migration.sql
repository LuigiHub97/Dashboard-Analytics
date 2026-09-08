-- AlterTable
ALTER TABLE "User" ADD COLUMN "businessName" TEXT;

-- CreateTable
CREATE TABLE "Ingredient" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "pricePerUnit" DOUBLE PRECISION NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ingredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pizza" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "packagingCost" DOUBLE PRECISION NOT NULL,
    "energyCost" DOUBLE PRECISION NOT NULL,
    "waterCost" DOUBLE PRECISION NOT NULL,
    "ingredientsCost" DOUBLE PRECISION NOT NULL,
    "totalCost" DOUBLE PRECISION NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pizza_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PizzaIngredient" (
    "id" TEXT NOT NULL,
    "pizzaId" TEXT NOT NULL,
    "ingredientId" TEXT,
    "ingredientName" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "pricePerUnitAtUse" DOUBLE PRECISION NOT NULL,
    "lineCost" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PizzaIngredient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ingredient_userId_name_key" ON "Ingredient"("userId", "name");

-- CreateIndex
CREATE INDEX "Ingredient_userId_idx" ON "Ingredient"("userId");

-- CreateIndex
CREATE INDEX "Pizza_userId_idx" ON "Pizza"("userId");

-- CreateIndex
CREATE INDEX "Pizza_userId_createdAt_idx" ON "Pizza"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "PizzaIngredient_pizzaId_idx" ON "PizzaIngredient"("pizzaId");

-- AddForeignKey
ALTER TABLE "Ingredient" ADD CONSTRAINT "Ingredient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pizza" ADD CONSTRAINT "Pizza_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PizzaIngredient" ADD CONSTRAINT "PizzaIngredient_pizzaId_fkey" FOREIGN KEY ("pizzaId") REFERENCES "Pizza"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PizzaIngredient" ADD CONSTRAINT "PizzaIngredient_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE SET NULL ON UPDATE CASCADE;
