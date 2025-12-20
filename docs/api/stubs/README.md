# Stub generation

The `stubs/` directory contains generated placeholder docs that can be converted into real references.

## Regeneration

- Run `python3 scripts/generate_api_stubs.py` to recreate the placeholders.
- After converting a stub into a real doc, delete the placeholder so it no longer appears under `stubs/`.

These files are intentionally excluded from coverage so you can freely scaffold without affecting the reporting.
