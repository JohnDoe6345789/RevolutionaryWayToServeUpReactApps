#!/usr/bin/env python3
"""
Light-weight documentation coverage scanner for JS/TS sources.

The script walks the repository, records every code module (a source file),
top-level globals and function/method candidates, and then checks whether
those names appear in the project's markdown-based API docs.
"""

from __future__ import annotations

import argparse
import os
import re
from pathlib import Path
from typing import Iterable


def collect_source_files(code_root: Path) -> Iterable[Path]:
    extensions = {".js", ".jsx", ".ts", ".tsx"}
    ignore_dirs = {".git", "dist", "node_modules", "build"}

    for root, dirs, files in os.walk(code_root):
        dirs[:] = [d for d in dirs if d not in ignore_dirs]
        for entry in files:
            path = Path(root) / entry
            if path.suffix in extensions:
                yield path


def extract_symbols(text: str) -> tuple[set[str], set[str]]:
    globals_set: set[str] = set()
    functions_set: set[str] = set()

    # crude top-level global catches, assume no leading indentation
    for match in re.finditer(r"^(?:const|let|var)\s+([A-Za-z_]\w*)", text, re.MULTILINE):
        globals_set.add(match.group(1))

    # Various function declaration patterns
    patterns = [
        re.compile(r"\bfunction\s+([A-Za-z_]\w*)\s*\("),
        re.compile(r"\b([A-Za-z_]\w*)\s*=\s*function\b"),
        re.compile(r"\b([A-Za-z_]\w*)\s*=\s*async\s*\("),
        re.compile(r"\b([A-Za-z_]\w*)\s*=\s*\([^)]*\)\s*=>"),
        re.compile(r"\b([A-Za-z_]\w*)\s*:\s*(?:async\s*)?\([^)]*\)\s*=>"),
    ]

    for pattern in patterns:
        for match in pattern.finditer(text):
            functions_set.add(match.group(1))

    return globals_set, functions_set


def load_docs(doc_root: Path) -> str:
    collected = []
    if not doc_root.exists():
        return ""

    for path in doc_root.rglob("*.md"):
        collected.append(path.read_text(encoding="utf-8"))
    return "\n".join(collected)


def is_documented(name: str, doc_text: str) -> bool:
    if not doc_text:
        return False
    return bool(re.search(rf"\b{re.escape(name)}\b", doc_text))


def compute_coverage(names: Iterable[str], doc_text: str) -> tuple[int, int]:
    names_set = set(names)
    if not names_set:
        return 0, 0
    documented = sum(1 for name in names_set if is_documented(name, doc_text))
    return documented, len(names_set)


def main() -> None:
    parser = argparse.ArgumentParser(description="Estimate API doc coverage")
    parser.add_argument("--code-root", default=".", help="Code root folder to scan")
    parser.add_argument("--doc-root", default="docs", help="API doc markdown folder")
    args = parser.parse_args()

    code_root = Path(args.code_root).resolve()
    doc_root = (code_root / args.doc_root).resolve()

    modules: list[str] = []
    globals_names: list[str] = []
    functions_names: list[str] = []

    doc_text = load_docs(doc_root)

    for path in collect_source_files(code_root):
        rel = path.relative_to(code_root)
        modules.append(str(rel))
        text = path.read_text(encoding="utf-8", errors="ignore")
        globals_set, functions_set = extract_symbols(text)
        globals_names.extend(f"{rel}:{name}" for name in globals_set)
        functions_names.extend(f"{rel}:{name}" for name in functions_set)

    module_docged, module_total = compute_coverage(modules, doc_text)
    globals_docged, globals_total = compute_coverage(globals_names, doc_text)
    functions_docged, functions_total = compute_coverage(functions_names, doc_text)

    overall_total = module_total + globals_total + functions_total
    overall_docged = module_docged + globals_docged + functions_docged
    coverage_pct = (overall_docged / overall_total * 100) if overall_total else 100.0

    print("Documentation coverage")
    print("----------------------")
    print(f"Modules:    {module_docged}/{module_total} documented")
    print(f"Globals:    {globals_docged}/{globals_total}")
    print(f"Functions:  {functions_docged}/{functions_total}")
    print(f"Overall:    {coverage_pct:.1f}%")


if __name__ == "__main__":
    main()
