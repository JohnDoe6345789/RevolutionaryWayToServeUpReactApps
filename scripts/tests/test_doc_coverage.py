import sys
import textwrap
import unittest
from contextlib import redirect_stdout
from io import StringIO
from pathlib import Path
from tempfile import TemporaryDirectory

import scripts.doc_coverage as doc_coverage


class TestDocCoverage(unittest.TestCase):
    def test_extract_symbols_finds_globals_and_functions(self):
        source = textwrap.dedent(
            """
        const topLevel = 1
        let another = 2
        var legacy

        function declared() {}
        const arrow = () => {}
        const method: () => void = () => {}
        asyncLocal: async () => {}
        """
        )

        globals_set, functions_set = doc_coverage.extract_symbols(source)
        self.assertIn("topLevel", globals_set)
        self.assertIn("another", globals_set)
        self.assertIn("legacy", globals_set)
        self.assertIn("declared", functions_set)
        self.assertIn("arrow", functions_set)
        self.assertIn("method", functions_set)
        self.assertIn("asyncLocal", functions_set)

    def test_compute_coverage_detects_documented_entries(self):
        doc_text = "moduleA:foo moduleA:bar cables"
        names = ["moduleA:foo", "moduleA:untracked", "moduleA:bar", "moduleB:baz"]

        documented, total = doc_coverage.compute_coverage(names, doc_text)
        self.assertEqual(total, 4)
        self.assertEqual(documented, 2)

    def test_main_writes_twin_in_docs_folder(self):
        with TemporaryDirectory() as tmpdir:
            repo_root = Path(tmpdir) / "repo"
            src_dir = repo_root / "src"
            docs_dir = repo_root / "docs"
            docs_dir.mkdir(parents=True)
            src_dir.mkdir(parents=True)

            module_file = src_dir / "app.js"
            module_file.write_text("const exposed = 1\nfunction helper() {}\n")

            api_dir = docs_dir / "api"
            api_dir.mkdir(parents=True, exist_ok=True)
            (api_dir / "app.md").write_text("app.js:helper")

            argv_backup = sys.argv
            try:
                sys.argv = ["doc_coverage.py", "--code-root", str(repo_root)]
                buffer = StringIO()
                with redirect_stdout(buffer):
                    doc_coverage.main()
                output = buffer.getvalue()
            finally:
                sys.argv = argv_backup

            self.assertIn("Documentation coverage", output)
            self.assertTrue((docs_dir / "api" / "app.md").exists())


    def test_symbol_detection_receives_bare_function_reference(self):
        doc_text = "The loader calls compileSCSS before injectCSS runs."
        symbol_name = "bootstrap/local/sass-compiler.js:compileSCSS"

        self.assertTrue(doc_coverage.is_documented(symbol_name, doc_text))


if __name__ == "__main__":
    unittest.main()
