import unittest
from pathlib import Path

from src.run_actions_local import ActRunSpec, build_act_command


class BuildCommandTests(unittest.TestCase):
    def test_builds_expected_core_flags(self) -> None:
        spec = ActRunSpec(
            repo_root=Path("/tmp/repo"),
            act_path=Path("/usr/local/bin/act"),
            workflow=None,
            event="push",
            job=None,
            platform=["ubuntu-latest=ghcr.io/catthehacker/ubuntu:act-latest"],
            secrets_file=None,
            env_file=None,
            reuse=False,
            verbose=False,
            dry_run=False,
        )
        cmd = build_act_command(spec)
        self.assertEqual(cmd[0], "/usr/local/bin/act")
        self.assertEqual(cmd[-1], "push")

    def test_includes_optional_args(self) -> None:
        spec = ActRunSpec(
            repo_root=Path("/tmp/repo"),
            act_path=Path("/usr/local/bin/act"),
            workflow="/tmp/repo/.github/workflows/ci.yml",
            event="pull_request",
            job="build",
            platform=["ubuntu-latest=ghcr.io/catthehacker/ubuntu:act-latest"],
            secrets_file=Path("/tmp/secrets"),
            env_file=Path("/tmp/env"),
            reuse=True,
            verbose=True,
            dry_run=False,
        )
        cmd = build_act_command(spec)
        self.assertIn("-W", cmd)
        self.assertIn("/tmp/repo/.github/workflows/ci.yml", cmd)
        self.assertIn("-j", cmd)
        self.assertIn("build", cmd)
        self.assertIn("-P", cmd)
        joined = " ".join(cmd)
        self.assertIn("--secret-file /tmp/secrets", joined)
        self.assertIn("--env-file /tmp/env", joined)
        self.assertIn("--reuse", joined)
        self.assertIn("-v", cmd)
        self.assertEqual(cmd[-1], "pull_request")


if __name__ == "__main__":
    unittest.main()
