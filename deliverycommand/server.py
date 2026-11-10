"""Zero-dependency static file server for local preview or Render deployment."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import os

if __name__ == '__main__':
    os.chdir(Path(__file__).resolve().parent)
    port = int(os.environ.get('PORT', '10000'))
    print(f'DeliveryCommand available at http://localhost:{port}')
    ThreadingHTTPServer(('0.0.0.0', port), SimpleHTTPRequestHandler).serve_forever()
