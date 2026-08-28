#!/usr/bin/env bash
# sync.sh — ดึงกิจกรรมจากต้นทางเข้ามาใน ecmis-transform แล้วเติม script tag ร่วมกลับให้อัตโนมัติ
#
# ปัญหาที่แก้: ไฟล์ในนี้ถูก "แก้เพิ่ม" 3-4 บรรทัด (cases.js / case-bar.js / pipe-buttons.js / auth.js)
# ทำให้ copy ทับจากต้นทางตรง ๆ ไม่ได้ ต้องเติม tag มือใหม่ทุกครั้ง → เลยตกรุ่นซ้ำ ๆ
# สคริปต์นี้ทำให้ re-sync เป็น idempotent: rsync แล้ว inject ให้เอง รันซ้ำได้ไม่พัง
#
# ใช้:   ./sync.sh              ตรวจว่ากิจกรรมไหนตกรุ่น (dry-run ไม่แก้ไฟล์)
#        ./sync.sh --apply      ดึงของใหม่เข้ามาจริง + inject tag
#        ./sync.sh --apply ก9   ทำทีละกิจกรรม
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APPLY=0; ONLY=""
for a in "$@"; do
  case "$a" in
    --apply) APPLY=1 ;;
    --help|-h) sed -n '2,16p' "$0"; exit 0 ;;
    *) ONLY="$a" ;;
  esac
done

WS="$HOME/Downloads/ecmis-workspace"
A4="$HOME/Downloads/E-CMIS-A4-Production/E-CMIS-A4"

# ── ทะเบียนต้นทาง: key|ชื่อ|โฟลเดอร์ปลายทาง|โฟลเดอร์ต้นทาง|โหมด auth
#    โหมด auth: staff = ใส่ auth.js ด้วย · public = ไม่ใส่ auth.js
REGISTRY=(
  "ก4+5|รับเรื่อง+ไต่สวน|intake-investigation|$A4|staff"
  "ก6|คุ้มครองพยาน|witness-protection|$WS/E-CMISWitness-Protection|staff"
  "ก9|หมายจับ|arrest-warrant|$WS/Mockup-activity9-arrest-warrant|staff"
  "ก13|เชื่อมโยงข้อมูล|integration-gateway|$WS/E-CMIS-muck-api|staff"
)
# ก7 (board-resolution) / ก10 (legal-case) มาจาก git branch Mock-up-7 / Mock-up-10 ของ $A4
# ก8 / ก12 / ก14 แปลงมือจาก Blazor/Razor — ไม่มี 1:1 source ให้ rsync ทั้งสามตัวจึงไม่อยู่ในทะเบียนนี้

# ── หน้าที่ห้ามทับ (ในนี้เขียนใหม่/ต่างจากต้นทางโดยเจตนา) — รูปแบบ "โฟลเดอร์/ไฟล์"
#    ใช้ array ธรรมดา เพราะ bash 3.2 ที่มากับ macOS ไม่รองรับ declare -A
KEEP_LOCAL=(
  # (ว่าง) — เคยกัน intake-investigation/index.html ไว้เพราะเขียน launcher ทับ
  # แต่ไฟล์นั้นคือ "หน้า landing ของกิจกรรมที่ 4" ตัวจริง ต้อง sync ตามต้นทางเสมอ
)

