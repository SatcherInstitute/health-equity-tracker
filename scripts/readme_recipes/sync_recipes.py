"""Refresh the code tabs and line highlights of the ReadMe contributor recipes.

Recipes live on healthequitytracker.readme.io, outside this repo. This script
rebuilds each recipe's code tabs from the real source files and recomputes each
step's highlighted lines from the anchor text declared in recipes.json. Step
titles and prose are never touched here; edit those in the ReadMe editor.

    python3 scripts/readme_recipes/sync_recipes.py check   # exit 1 on drift
    python3 scripts/readme_recipes/sync_recipes.py push    # PATCH drifted recipes

Needs README_API_KEY in the environment. Exit code 2 means an anchor no longer
resolves, so recipes.json needs updating to match the code.
"""

import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
SPEC_PATH = Path(__file__).with_name("recipes.json")
API = "https://api.readme.com/v2/branches/1.0/recipes/"


class AnchorError(Exception):
    pass


def indent_of(line):
    return len(line) - len(line.lstrip())


def find_line(lines, text, start=0):
    for i in range(start, len(lines)):
        if text in lines[i]:
            return i
    raise AnchorError(f"anchor not found: {text!r}")


def find_end(lines, start, anchor):
    """Return the 0-based inclusive end line of a range anchor beginning at start."""
    if "to" in anchor:
        end = find_line(lines, anchor["to"], start)
    elif "count" in anchor:
        end = start + anchor["count"] - 1
    elif anchor.get("block"):
        depth = indent_of(lines[start])
        end = next(
            (
                i
                for i in range(start + 1, len(lines))
                if indent_of(lines[i]) == depth and lines[i].lstrip()[:1] in ("}", "]", ")")
            ),
            None,
        )
        if end is None:
            raise AnchorError(f"no closing line for block: {anchor['from']!r}")
    elif anchor.get("until_dedent"):
        depth = indent_of(lines[start])
        end = next(
            (i for i in range(start + 1, len(lines)) if lines[i].strip() and indent_of(lines[i]) < depth),
            None,
        )
        if end is None:
            raise AnchorError(f"no dedent after: {anchor['from']!r}")
    elif anchor.get("until_blank"):
        end = next(
            (i - 1 for i in range(start, len(lines)) if not lines[i].strip()),
            len(lines) - 1,
        )
    elif anchor.get("to_eof"):
        end = max(i for i, line in enumerate(lines) if line.strip())
    else:
        end = start
    return end + anchor.get("end_offset", 0)


def resolve_anchor(lines, anchor):
    """Return 1-based (first, last) line numbers for one anchor."""
    if isinstance(anchor, str):
        anchor = {"text": anchor}
    if "line" in anchor:
        return [(anchor["line"], anchor["line"])]
    if "import_of" in anchor:
        end = find_line(lines, f"from '{anchor['import_of']}'")
        start = end
        while not lines[start].startswith("import"):
            start -= 1
        return [(start + 1, end + 1)]
    if "all" in anchor:
        lo, hi = 0, len(lines) - 1
        if "within" in anchor:
            ((first, last),) = resolve_anchor(lines, anchor["within"])
            lo, hi = first - 1, last - 1
        hits = [i + 1 for i in range(lo, hi + 1) if anchor["all"] in lines[i]]
        if not hits:
            raise AnchorError(f"anchor not found: {anchor['all']!r}")
        return [(i, i) for i in hits]
    key = "text" if "text" in anchor else "from"
    start = find_line(lines, anchor[key]) + anchor.get("start_offset", 0)
    if key == "text":
        return [(start + 1, start + 1)]
    return [(start + 1, find_end(lines, start, anchor) + 1)]


def format_lines(ranges):
    return ",".join(f"{a}-{b}" if a != b else str(a) for a, b in ranges)


def read_source(path):
    return (REPO_ROOT / path).read_text(encoding="utf-8").rstrip("\n").split("\n")


def build_excerpt(path, parts):
    source = read_source(path)
    out = []
    for part in parts:
        if "literal" in part:
            out.append(part["literal"])
        else:
            start = find_line(source, part["from"]) + part.get("start_offset", 0)
            end = find_end(source, start, part)
            out.extend(source[start : end + 1])
    return out


def build_tab(tab):
    lines = build_excerpt(tab["path"], tab["excerpt"]) if "excerpt" in tab else read_source(tab["path"])
    return f"/* {tab['path']} */\n" + "\n".join(lines) + "\n"


def api_request(slug, method, body=None):
    key = os.environ.get("README_API_KEY")
    if not key:
        sys.exit("README_API_KEY is not set")
    request = urllib.request.Request(
        API + slug,
        method=method,
        data=json.dumps(body).encode() if body else None,
        headers={
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "User-Agent": "het-readme-recipe-sync",
        },
    )
    try:
        with urllib.request.urlopen(request) as response:
            return json.load(response)["data"]
    except urllib.error.HTTPError as error:
        sys.exit(f"ReadMe API {method} {slug} failed: HTTP {error.code}")


def refresh(recipe, live):
    """Return (new_content, list of human-readable drift notes)."""
    content = json.loads(json.dumps(live["content"]))
    options = content["snippet"]["code_options"]
    built = {}
    notes = []
    for tab in recipe["tabs"]:
        if tab.get("keep"):
            continue
        built[tab["name"]] = build_tab(tab)
        existing = next((o for o in options if o["name"] == tab["name"]), None)
        if existing is None:
            options.append(
                {
                    "name": tab["name"],
                    "language": "javascript",
                    "highlighted_syntax": "javascript",
                    "code": built[tab["name"]],
                }
            )
            notes.append(f"tab added: {tab['name']}")
        elif existing["code"] != built[tab["name"]]:
            existing["code"] = built[tab["name"]]
            notes.append(f"tab changed: {tab['name']}")

    steps = content["steps"]
    if len(steps) != len(recipe["steps"]):
        raise AnchorError(
            f"live recipe has {len(steps)} steps but recipes.json has "
            f"{len(recipe['steps'])}; update recipes.json to match"
        )
    for index, (step, spec) in enumerate(zip(steps, recipe["steps"])):
        entries = []
        for highlight in spec["highlights"]:
            lines = built[highlight["tab"]].split("\n")
            ranges = []
            for anchor in highlight["anchors"]:
                ranges.extend(resolve_anchor(lines, anchor))
            entries.append(format_lines(ranges))
        if step["line_numbers"] != entries:
            notes.append(f"step {index + 1} highlights: {step['line_numbers']} -> {entries}")
            step["line_numbers"] = entries
    return content, notes


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "check"
    only = sys.argv[2] if len(sys.argv) > 2 else None
    if mode not in ("check", "push"):
        sys.exit(__doc__)
    spec = json.loads(SPEC_PATH.read_text(encoding="utf-8"))
    drifted = failed = False
    for recipe in spec["recipes"]:
        if only and recipe["slug"] != only:
            continue
        live = api_request(recipe["slug"], "GET")
        try:
            content, notes = refresh(recipe, live)
        except AnchorError as error:
            failed = True
            print(f"ERROR {recipe['slug']}: {error}")
            continue
        if not notes:
            print(f"ok      {recipe['slug']}")
            continue
        drifted = True
        print(f"drift   {recipe['slug']}")
        for note in notes:
            print(f"          {note}")
        if mode == "push":
            api_request(
                recipe["slug"],
                "PATCH",
                {"description": live["description"], "content": content},
            )
            print("          pushed")
    if failed:
        sys.exit(2)
    if drifted and mode == "check":
        sys.exit(1)


if __name__ == "__main__":
    main()
