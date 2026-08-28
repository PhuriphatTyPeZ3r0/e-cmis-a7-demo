with open("e-cmis-a7-demo/assets/ecmis-app.js", "r", encoding="utf-8") as f:
    for i, line in enumerate(f):
        if "paginateDoc" in line or "exportDocToDocx" in line or "printDoc" in line:
            print(f"Line {i+1}: {line.strip()[:120]}")