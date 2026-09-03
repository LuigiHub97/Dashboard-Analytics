-- Same situation as the earlier Cartão backfill: DEFAULT_CATEGORIES only seeds categories at
-- registration time, so adding "Outros" to that list doesn't reach accounts created earlier.

INSERT INTO "Category" (id, name, type, "userId", "createdAt")
SELECT md5(random()::text || clock_timestamp()::text || u.id)::uuid::text, 'Outros', 'expense', u.id, now()
FROM "User" u
WHERE NOT EXISTS (
  SELECT 1 FROM "Category" c WHERE c."userId" = u.id AND c.name = 'Outros'
);