# ── script tag ร่วม — แยก 2 จุด และลำดับสำคัญมาก
#
# HEAD (ต้นไฟล์ ก่อน script ของกิจกรรมเอง):
#   auth.js   — ต้องรันก่อน board-resolution/assets/ecmis-app.js เพราะ ก7 เช็ก
#               sessionStorage.ecmis_authed แล้ว redirect ไป login.html ของตัวเองทันที
#               ถ้า auth.js มาช้า SSO shim ไม่ทัน → ล็อกอิน hub แล้วยังเจอ login ที่สอง
#   cases.js  — ตั้ง ECMISHub + ทะเบียนกลางให้พร้อมก่อนใครใช้
#
# BODY-END (ท้ายไฟล์ เพราะต้องมี DOM):
#   handoff → case-bar → pipe-buttons → case-inbox
#   handoff ต้องมาก่อน pipe-buttons/case-inbox ไม่งั้น window.ECMISHandoff undefined
#   แล้วสองตัวนั้น return ทิ้งเงียบ ๆ (console.warn ไม่ใช่ error จึงไม่มีใครเห็น)
tags_head(){ # $1 = staff|public
  [ "$1" = staff ] && printf '%s\n' '<script src="../shared-assets/auth.js"></script>'
  printf '%s\n' '<script src="../cases.js"></script>'
}
tags_body(){
  printf '%s\n' '<script src="../shared-assets/handoff.js"></script>' \
                '<script src="../shared-assets/case-bar.js"></script>' \
                '<script src="../shared-assets/pipe-buttons.js"></script>' \
                '<script src="../shared-assets/case-inbox.js"></script>'
}

# ── ทุกกิจกรรมในโปรเจกต์ (รวมที่แปลงมือ ไม่มีต้นทางให้ rsync)
ALL_ACTS=(intake-investigation witness-protection board-resolution person-screening
          arrest-warrant legal-case data-migration analytics integration-gateway admin-center)

# inject — ต้องรับประกัน "ลำดับ" ไม่ใช่แค่ "มีอยู่"
# บทเรียน 2026-08-17: เดิมเติมเฉพาะ tag ที่ขาด ต่อท้ายก่อน </body>
# หน้าที่มี case-bar/pipe-buttons อยู่กลางไฟล์แล้ว (ก7/ก8/ก10) จึงได้ handoff.js
# ไปต่อ "ท้ายสุด" = โหลดหลัง pipe-buttons → window.ECMISHandoff ยัง undefined
# → pipe-buttons return ทิ้งเงียบ ๆ แถบท่อไม่ขึ้นเลยทั้ง 3 กิจกรรม (console.warn ไม่ใช่ error จึงไม่มีใครเห็น)
# ตอนนี้: ถอด tag ร่วมทั้งหมดออกก่อน แล้วใส่กลับเป็นบล็อกเดียวเรียงลำดับที่ถูก
inject(){ # $1 = ไฟล์ html, $2 = staff|public
  local f="$1" mode="$2" head body
  head=$(tags_head "$mode")
  body=$(tags_body)

  # ถูกแล้วเมื่อ: head block ครบและอยู่ "ก่อน" script ของกิจกรรมเอง, body block ครบและอยู่หลัง head
  if python3 - "$f" "$head" "$body" <<'PY'
import sys,io,re
p,head,body=sys.argv[1],sys.argv[2],sys.argv[3]
s=io.open(p,encoding='utf-8').read()
h,b=s.find(head.strip()),s.find(body.strip())
if h==-1 or b==-1 or h>=b: sys.exit(1)
# script ของกิจกรรมเอง = local src ที่ไม่ใช่ tag ร่วมของเรา
shared=('auth.js','cases.js','handoff.js','case-bar.js','pipe-buttons.js','case-inbox.js')
for m in re.finditer(r'<script[^>]*\ssrc="([^"]+)"', s, re.I):
    u=m.group(1)
    if re.match(r'https?:|//', u): continue
    if any(u.endswith(x) or ('/'+x) in u for x in shared): continue
    if m.start() < h: sys.exit(1)      # ของกิจกรรมมาก่อน head → ต้องจัดใหม่
    break
sys.exit(0)
PY
  then return 1; fi

  if [ "$APPLY" = 1 ]; then
    python3 - "$f" "$head" "$body" <<'PY'
import sys,io,re
p,head,body=sys.argv[1],sys.argv[2],sys.argv[3]
s=io.open(p,encoding='utf-8').read()

# 1) ถอด tag ร่วมทุกตัวออกก่อน ไม่ว่าอยู่ที่ไหน (รองรับ path/แอตทริบิวต์หลายรูปแบบ)
names=['auth.js','cases.js','handoff.js','case-bar.js','pipe-buttons.js','case-inbox.js']
pat=re.compile(r'[ \t]*<script[^>]*src="[^"]*(?:'+'|'.join(re.escape(n) for n in names)+r')(?:\?[^"]*)?"[^>]*>\s*</script>[ \t]*\n?', re.I)
s=pat.sub('', s)

# 2) HEAD block — วางก่อน <script> ตัวแรกที่เป็นไฟล์ในเครื่อง (ไม่ใช่ CDN)
#    เพื่อให้มาก่อน assets/ecmis-app.js ของ ก7/ก10 เสมอ
#    ถ้าไม่มี local script เลย ให้วางก่อน </head>
ins=None
for m in re.finditer(r'<script[^>]*\ssrc="([^"]+)"', s, re.I):
    if not re.match(r'https?:|//', m.group(1)):
        ins=m.start(); break
if ins is None:
    m=re.search(r'</head>', s, re.I)
    ins=m.start() if m else 0
# รักษาการเยื้องบรรทัดเดิมไว้
line_start=s.rfind('\n', 0, ins)+1
indent=s[line_start:ins]
s=s[:line_start]+head+'\n'+s[line_start:]

# 3) BODY block — ก่อน </body> ตัวสุดท้าย
i=s.lower().rfind('</body>')
if i==-1: s=s+'\n'+body+'\n'
else:     s=s[:i]+body+'\n'+s[i:]

io.open(p,'w',encoding='utf-8').write(s)
PY
  fi
  printf 'ordered'
  return 0
}

