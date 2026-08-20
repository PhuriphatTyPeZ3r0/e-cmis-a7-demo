import http.server
import socketserver
import os
import posixpath
import urllib.parse

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class SmartHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def translate_path(self, path):
        parsed_url = urllib.parse.urlsplit(path)
        path = parsed_url.path
        path = posixpath.normpath(urllib.parse.unquote(path))
        words = path.split('/')
        words = filter(None, words)
        
        target_path = DIRECTORY
        for word in words:
            if os.path.dirname(word) or word in (os.curdir, os.pardir):
                continue
            target_path = os.path.join(target_path, word)
        
        # 1. If path exists directly
        if os.path.exists(target_path):
            if os.path.isdir(target_path):
                index_path = os.path.join(target_path, "index.html")
                if os.path.exists(index_path):
                    return index_path
            return target_path
        
        # 2. If path + ".html" exists (e.g. /login -> /login.html, /res/followup-dashboard -> /res/followup-dashboard.html)
        html_candidate = target_path + ".html"
        if os.path.exists(html_candidate):
            return html_candidate
            
        # 3. Clean Name mappings
        clean_map = {
            "res/inbox": "res/inbox.html",
            "res/dashboard": "res/dashboard.html",
            "res/followup-dashboard": "res/followup-dashboard.html",
            "res/case-register": "res/case-register.html",
            "res/report-213": "res/report-213.html",
            "res/approval-review": "res/approval-review.html",
            "res/urgent-agenda": "res/urgent-agenda.html",
            "res/chairman-agenda": "res/chairman-agenda.html",
            "res/order-m24": "res/order-m24.html",
            "res/subcommittee-screening": "res/subcommittee-screening.html",
            "res/support-subcommittee": "res/support-subcommittee.html",
            "res/resolution-inbox": "res/resolution-inbox.html",
            "res/board-resolution": "res/board-resolution.html",
            "res/board-resolution-72": "res/board-resolution-72.html",
            "res/agenda-set": "res/agenda-set.html",
            "res/meeting-report": "res/meeting-report.html",
            "res/agenda-registry": "res/agenda-registry.html",
            "res/agenda-registry-detail": "res/agenda-registry-detail.html",
            "res/agenda-meeting-docs": "res/agenda-meeting-docs.html",
            "res/ruling-report": "res/ruling-report.html",
            "16-followup-dashboard": "16-followup-dashboard.html",
            "followup-dashboard": "followup-dashboard.html",
            "dashboard": "dashboard.html",
            "login": "login.html",
            "index": "index.html"
        }
        
        rel = os.path.relpath(target_path, DIRECTORY).replace('\\', '/')
        if rel in clean_map:
            mapped = os.path.join(DIRECTORY, clean_map[rel])
            if os.path.exists(mapped):
                return mapped
                
        return target_path

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

if __name__ == '__main__':
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), SmartHTTPRequestHandler) as httpd:
        print(f"Serving E-CMIS Activity 7 at http://localhost:{PORT}/ with Clean URLs enabled")
        httpd.serve_forever()
