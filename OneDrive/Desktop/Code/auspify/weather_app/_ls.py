import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

folder = Path(r"C:\Users\nurha/OneDrive/Desktop/Code/auspify/weather_app")
for entry in sorted(folder.iterdir()):
    if entry.is_file():
        info = entry.stat()
        print(f"{entry.name:<20} {info.st_size:>8} bytes")
    else:
        print(f"[dir ]  {entry.name}")
