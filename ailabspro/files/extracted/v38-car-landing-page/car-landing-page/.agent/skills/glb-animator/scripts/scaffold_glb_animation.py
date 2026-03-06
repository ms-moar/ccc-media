#!/usr/bin/env python3
import argparse
from pathlib import Path

TEMPLATE_DIR = Path(__file__).resolve().parent.parent / "assets" / "templates"


def render_template(text: str, replacements: dict) -> str:
    for key, value in replacements.items():
        text = text.replace("{{" + key + "}}", value)
    return text


def write_file(path: Path, content: str, force: bool) -> None:
    if path.exists() and not force:
        raise FileExistsError(f"File already exists: {path}")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Scaffold a React Three Fiber + Theatre.js scene with scroll binding."
    )
    parser.add_argument("--glb", required=True, help="Public path to the GLB (e.g. /models/car.glb)")
    parser.add_argument("--out-dir", required=True, help="Directory to place generated components")
    parser.add_argument("--scene-name", default="Scene", help="Scene component name")
    parser.add_argument("--canvas-name", default="CanvasRoot", help="Canvas wrapper component name")
    parser.add_argument("--project-name", default="GLB Animation", help="Theatre project name")
    parser.add_argument("--sheet-name", default="Scene", help="Theatre sheet name")
    parser.add_argument("--pages", default="3", help="ScrollControls pages value")
    parser.add_argument(
        "--with-page",
        default="",
        help="Optional path to a Next.js app router page file to create",
    )
    parser.add_argument("--force", action="store_true", help="Overwrite files if they exist")

    args = parser.parse_args()

    out_dir = Path(args.out_dir).resolve()
    scene_path = out_dir / f"{args.scene_name}.tsx"
    canvas_path = out_dir / f"{args.canvas_name}.tsx"

    scene_template = (TEMPLATE_DIR / "Scene.tsx").read_text(encoding="utf-8")
    canvas_template = (TEMPLATE_DIR / "CanvasRoot.tsx").read_text(encoding="utf-8")

    replacements = {
        "GLB_PATH": args.glb,
        "SCENE_COMPONENT": args.scene_name,
        "CANVAS_COMPONENT": args.canvas_name,
        "PROJECT_NAME": args.project_name,
        "SHEET_NAME": args.sheet_name,
        "PAGES": str(args.pages),
    }

    scene_output = render_template(scene_template, replacements)
    canvas_output = render_template(canvas_template, replacements)

    write_file(scene_path, scene_output, args.force)
    write_file(canvas_path, canvas_output, args.force)

    if args.with_page:
        page_path = Path(args.with_page).resolve()
        page_content = f"""\
import {args.canvas_name} from \"./{out_dir.name}/{args.canvas_name}\";

export default function Page() {{
  return (
    <main className=\"min-h-screen w-full\">
      <{args.canvas_name} />
    </main>
  );
}}
"""
        write_file(page_path, page_content, args.force)


if __name__ == "__main__":
    main()
