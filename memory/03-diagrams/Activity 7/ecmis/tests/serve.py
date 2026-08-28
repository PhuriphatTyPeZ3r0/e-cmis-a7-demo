# threaded static server — python -m http.server รับ Chromium หลายสิบ context พร้อมกันไม่ไหว
# ทำให้เทสต์เจอ net::ERR_SOCKET_NOT_CONNECTED เป็นครั้งคราว
import http.server, socketserver, os, sys
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))  # โฟลเดอร์ราก ecmis-transform
class H(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
class S(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True
    request_queue_size = 128
S(("127.0.0.1", 8899), H).serve_forever()
