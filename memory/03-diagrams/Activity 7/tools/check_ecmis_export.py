with open("e-cmis-a7-demo/assets/ecmis-app.js", "r", encoding="utf-8") as f:
    lines = f.readlines()
for i in range(len(lines)-25, len(lines)):
    print(f"Line {i+1}: {lines[i].strip()[:100]}")