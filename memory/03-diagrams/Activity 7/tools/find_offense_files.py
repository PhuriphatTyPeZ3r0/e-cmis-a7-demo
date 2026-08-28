import os

res_dir = "e-cmis-a7-demo/res"
for fname in os.listdir(res_dir):
    if fname.endswith(".html"):
        fpath = os.path.join(res_dir, fname)
        with open(fpath, "r", encoding="utf-8") as f:
            content = f.read()
            if "tbl_res_offense_basis" in content or "OFFENSE_BASIS" in content or "ฐานความผิด" in content:
                print(f"Match in: {fname}")