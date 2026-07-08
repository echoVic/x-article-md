from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parent
BG_DIR = ROOT / "gpt-bg"
OUT_DIR = ROOT / "final"
OUT_DIR.mkdir(parents=True, exist_ok=True)

W, H = 1080, 1440

FONT_REGULAR = "/System/Library/Fonts/Hiragino Sans GB.ttc"
FONT_MEDIUM = "/System/Library/Fonts/STHeiti Medium.ttc"


def font(size: int, medium: bool = False) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(FONT_MEDIUM if medium else FONT_REGULAR, size=size)


def cover_resize(path: Path) -> Image.Image:
    img = Image.open(path).convert("RGB")
    iw, ih = img.size
    scale = max(W / iw, H / ih)
    nw, nh = int(iw * scale), int(ih * scale)
    img = img.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - W) // 2
    top = (nh - H) // 2
    img = img.crop((left, top, left + W, top + H))
    img = ImageEnhance.Color(img).enhance(0.8)
    img = ImageEnhance.Contrast(img).enhance(0.92)
    img = ImageEnhance.Brightness(img).enhance(1.08)
    return img


def draw_round(draw: ImageDraw.ImageDraw, box, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def text_size(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.FreeTypeFont) -> tuple[int, int]:
    box = draw.textbbox((0, 0), text, font=fnt)
    return box[2] - box[0], box[3] - box[1]


def wrap_text(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.FreeTypeFont, max_width: int) -> list[str]:
    lines: list[str] = []
    for raw in text.split("\n"):
        line = ""
        for ch in raw:
            test = line + ch
            if text_size(draw, test, fnt)[0] <= max_width:
                line = test
            else:
                if line:
                    lines.append(line)
                line = ch
        if line:
            lines.append(line)
    return lines


def draw_text_block(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int],
    text: str,
    fnt: ImageFont.FreeTypeFont,
    fill: str,
    max_width: int,
    line_gap: int = 14,
) -> int:
    x, y = xy
    for line in wrap_text(draw, text, fnt, max_width):
        draw.text((x, y), line, font=fnt, fill=fill)
        y += text_size(draw, line, fnt)[1] + line_gap
    return y


def add_scrim(base: Image.Image, strength: int = 220) -> Image.Image:
    overlay = Image.new("RGBA", (W, H), (255, 255, 255, strength))
    base = base.convert("RGBA")
    return Image.alpha_composite(base, overlay)


def add_header(draw: ImageDraw.ImageDraw, page: str, kicker: str = "MD2X") -> None:
    draw_round(draw, (72, 64, 206, 116), 26, "#111111")
    draw.text((100, 77), kicker, font=font(26, True), fill="#ffffff")
    draw.text((884, 78), page, font=font(26, True), fill="#777777")


def add_bottom_note(draw: ImageDraw.ImageDraw, text: str) -> None:
    draw_round(draw, (72, 1304, 1008, 1372), 34, "#111111")
    draw.text((112, 1320), text, font=font(28, True), fill="#ffffff")


def add_title(draw: ImageDraw.ImageDraw, title: str, y: int, size: int = 78) -> int:
    return draw_text_block(draw, (72, y), title, font(size, True), "#111111", 936, 18)


def add_subtitle(draw: ImageDraw.ImageDraw, text: str, y: int) -> int:
    return draw_text_block(draw, (76, y), text, font(38), "#4b4b4b", 900, 12)


def add_bullets(draw: ImageDraw.ImageDraw, items: list[str], x: int, y: int, width: int) -> int:
    for item in items:
        draw_round(draw, (x, y, x + width, y + 86), 28, "#ffffff", "#eeeeee", 2)
        draw.ellipse((x + 30, y + 30, x + 50, y + 50), fill="#ff2442")
        draw.text((x + 74, y + 24), item, font=font(31, True), fill="#111111")
        y += 104
    return y


slides = [
    {
        "bg": "01-cover.png",
        "out": "01-cover-x-articles-tool.png",
        "page": "1/6",
        "kind": "cover",
    },
    {
        "bg": "02-pain.png",
        "out": "02-pain-points.png",
        "page": "2/6",
        "kind": "pain",
    },
    {
        "bg": "03-tool.png",
        "out": "03-what-md2x-does.png",
        "page": "3/6",
        "kind": "tool",
    },
    {
        "bg": "04-workflow.png",
        "out": "04-workflow.png",
        "page": "4/6",
        "kind": "workflow",
    },
    {
        "bg": "05-features.png",
        "out": "05-features.png",
        "page": "5/6",
        "kind": "features",
    },
    {
        "bg": "06-audience.png",
        "out": "06-audience.png",
        "page": "6/6",
        "kind": "audience",
    },
]


