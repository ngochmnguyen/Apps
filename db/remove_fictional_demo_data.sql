-- Removes the 16 fictional/demo opportunities from db/seed.sql (invented for
-- building and testing the app before any real data existed — "Gulf
-- Innovation Summit," "Steppe Climate Alliance," etc. are not real
-- organizations). These should never have been left live in production
-- alongside the real, verified opportunities. Junction table rows (education
-- levels, career stages, nationality rules, soft tags) cascade-delete
-- automatically via their FK constraints.
--
-- Run this once, in Neon's SQL Editor, against the production database.
-- Safe to re-run — DELETE on a already-removed row is a no-op.

DELETE FROM opportunities WHERE id IN (
  'a67d04dc-bbc9-4ad4-8f4f-4592eaa6f18a', -- Central Asia Youth Climate Fellowship
  '242ba7c4-89ac-45d1-b762-e5106c6d20bb', -- West Africa Renewable Energy Conference
  '7120e61e-a73d-4bf3-8446-b387a5ab72cb', -- Gulf Innovation Summit
  '5e3b6bc7-d076-4096-9006-40794535bfb8', -- Mongolia Steppe Research Residency
  '3ecf5f95-cfe4-411b-94ab-4aabe6a751f1', -- Pacific Islands Ocean Policy Internship
  '482389b9-beb2-4d02-a2dd-68b24f456479', -- Berlin Fintech Hackathon
  '24794605-c84d-4e22-94c6-cd5560901c1c', -- Uzbekistan Silk Road Heritage Fellowship
  '975ef492-d0b0-4f21-903d-7d3f04274017', -- Nairobi Impact Work-Study Exchange
  '6b657c82-ccf8-410e-bc4d-b6031ceb4d27', -- Patagonia Trail Work Stay
  '3a7aa758-2993-4b93-a8bb-a46bcca54cac', -- Seoul Semiconductor Brand Ambassador Contest
  '2831489d-e8b0-45e6-a7ae-93fa9d0a5e9b', -- UAE Government Fellows Program
  'c84e525f-9e1d-44bc-acf1-6f753d121609', -- Global South Women in Tech Conference
  'dc9aedb4-f291-4948-b207-21634af221af', -- Bishkek Digital Nomad Work-Study
  '7af1cb7c-677b-4434-acc0-bf1bd94bc0a9', -- Antarctica Gateway Research Support Program
  '01840389-3a54-420a-b5de-fc920075f299', -- London Global Policy Fellowship
  '70e6f30f-244b-42bf-9ba1-083d850f9635'  -- Andean Highlands Teaching Fellowship
);
