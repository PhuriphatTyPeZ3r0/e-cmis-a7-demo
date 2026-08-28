import os

res_dir = "e-cmis-a7-demo/res"
for fname in os.listdir(res_dir):
    if fname.endswith(".html"):
        fpath = os.path.join(res_dir, fname)
        with open(fpath, "r", encoding="utf-8") as f:
            content = f.read()
            matches = []
            if "paginateDoc" in content:
                matches.append("paginateDoc")
            if "paginateResolutionDoc" in content:
                matches.append("paginateResolutionDoc")
            if "docPaper" in content:
                matches.append("docPaper")
            if matches:
                print(f"{fname}: {', '.join(matches)}")