def compose(slide: dict[str, str]) -> None:
    bg = cover_resize(BG_DIR / slide["bg"])
    canvas = add_scrim(bg, 196)
    canvas = canvas.filter(ImageFilter.UnsharpMask(radius=1.2, percent=110, threshold=3))
    draw = ImageDraw.Draw(canvas)
    add_header(draw, slide["page"])

    kind = slide["kind"]
    if kind == "cover":
        y = add_title(draw, "我做了个\nX Articles\n长文发布工具", 204, 88)
        y = add_subtitle(draw, "写完 Markdown，就能直接粘贴发布", y + 28)
        draw_round(draw, (72, 760, 1008, 910), 38, "#ffffff", "#eeeeee", 2)
        draw.text((116, 792), "给海外内容创作者的发布前工作台", font=font(40, True), fill="#111111")
        draw.text((116, 850), "草稿  预览  复制  发布", font=font(34), fill="#ff2442")
        add_bottom_note(draw, "不是复杂写作平台，是把长文顺手发出去")

    elif kind == "pain":
        y = add_title(draw, "发 X 长文，\n真正麻烦的\n不是写", 190, 82)
        y = add_subtitle(draw, "而是发布前这些碎活", y + 16)
        add_bullets(
            draw,
            ["重新排版很打断状态", "加粗、链接、列表容易丢", "图片和素材分散难管理", "发布前还要反复检查"],
            72,
            y + 44,
            936,
        )
        add_bottom_note(draw, "MD2X 解决的是：写完之后，怎么优雅发布")

    elif kind == "tool":
        y = add_title(draw, "MD2X 做的事\n很简单", 188, 84)
        y = add_subtitle(draw, "左边写草稿，右边看成稿", y + 18)
        cards = [("01", "Markdown 草稿"), ("02", "X Articles 预览"), ("03", "一键复制正文"), ("04", "素材集中插入")]
        cy = y + 50
        for idx, label in cards:
            draw_round(draw, (96, cy, 984, cy + 96), 30, "#ffffff", "#efefef", 2)
            draw_round(draw, (128, cy + 23, 190, cy + 73), 22, "#ff2442")
            draw.text((146, cy + 34), idx, font=font(20, True), fill="#ffffff")
            draw.text((220, cy + 25), label, font=font(34, True), fill="#111111")
            cy += 118
        add_bottom_note(draw, "定位：专门服务 X Articles 的发布前工作台")

    elif kind == "workflow":
        y = add_title(draw, "4 步完成一篇\nX Articles", 188, 82)
        steps = [
            ("1", "写 Markdown 草稿"),
            ("2", "预览文章效果"),
            ("3", "复制标题和正文"),
            ("4", "粘贴到 X Articles 发布"),
        ]
        cy = y + 54
        for num, label in steps:
            draw_round(draw, (96, cy, 984, cy + 110), 34, "#ffffff", "#eeeeee", 2)
            draw.ellipse((128, cy + 24, 190, cy + 86), fill="#111111")
            draw.text((151, cy + 39), num, font=font(26, True), fill="#ffffff")
            draw.text((224, cy + 34), label, font=font(36, True), fill="#111111")
            cy += 132
        add_bottom_note(draw, "核心价值：少折腾格式，多花时间创作")

    elif kind == "features":
        y = add_title(draw, "普通创作者\n会用到的功能", 188, 80)
        items = ["富文本复制", "封面图生成", "素材集中管理", "中英润色翻译", "长文拆 Thread", "本地自动保存"]
        x1, x2 = 72, 552
        cy = y + 52
        for i, item in enumerate(items):
            x = x1 if i % 2 == 0 else x2
            if i % 2 == 0 and i > 0:
                cy += 132
            draw_round(draw, (x, cy, x + 456, cy + 108), 32, "#ffffff", "#eeeeee", 2)
            draw.text((x + 34, cy + 32), item, font=font(31, True), fill="#111111")
        add_bottom_note(draw, "对外讲：它不是编辑器，是发布助手")

    elif kind == "audience":
        y = add_title(draw, "适合这些人", 206, 90)
        y = add_subtitle(draw, "尤其是想做海外内容的人", y + 20)
        add_bullets(
            draw,
            ["在 X 上发长文的人", "海外内容运营 / 创作者", "博客或 Newsletter 同步到 X", "中文内容整理成英文长文", "不想每次发布手动排版"],
            72,
            y + 46,
            936,
        )
        add_bottom_note(draw, "项目名：MD2X  Markdown -> X Articles")

    out = canvas.convert("RGB")
    out.save(OUT_DIR / slide["out"], quality=96)


for slide in slides:
    compose(slide)

print(f"Wrote {len(slides)} images to {OUT_DIR}")
