#!/usr/bin/env python3
"""Sync CDN dependency versions from config.json into workspace manifests."""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Dict, Iterable, Mapping, MutableMapping, Sequence, Set, Tuple

DEPENDENCY_SECTIONS = (
    "dependencies",
    "devDependencies",
    "peerDependencies",
    "optionalDependencies",
)

VERSION_PREFIX_RE = re.compile(r"([^0-9]*)")
DEFAULT_MANIFESTS = (Path("test-tooling/package.json"),)


def parse_arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Synchronize package manifest versions with the CDN configuration."
    )
    parser.add_argument(
        "--config",
        type=Path,
        default=Path("config.json"),
        help="Path to the canonical config.json (default: config.json)",
    )
    parser.add_argument(
        "-m",
        "--manifest",
        type=Path,
        action="append",
        metavar="PATH",
        help="Manifest files to update (repeatable; defaults to test-tooling/package.json)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Report the planned changes without writing files.",
    )
    return parser.parse_args()


def load_config(path: Path) -> Mapping[str, object]:
    if not path.exists():
        raise FileNotFoundError(f"Config file not found: {path}")
    return json.loads(path.read_text())


def collect_versions(config: Mapping[str, object]) -> Dict[str, str]:
    versions: Dict[str, str] = {}

    def add_entry(item: Mapping[str, object], key_name: str, source: str) -> None:
        name = item.get(key_name)
        version = item.get("version")
        if not name or not version:
            return
        name = str(name)
        version = str(version)
        existing = versions.get(name)
        if existing and existing != version:
            print(
                f"warning: conflicting versions for {name} (keeping {existing} from another section, skipping {version} from {source})",
                file=sys.stderr,
            )
            return
        versions[name] = version

    for section in ("tools", "modules"):
        for entry in config.get(section, []):
            if isinstance(entry, Mapping):
                add_entry(entry, "name", section)
    for entry in config.get("dynamicModules", []):
        if isinstance(entry, Mapping):
            add_entry(entry, "package", "dynamicModules")
    return versions


def align_version(existing: object, desired: str) -> Tuple[str, bool]:
    existing_str = str(existing).strip()
    if not existing_str or not any(char.isdigit() for char in existing_str):
        return desired, True
    prefix_match = VERSION_PREFIX_RE.match(existing_str)
    prefix = prefix_match.group(1) if prefix_match else ""
    new_version = f"{prefix}{desired}" if prefix else desired
    return new_version, new_version == existing_str


def update_manifest(
    path: Path, versions: Mapping[str, str]
) -> Tuple[Sequence[str], Set[str], Mapping[str, object]]:
    manifest = json.loads(path.read_text())
    if not isinstance(manifest, Mapping):
        raise ValueError(f"Manifest {path} is not a JSON object")

    changed_packages: Set[str] = set()
    seen_packages: Set[str] = set()

    for section in DEPENDENCY_SECTIONS:
        section_data = manifest.get(section)
        if not isinstance(section_data, MutableMapping):
            continue
        for package_name, current_value in list(section_data.items()):
            if package_name not in versions:
                continue
            seen_packages.add(package_name)
            desired_version = versions[package_name]
            updated_version, is_same = align_version(current_value, desired_version)
            if is_same:
                continue
            section_data[package_name] = updated_version
            changed_packages.add(package_name)

    return sorted(changed_packages), seen_packages, manifest


def write_manifest(path: Path, manifest: Mapping[str, object]) -> None:
    path.write_text(json.dumps(manifest, indent=2) + "\n")


def main() -> int:
    args = parse_arguments()
    try:
        config_data = load_config(args.config)
    except FileNotFoundError as exc:
        print(exc, file=sys.stderr)
        return 1

    versions = collect_versions(config_data)
    if not versions:
        print("No versioned entries found in config.json", file=sys.stderr)
        return 1

    overall_seen: Set[str] = set()
    overall_changes: Dict[Path, Sequence[str]] = {}

    manifest_candidates = args.manifest if args.manifest else list(DEFAULT_MANIFESTS)
    for manifest_path in {Path(p) for p in manifest_candidates}:
        if not manifest_path.exists():
            print(f"Skipping missing manifest: {manifest_path}", file=sys.stderr)
            continue
        try:
            changed, seen, updated_manifest = update_manifest(manifest_path, versions)
        except ValueError as exc:
            print(exc, file=sys.stderr)
            return 1
        overall_seen.update(seen)
        if changed:
            overall_changes[manifest_path] = changed
            if not args.dry_run:
                write_manifest(manifest_path, updated_manifest)
            print(
                f"{manifest_path}: synchronized {len(changed)} package(s) -> {', '.join(changed)}"
            )
        else:
            print(f"{manifest_path}: no version changes needed")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
