import re

with open("styles.css", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines, 1):
    if any(keyword in line for keyword in ["@media print", "min-height", "A4", "sheet", "28.5cm", "29.7cm", "page-break"]):
        print(f"{i}: {line.strip()}")
