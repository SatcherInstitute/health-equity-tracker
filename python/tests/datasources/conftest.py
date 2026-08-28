import os

import pandas._testing
import pandas.testing
import test_utils

# Golden CSVs are compared against, never written, during a normal run. Set REGEN_GOLDEN=1
# to instead overwrite each golden with what the code actually produced. Needed after an ACS
# vintage bump, where every merged population denominator legitimately changes at once and
# hand-editing two dozen CSVs is not viable. See python/CLAUDE.md.
if os.environ.get("REGEN_GOLDEN") == "1":
    _PATH_KEY = "het_golden_path"
    _original_load_golden_df = test_utils.load_golden_df
    _original_assert_frame_equal = pandas.testing.assert_frame_equal
    _original_read_csv = pandas.read_csv
    _original_read_json = pandas.read_json

    def _recording_load_golden_df(golden_dir, table_name, dtype=None):
        df = _original_load_golden_df(golden_dir, table_name, dtype)
        # Tag the frame itself. An id()-keyed side table is not safe here: goldens are
        # short-lived and CPython reuses the id of a collected object, which silently
        # writes one table's output over another table's golden.
        df.attrs[_PATH_KEY] = os.path.join(golden_dir, f"{table_name}.csv")
        return df

    def _tagging_reader(original):
        # Several tests bypass load_golden_df and read their golden with a bare
        # pd.read_csv / pd.read_json, so tag by path instead. Reads of anything outside a
        # golden_data directory are left untagged and so are never rewritten.
        def reader(path_or_buf, *args, **kwargs):
            df = original(path_or_buf, *args, **kwargs)
            if isinstance(path_or_buf, str) and _is_golden_path(path_or_buf):
                df.attrs[_PATH_KEY] = path_or_buf
            return df

        return reader

    def _is_golden_path(path: str) -> bool:
        # Most goldens live in a golden_data/ directory; bjs_incarceration instead names
        # its expectation files bjs_test_output_*.json alongside its inputs. Everything
        # else read from python/tests/data/ is source input and must never be rewritten.
        return f"golden_data{os.sep}" in path or "_test_output_" in os.path.basename(path)

    def _write_golden(df, path: str) -> None:
        # Goldens are a mix of .csv and .json (orient="records"); writing one format into
        # the other silently corrupts the file, since the read side only fails later.
        if path.endswith(".json"):
            df.to_json(path, orient="records")
        else:
            df.to_csv(path, index=False)

    def _regenerating_assert_frame_equal(left, right, *args, **kwargs):
        try:
            _original_assert_frame_equal(left, right, *args, **kwargs)
            return
        except AssertionError as mismatch:
            error = mismatch
        # Only rewrite goldens that actually mismatch. Rewriting every golden would also
        # reformat the passing ones, since to_csv does not round-trip the original files
        # byte for byte, and that reformatting alone can break a previously green test.
        # Identify the golden by its tag rather than by argument position, since call
        # sites are not consistent about which side is the expected value.
        for golden, actual in ((left, right), (right, left)):
            path = getattr(golden, "attrs", {}).get(_PATH_KEY)
            if path is not None:
                _write_golden(actual, path)
                print(f"REGENERATED {path}")
                return
        raise error

    test_utils.load_golden_df = _recording_load_golden_df
    pandas.read_csv = _tagging_reader(_original_read_csv)
    pandas.read_json = _tagging_reader(_original_read_json)
    # Test modules import from both spellings; patch each so neither escapes.
    pandas.testing.assert_frame_equal = _regenerating_assert_frame_equal
    pandas._testing.assert_frame_equal = _regenerating_assert_frame_equal  # pylint: disable=protected-access
