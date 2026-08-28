with open("e-cmis-a7-demo/res/order.html", "r", encoding="utf-8") as f:
    for i, line in enumerate(f):
        if "paginateDoc" in line or "function renderDoc" in line:
            print(f"Line {i+1}: {line.strip()[:100]}")