import os

for root, dirs, files in os.walk("."):
    if ".git" in root or "node_modules" in root:
        continue
    for f in files:
        fpath = os.path.join(root, f)
        try:
            with open(fpath, "r", encoding="utf-8") as file:
                content = file.read()
                if "tbl_res_offense_basis" in content or "offense_basis" in content:
                    print(f"Found in: {fpath}")
        except Exception:
            pass