echo "── ecmis-transform sync  ($([ "$APPLY" = 1 ] && echo APPLY || echo 'dry-run — ใส่ --apply เพื่อแก้จริง'))"
for row in "${REGISTRY[@]}"; do
  IFS='|' read -r key name dest src mode <<<"$row"
  [ -n "$ONLY" ] && [ "$ONLY" != "$key" ] && continue
  echo
  echo "▸ $key $name  →  $dest/"
  if [ ! -d "$src" ]; then echo "   ✗ ไม่พบต้นทาง: $src"; continue; fi

  # 1) rsync ไฟล์เนื้อหา — ไม่แตะ assets (ใช้ symlink → shared-assets), ไม่แตะ .git/assets.bak
  # ไม่แตะ assets (เป็น symlink → shared-assets), ไม่ลาก dev cruft และสื่อหนักเข้ามา
  ex=(--exclude 'assets' --exclude 'assets.bak' --exclude 'node_modules'
      --exclude '.git' --exclude '.git*' --exclude '.DS_Store' --exclude '.claude' --exclude '.superpowers'
      --exclude '.htmlvalidate.json' --exclude 'docs' --exclude 'README.md'
      --exclude 'graphify-out' --exclude 'tests' --exclude 'scripts' --exclude '*.rar'
      --exclude 'output/video' --exclude 'output/pdf' --exclude 'output/manual'
      --exclude 'db' --exclude 'tmp' --exclude 'tools' --exclude 'Prompt_*.md')
  # หมายเหตุ: tests/ + scripts/ + graphify-out/ ของต้นทางเป็นเครื่องมือ dev ไม่ใช่หน้าที่ mock เสิร์ฟ
  # สื่อหนัก (output/pdf 7.1M, output/video 11M ของ ก9) อยู่ที่ต้นทาง ไม่ดึงเข้าโฟลเดอร์พรีเซนต์
  if [ "${#KEEP_LOCAL[@]}" -gt 0 ]; then
    for k in "${KEEP_LOCAL[@]}"; do
      [ "${k%%/*}" = "$dest" ] && ex+=(--exclude "${k#*/}")
    done
  fi
  n=$(rsync -rlt --itemize-changes "${ex[@]}" "$src/" "$ROOT/$dest/" $([ "$APPLY" = 1 ] || echo --dry-run) 2>/dev/null | grep -cE '^[<>ch]') || n=0
  echo "   ไฟล์ที่ต่างจากต้นทาง: $n"

  # 2) inject script tag ร่วมกลับทุก .html
  inj=0
  while IFS= read -r f; do
    rel="${f#$ROOT/}"
    m="$mode"
    case "$(basename "$f")" in complaint-form.html|tracking.html|additional-documents.html|member-register.html|member-dashboard.html) m=public ;; esac
    case "$(basename "$f")" in login.html|LoginAdmin.html) continue ;; esac
    if c=$(inject "$f" "$m"); then echo "   ↻ จัดลำดับ tag ร่วม → $rel"; inj=$((inj+1)); fi
  done < <(find "$ROOT/$dest" -name '*.html' -not -path '*/assets*' -not -path '*/tests/*' 2>/dev/null | sort)
  [ "$inj" = 0 ] && echo "   script tag ร่วม: ครบแล้ว"
  # หมายเหตุ: rsync ทับไฟล์จากต้นทางก่อน แล้ว inject เติม tag กลับ → ทุกรอบจะเห็น "re-inject"
  # เป็นเรื่องปกติ ผลลัพธ์เหมือนเดิมทุกครั้ง (idempotent) แต่หมายความว่า
  # ห้ามแก้ไฟล์ที่ sync มือเปล่า ๆ เพราะรอบถัดไปจะถูกทับ — แก้ที่ต้นทาง หรือใส่ใน KEEP_LOCAL
