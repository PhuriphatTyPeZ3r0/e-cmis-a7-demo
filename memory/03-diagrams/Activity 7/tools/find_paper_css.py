with open("e-cmis-a7-demo/assets/a4-ecmis-workspace.css", "r", encoding="utf-8") as f:
    for i, line in enumerate(f):
        if ".doc-paper" in line or ".a4-paper" in line or "PAGE_BUDGET" in line or "font-size" in line and "margin" in line:
            print(f"Line {i+1}: {line.strip()[:140]}")