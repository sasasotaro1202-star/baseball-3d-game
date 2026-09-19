# Baseball 3D Game — Data & Content Policy

## Historical player data
The content target is approximately 2,000 historically notable players. The game stores factual identity/statistical fields separately from presentation assets.

Primary candidate source for historical MLB statistical data: the SABR Lahman Baseball Database (1871–2025), distributed under CC BY-SA 3.0. When Lahman-derived data is used, attribution and ShareAlike requirements must be preserved. The project must record source/version metadata for every imported dataset.

## Import rules
- Never fabricate player biographies, statistics, awards, or identities.
- Never copy proprietary game databases, ratings, images, audio, animations, or UI assets.
- Keep source IDs and provenance fields so records can be audited and regenerated.
- Treat likenesses/photos/logos as a separate rights review from factual statistics.
- Modern-player content must be reviewed for licensing/right-of-publicity requirements before shipping.

## Player record contract
Every production player record should support: id, name, era, primary position, batting/pitching role, normalized attributes, source, sourceVersion, and sourceId. Derived game ratings must be reproducible from documented formulas rather than hand-tuned hidden values.

## Expansion path
1. Import source data into a normalized intermediate format.
2. Validate IDs, names, positions, duplicate records, and missing fields.
3. Compute transparent game attributes from historical performance with era normalization.
4. Curate a notable-player subset toward the ~2,000 target.
5. Run regression tests and provenance checks before shipping a content batch.
