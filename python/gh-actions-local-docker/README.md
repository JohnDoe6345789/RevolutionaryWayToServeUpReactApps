# GitHub Actions Local Runner (act binary)

This project runs your repository's GitHub Actions workflows locally using the official `act` binary from https://github.com/nektos/act/releases. When you do not provide an existing binary, the script downloads and caches the latest release for your platform so you can keep working without shipping a container image yourself.

## Prerequisites

- Docker installed and running (act itself still launches containers).
- Python 3.10 or later.

## Usage

Run all workflows for `push`:

```bash
python -m src.run_actions_local --repo-root /path/to/repo --event push
```

Run a specific workflow file:

```bash
python -m src.run_actions_local --repo-root /path/to/repo --workflow .github/workflows/ci.yml
```

Run a specific job:

```bash
python -m src.run_actions_local --repo-root /path/to/repo --job build
```

Provide secrets/env files (act format):

```bash
python -m src.run_actions_local --repo-root /path/to/repo --secrets-file ./secrets.txt --env-file ./env.txt
```

Print the act command only:

```bash
python -m src.run_actions_local --repo-root /path/to/repo --dry-run
```

Indicate an existing act binary if you have one already:

```bash
python -m src.run_actions_local --repo-root /path/to/repo --act-path /usr/local/bin/act
```

## Notes

- The latest act release is cached under `ACT_CACHE_DIR` (falls back to `$XDG_CACHE_HOME/act` or `~/.cache/act`).
- When no binary exists locally, the script downloads it from the latest GitHub release before running.
- The runner executes `act` from the repository root you point it at, so it does not rely on binding a directory inside another container.
- The helper logs the resolved `act` command before invoking it; use `--verbose` for DEBUG-level context about how the workflow spec was resolved.
