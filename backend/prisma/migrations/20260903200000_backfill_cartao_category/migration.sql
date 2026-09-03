-- DEFAULT_CATEGORIES in auth.controller.ts is only applied at registration time, so adding
-- "Cartão" to that list didn't retroactively reach accounts created before the change. This
-- backfills a "Cartão" (expense) category for every existing user who doesn't already have one.

INSERT INTO "Category" (id, name, type, "userId", "createdAt")
SELECT md5(random()::text || clock_timestamp()::text || u.id)::uuid::text, 'Cartão', 'expense', u.id, now()
FROM "User" u
WHERE NOT EXISTS (
  SELECT 1 FROM "Category" c WHERE c."userId" = u.id AND c.name = 'Cartão'
);
