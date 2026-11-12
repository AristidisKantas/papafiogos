"""Build the single self-hosted font file (Inter, Latin + Greek, wght 300-500).

Run once (output is committed):  python scripts/build-font.py
Needs: pip install fonttools brotli
"""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools import subset

root = Path(__file__).resolve().parent
src = root / "vendor" / "InterVariable.woff2"
out = root.parent / "src" / "assets" / "fonts" / "inter-latin-greek.woff2"

font = TTFont(src)
# Keep only the weight range the site uses; pin optical size to text default.
axes = {a.axisTag for a in font["fvar"].axes}
limits = {"wght": (300, 500)}
if "opsz" in axes:
    limits["opsz"] = 14

unicodes = (
    list(range(0x20, 0x7F))        # Basic Latin
    + list(range(0xA0, 0x100))     # Latin-1 supplement
    + list(range(0x370, 0x400))    # Greek & Coptic (incl. tonos/dialytika)
    + [0x2013, 0x2014, 0x2018, 0x2019, 0x201C, 0x201D, 0x2026, 0x00AB, 0x00BB,
       0x2022, 0x00B7, 0x2122, 0x20AC, 0x2192, 0x2190, 0x00D7, 0x2009, 0x202F]
)
opts = subset.Options()
opts.flavor = "woff2"
opts.layout_features = ["kern", "liga", "calt", "case", "ccmp", "locl", "mark", "mkmk", "tnum"]
opts.name_IDs = [0, 1, 2, 3, 4, 5, 6]
opts.notdef_outline = True
sub = subset.Subsetter(opts)
sub.populate(unicodes=unicodes)
sub.subset(font)
font = instancer.instantiateVariableFont(font, limits)
out.parent.mkdir(parents=True, exist_ok=True)
font.flavor = "woff2"
font.save(out)
print(f"wrote {out} ({out.stat().st_size/1024:.1f} KB)")
