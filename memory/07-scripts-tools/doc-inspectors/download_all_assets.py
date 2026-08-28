import requests, os

js_files = [
    'assets/activity5-handoff.js',
    'assets/activity4-document-rules.js',
    'assets/activity4-outgoing-registers.js',
    'assets/activity5-rules.js',
    'assets/activity5-assignment-recommendation.js',
    'assets/activity5-document-domain.js',
    'assets/activity5-plan-worklog.js',
    'assets/activity5-report-213.js',
    'assets/activity5-report-644.js',
    'assets/activity5-post-resolution-documents.js',
    'assets/activity5-extension-rules.js',
    'assets/activity5-extension-authority.js',
    'assets/activity5-extension-workflow.js',
    'assets/activity5-extension-documents.js',
    'assets/activity5-extension-submit.js',
    'assets/activity5-extension-progress.js',
    'assets/activity5-extension-late-report.js',
    'assets/activity5-extension-review.js',
    'assets/activity5-extension-workspace.js',
    'assets/activity5-phase0-guard.js',
    'assets/qrcode-generator.js'
]

for jf in js_files:
    fname = jf.split('/')[-1]
    if not os.path.exists(fname):
        r = requests.get(f'https://e-cmis-a4.vercel.app/{jf}')
        with open(fname, 'w', encoding='utf-8') as out:
            out.write(r.text)
        print(f'{fname}: {len(r.text)} bytes')
