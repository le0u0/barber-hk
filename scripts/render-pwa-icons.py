#!/usr/bin/env python3
"""Draw the Barber HK home-screen icons. Flat ink and cream, no photos."""

import struct
import zlib
from pathlib import Path

INK = (0x1C, 0x19, 0x15)
CREAM = (0xF4, 0xEF, 0xE6)
CIRCLE_R = 0.36
TOOTH_HALF = 0.014
TEETH = (-0.128, -0.064, 0.0, 0.064, 0.128)


def color_at(nx: float, ny: float) -> tuple[int, int, int]:
    dx = nx - 0.5
    dy = ny - 0.5
    if dx * dx + dy * dy > CIRCLE_R * CIRCLE_R:
        return INK
    if -0.16 <= dx <= 0.16 and -0.20 <= dy <= -0.11:
        return INK
    if -0.11 <= dy <= 0.18:
        for tooth in TEETH:
            if tooth - TOOTH_HALF <= dx <= tooth + TOOTH_HALF:
                return INK
    return CREAM


def render(size: int) -> bytes:
    samples = (0.25, 0.75)
    raw = bytearray()
    for y in range(size):
        raw.append(0)
        for x in range(size):
            acc = [0, 0, 0]
            for sy in samples:
                for sx in samples:
                    red, green, blue = color_at((x + sx) / size, (y + sy) / size)
                    acc[0] += red
                    acc[1] += green
                    acc[2] += blue
            raw.extend(channel // 4 for channel in acc)
    return png(size, size, bytes(raw))


def chunk(tag: bytes, data: bytes) -> bytes:
    return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)


def png(width: int, height: int, raw: bytes) -> bytes:
    ihdr = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)
    return b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) + chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b"")


def main() -> None:
    public = Path(__file__).resolve().parents[1] / "public"
    outputs = {
        "icon-192x192.png": 192,
        "icon-512x512.png": 512,
        "apple-touch-icon.png": 180,
    }
    for name, size in outputs.items():
        path = public / name
        path.write_bytes(render(size))
        print(f"{path} {size}x{size}")


if __name__ == "__main__":
    main()
