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
        
        # 2. If path + ".html" exists (e.g. /login -> /login.html, /case-register -> /case-register.html)
        html_candidate = target_path + ".html"
        if os.path.exists(html_candidate):
            return html_candidate

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