done

# ── wire: DISABLED — ท่อข้าม ก. เอาออกตามคำสั่ง ไม่ wire อัตโนมัติแล้ว (ปิดโดย user 2026-08-18)
if false; then # DISABLED ไม่ว่าจะมีต้นทางให้ rsync หรือไม่
#    (ก7/ก8/ก10/ก12/ก14 ไม่อยู่ในทะเบียน rsync แต่ต้องต่อท่อเหมือนกัน)
echo
echo "▸ wire script tag ร่วมทุกกิจกรรม"
wired=0
for dest in "${ALL_ACTS[@]}"; do
  [ -d "$ROOT/$dest" ] || continue
  while IFS= read -r f; do
    base="$(basename "$f")"
    case "$base" in login.html|LoginAdmin.html) continue ;; esac
    m=staff
    case "$base" in complaint-form.html|tracking.html|additional-documents.html|member-register.html|member-dashboard.html) m=public ;; esac
    if c=$(inject "$f" "$m"); then echo "   + จัดลำดับ tag → ${f#$ROOT/}"; wired=$((wired+1)); fi
  done < <(find "$ROOT/$dest" -name '*.html' -not -path '*/assets*' -not -path '*/tests/*' 2>/dev/null | sort)
done
[ "$wired" = 0 ] && echo "   ครบทุกไฟล์แล้ว"
fi # DISABLED wire

# ── เติม asset ที่ต้นทางเพิ่มใหม่เข้า shared-assets (ทุกกิจกรรม symlink assets → shared-assets
#    เลยต้อง top-up ที่นี่ ไม่ใช่ในโฟลเดอร์กิจกรรม) — เช่น ก9 ตัวใหม่ต้องใช้ forms/official/mj1, mj2
echo
echo "▸ shared-assets top-up"
for row in "${REGISTRY[@]}"; do
  IFS='|' read -r key name dest src mode <<<"$row"
  [ -n "$ONLY" ] && [ "$ONLY" != "$key" ] && continue
  [ -d "$src/assets/forms/official" ] || continue
  for d in "$src/assets/forms/official"/*/; do
    [ -d "$d" ] || continue
    b="$(basename "$d")"
    if [ ! -d "$ROOT/shared-assets/forms/official/$b" ]; then
      echo "   + forms/official/$b/ ($(ls "$d" | wc -l | tr -d ' ') ไฟล์) จาก $key"
      [ "$APPLY" = 1 ] && rsync -rlt "$d" "$ROOT/shared-assets/forms/official/$b/"
    fi
  done
done

echo
if [ "$APPLY" = 1 ]; then echo "เสร็จ — เปิด index.html ตรวจอีกครั้ง"; else echo "dry-run เท่านั้น · รัน ./sync.sh --apply เพื่อทำจริง"; fi
