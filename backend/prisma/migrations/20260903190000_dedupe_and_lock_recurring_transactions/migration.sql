-- A race in the recurring-transaction generator let concurrent requests each believe a
-- given rule+month hadn't been generated yet, producing duplicate transactions (e.g. two
-- "Aluguel" for the same month). This migration removes any such duplicates, keeping the
-- earliest one per (recurringTransactionId, month), then adds a partial unique index so a
-- rule can never again have more than one generated transaction in the same month.

-- CleanupDuplicates
DELETE FROM "Transaction" t
USING (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY "recurringTransactionId", date_trunc('month', date)
           ORDER BY "createdAt" ASC, id ASC
         ) AS rn
  FROM "Transaction"
  WHERE "recurringTransactionId" IS NOT NULL
) dup
WHERE t.id = dup.id AND dup.rn > 1;

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_recurringTransactionId_month_key"
  ON "Transaction" ("recurringTransactionId", (date_trunc('month', date)))
  WHERE "recurringTransactionId" IS NOT NULL;
