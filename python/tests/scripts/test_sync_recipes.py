import importlib.util
from pathlib import Path

import pytest

SCRIPT = Path(__file__).resolve().parents[3] / "scripts" / "readme_recipes" / "sync_recipes.py"
spec = importlib.util.spec_from_file_location("sync_recipes", SCRIPT)
sync = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sync)

SOURCE = """import { a } from './a'
import {
  b,
  c,
} from './bc'

export const CONFIG = {
  one: 1,
  nested: {
    two: 2,
  },
}

export type Ids =
  | 'x'
  | 'y'

function outer() {
  const inner = 1
    deeper()
  return inner
}
other()
""".split(
    "\n"
)


def test_text_anchor_is_single_line():
    assert sync.resolve_anchor(SOURCE, "export const CONFIG") == [(7, 7)]


def test_block_anchor_stops_at_matching_close():
    assert sync.resolve_anchor(SOURCE, {"from": "export const CONFIG", "block": True}) == [(7, 12)]


def test_count_and_offsets():
    assert sync.resolve_anchor(SOURCE, {"from": "export const CONFIG", "count": 3}) == [(7, 9)]
    assert sync.resolve_anchor(SOURCE, {"from": "one: 1", "start_offset": -1, "to": "two: 2", "end_offset": 1}) == [
        (7, 11)
    ]


def test_until_blank_and_dedent():
    assert sync.resolve_anchor(SOURCE, {"from": "export type Ids", "until_blank": True}) == [(14, 16)]
    assert sync.resolve_anchor(SOURCE, {"from": "const inner", "until_dedent": True}) == [(19, 22)]


def test_to_eof_ignores_trailing_blank_lines():
    assert sync.resolve_anchor(SOURCE + ["", ""], {"from": "function outer", "to_eof": True}) == [(18, 23)]


def test_import_of_walks_back_to_multiline_import_start():
    assert sync.resolve_anchor(SOURCE, {"import_of": "./bc"}) == [(2, 5)]
    assert sync.resolve_anchor(SOURCE, {"import_of": "./a"}) == [(1, 1)]


def test_all_with_within_scopes_the_search():
    inner = {"from": "export const CONFIG", "block": True}
    assert sync.resolve_anchor(SOURCE, {"all": ":", "within": inner}) == [(8, 8), (9, 9), (10, 10)]
    assert sync.resolve_anchor(SOURCE, {"all": "()"}) == [(18, 18), (20, 20), (23, 23)]


def test_literal_line_anchor():
    assert sync.resolve_anchor(SOURCE, {"line": 4}) == [(4, 4)]


def test_missing_anchors_raise():
    with pytest.raises(sync.AnchorError):
        sync.resolve_anchor(SOURCE, "does not exist")
    with pytest.raises(sync.AnchorError):
        sync.resolve_anchor(SOURCE, {"all": "does not exist"})
    with pytest.raises(sync.AnchorError):
        sync.resolve_anchor(SOURCE, {"from": "const inner", "to": "nope"})


def test_format_lines_collapses_single_line_ranges():
    assert sync.format_lines([(3, 3), (5, 9)]) == "3,5-9"


def test_refresh_reports_tab_and_highlight_drift(monkeypatch):
    monkeypatch.setattr(sync, "read_source", lambda path: SOURCE)
    recipe = {
        "tabs": [{"name": "T", "path": "f.ts"}, {"name": "kept", "keep": True}],
        "steps": [{"highlights": [{"tab": "T", "anchors": ["export const CONFIG"]}]}],
    }
    live = {
        "content": {
            "snippet": {"code_options": [{"name": "T", "code": "stale"}, {"name": "kept", "code": "x"}]},
            "steps": [{"line_numbers": ["1"]}],
        }
    }
    content, notes = sync.refresh(recipe, live)
    assert any(n.startswith("tab changed: T") for n in notes)
    assert any(n.startswith("step 1 highlights") for n in notes)
    assert content["steps"][0]["line_numbers"] == ["8"]
    assert live["content"]["steps"][0]["line_numbers"] == ["1"]

    _, second = sync.refresh(recipe, {"content": content})
    assert second == []


def test_refresh_rejects_step_count_mismatch(monkeypatch):
    monkeypatch.setattr(sync, "read_source", lambda path: SOURCE)
    recipe = {"tabs": [{"name": "T", "path": "f.ts"}], "steps": [{"highlights": []}]}
    live = {"content": {"snippet": {"code_options": []}, "steps": []}}
    with pytest.raises(sync.AnchorError):
        sync.refresh(recipe, live)
