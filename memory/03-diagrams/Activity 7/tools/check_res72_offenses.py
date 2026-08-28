with open("e-cmis-a7-demo/res/resolution-72.html", "r", encoding="utf-8") as f:
    for i, line in enumerate(f):
        if "ฐานความผิด" in line or "offense" in line.lower() or "criminal" in line.lower():
            print(f"Line {i+1}: {line.strip()[:120]}")