#!/usr/bin/env python3
"""Run GitHub Actions workflows locally via the act binary.

Design goals:
- Run from any directory, targeting a repo root explicitly.
- Do not modify the repo except what the workflow itself does.
- Works on Linux/macOS/Windows (Docker Desktop) when Docker is running.
- Download and cache the official act binary from github.com/nektos/act if needed.
"""

from __future__ import annotations

import argparse
import logging
import shlex
import subprocess
from collections.abc import Sequence
from dataclasses import dataclass
from pathlib import Path

from src.act_binary import ensure_act_binary

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class ActRunSpec:
    repo_root: Path
    act_path: Path
    workflow: str | None
    event: str
    job: str | None
    platform: list[str]
    secrets_file: Path | None
    env_file: Path | None
    reuse: bool
    verbose: bool
    dry_run: bool


def _abs_path(path: Path) -> Path:
    return path.expanduser().resolve()


def _repo_root(path: str) -> Path:
    root = _abs_path(Path(path))
    if not (root / ".github" / "workflows").exists():
        raise SystemExit(f"Repo root must contain .github/workflows: {root}")
    return root


def _file_arg(flag: str, path: Path | None) -> list[str]:
    if not path:
        return []
    return [flag, str(_abs_path(path))]


def _platform_args(items: Sequence[str]) -> list[str]:
    args: list[str] = []
    for item in items:
        args.extend(["-P", item])
    return args


def _workflow_args(path: str | None) -> list[str]:
    if not path:
        return []
    return ["-W", path]


def _job_args(job: str | None) -> list[str]:
    if not job:
        return []
    return ["-j", job]


def _event_args(event: str) -> list[str]:
    return [event]


def _reuse_args(reuse: bool) -> list[str]:
    return ["--reuse"] if reuse else []


def _verbose_args(verbose: bool) -> list[str]:
    return ["-v"] if verbose else []


def build_act_command(spec: ActRunSpec) -> list[str]:
    cmd: list[str] = [str(spec.act_path)]
    cmd.extend(_workflow_args(spec.workflow))
    cmd.extend(_job_args(spec.job))
    cmd.extend(_platform_args(spec.platform))
    cmd.extend(_file_arg("--secret-file", spec.secrets_file))
    cmd.extend(_file_arg("--env-file", spec.env_file))
    cmd.extend(_reuse_args(spec.reuse))
    cmd.extend(_verbose_args(spec.verbose))
    cmd.extend(_event_args(spec.event))
    return cmd


def _print_command(cmd: Sequence[str]) -> None:
    printable = " ".join(shlex.quote(part) for part in cmd)
    print(printable)
    logger.info("Dry-run act command: %s", printable)


def _run(cmd: Sequence[str], cwd: Path) -> int:
    logger.info("Running act command from %s", cwd)
    logger.debug("Act command: %s", shlex.join(cmd))
    return subprocess.call(list(cmd), cwd=cwd)


def _configure_logging(verbose: bool) -> None:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
    if verbose:
        logging.getLogger().setLevel(logging.DEBUG)


def _maybe_print_and_exit(spec: ActRunSpec, cmd: Sequence[str]) -> None:
    if spec.dry_run:
        _print_command(cmd)
        logger.info("Dry-run flag set; exiting without running act.")
        raise SystemExit(0)


def _parse_platform(values: list[str] | None) -> list[str]:
    if not values:
        return []
    out: list[str] = []
    for v in values:
        out.extend([p.strip() for p in v.split(",") if p.strip()])
    return out


def _default_platforms() -> list[str]:
    return ["ubuntu-latest=ghcr.io/catthehacker/ubuntu:act-latest"]


def _platforms_or_default(items: list[str]) -> list[str]:
    return items if items else _default_platforms()


def _resolve_act_path(custom: Path | None) -> Path:
    if custom:
        return ensure_act_binary(custom)
    return ensure_act_binary()


def parse_args(argv: Sequence[str] | None = None) -> argparse.Namespace:
    p = argparse.ArgumentParser(
        description=(
            "Run GitHub Actions workflows locally (repo-root) using act." 
        )
    )
    p.add_argument(
        "--repo-root",
        required=True,
        help="Path to the repository root (must contain .github/workflows).",
    )
    p.add_argument(
        "--workflow",
        help=(
            "Optional workflow path or directory passed to act (-W). "
            "Example: .github/workflows/ci.yml"
        ),
    )
    p.add_argument(
        "--event",
        default="push",
        help="GitHub event to simulate (default: push).",
    )
    p.add_argument("--job", help="Optional job id/name to run (-j).")
    p.add_argument(
        "--platform",
        action="append",
        help=(
            "Platform mapping(s) (-P). "
            "Example: --platform ubuntu-latest="
            "ghcr.io/catthehacker/ubuntu:act-latest"
        ),
    )
    p.add_argument(
        "--secrets-file",
        type=Path,
        help="Path to act secrets file.",
    )
    p.add_argument(
        "--env-file",
        type=Path,
        help="Path to act env file.",
    )
    p.add_argument(
        "--act-path",
        type=Path,
        help="Path to an existing act binary (skip download).",
    )
    p.add_argument(
        "--reuse",
        action="store_true",
        help="Reuse containers between runs (act --reuse).",
    )
    p.add_argument(
        "--verbose",
        action="store_true",
        help="Verbose output (act -v).",
    )
    p.add_argument(
        "--dry-run",
        action="store_true",
        help="Print the act command and exit without executing.",
    )
    return p.parse_args(argv)


def _build_spec(args: argparse.Namespace) -> ActRunSpec:
    repo_root = _repo_root(args.repo_root)
    platforms = _platforms_or_default(_parse_platform(args.platform))
    workflow = args.workflow
    if workflow:
        wf = Path(workflow)
        if not wf.is_absolute():
            workflow = str((repo_root / wf).resolve())
    logger.debug("Resolved repo root: %s", repo_root)
    logger.debug("Platforms: %s", platforms)
    logger.debug("Resolved workflow path: %s", workflow or '<none>')
    act_path = _resolve_act_path(args.act_path)
    logger.debug("Act binary path: %s", act_path)
    return ActRunSpec(
        repo_root=repo_root,
        act_path=act_path,
        workflow=workflow,
        event=args.event,
        job=args.job,
        platform=platforms,
        secrets_file=args.secrets_file,
        env_file=args.env_file,
        reuse=bool(args.reuse),
        verbose=bool(args.verbose),
        dry_run=bool(args.dry_run),
    )


def main(argv: Sequence[str] | None = None) -> int:
    args = parse_args(argv)
    _configure_logging(args.verbose)
    spec = _build_spec(args)
    logger.debug("Act run spec: %s", spec)
    cmd = build_act_command(spec)
    logger.debug("Act command to execute: %s", shlex.join(cmd))
    _maybe_print_and_exit(spec, cmd)
    return _run(cmd, spec.repo_root)


if __name__ == "__main__":
    raise SystemExit(main())
