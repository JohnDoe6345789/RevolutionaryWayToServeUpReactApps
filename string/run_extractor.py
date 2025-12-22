import subprocess
import sys

try:
    result = subprocess.run(
        ["node", "string/extractor.js", "--project", "--verbose", "--skip-verification"],
        check=True,
        capture_output=True,
        text=True
    )
    print(result.stdout)
    if result.stderr:
        print(result.stderr, file=sys.stderr)
except subprocess.CalledProcessError as e:
    print(f"Error running string extractor: {e}", file=sys.stderr)
    print(e.stdout, file=sys.stdout)
    print(e.stderr, file=sys.stderr)
    sys.exit(1)
