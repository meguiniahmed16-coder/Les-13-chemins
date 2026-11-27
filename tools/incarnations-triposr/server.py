"""Local private TripoSR worker. The original atelier and V27 remain unchanged.
Run in the official TripoSR virtual environment: python server.py --engine /path/to/TripoSR.
Never put this behind a public unauthenticated endpoint.
"""
import argparse
import hmac
import io
import json
import os
import secrets
from http.cookies import SimpleCookie
from pathlib import Path
import subprocess
import sys
import tempfile
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from PIL import Image, ImageOps
from normalise_mesh import normalise_mesh

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--engine", required=True, type=Path)
    parser.add_argument("--port", default=8765, type=int)
    parser.add_argument("--device", default="cpu")
    parser.add_argument("--model", default="stabilityai/TripoSR")
    parser.add_argument("--resolution", default=192, type=int, choices=(128, 192, 256))
    parser.add_argument('--atelier', type=Path, required=True, help='Original Atelier HTML with external mesh integration')
    args = parser.parse_args()
    engine = args.engine.resolve()
    if not (engine / "run.py").is_file():
        raise SystemExit("TripoSR officiel absent : run.py introuvable")
    token = os.environ.get("ATELIER_TRIPOSR_TOKEN") or secrets.token_urlsafe(32)
    if not token or len(token) < 24:
        raise SystemExit("ATELIER_TRIPOSR_TOKEN doit contenir au moins 24 caractères")
    atelier = args.atelier.resolve()
    if not atelier.is_file():
        raise SystemExit('Atelier HTML introuvable')
    origin = f'http://127.0.0.1:{args.port}'
    limit = 12 * 1024 * 1024
    lock = threading.Lock()
    Image.MAX_IMAGE_PIXELS = 25_000_000

    class Handler(BaseHTTPRequestHandler):
        def log_message(self, *_):
            pass
        def reply(self, status, data, content_type="application/json", session=False):
            if isinstance(data, dict):
                data = json.dumps(data, ensure_ascii=False).encode()
            self.send_response(status)
            self.send_header("Content-Type", content_type)
            self.send_header("Content-Length", str(len(data)))
            self.send_header("Cache-Control", "no-store")
            self.send_header("X-Content-Type-Options", "nosniff")
            self.send_header("X-Frame-Options", "DENY")
            self.send_header("Referrer-Policy", "no-referrer")
            if session:
                self.send_header("Set-Cookie", f"atelier_session={token}; Path=/; HttpOnly; SameSite=Strict")
            self.end_headers()
            self.wfile.write(data)
        def authorised(self):
            cookies = SimpleCookie()
            try:
                cookies.load(self.headers.get("Cookie", ""))
                session = cookies["atelier_session"].value if "atelier_session" in cookies else ""
            except Exception:
                session = ""
            return hmac.compare_digest(session, token) or hmac.compare_digest(self.headers.get("Authorization", ""), "Bearer " + token)
        def do_GET(self):
            if self.headers.get('Host') != f'127.0.0.1:{args.port}':
                return self.reply(403, {'error': 'Origine refusée'})
            if self.path == '/':
                return self.reply(200, atelier.read_bytes(), 'text/html; charset=utf-8', session=True)
            if not self.authorised():
                return self.reply(401, {'error': 'Accès refusé'})
            if self.path == '/health':
                return self.reply(200, {"engine": "TripoSR", "device": args.device, "ready": True,
                    "note": "Processus disponible; première inférence non garantie"})
            return self.reply(404, {"error": "Route inconnue"})
        def do_POST(self):
            if self.headers.get('Host') != f'127.0.0.1:{args.port}' or self.headers.get('Origin') != origin:
                return self.reply(403, {'error': 'Origine refusée'})
            if not self.authorised():
                return self.reply(401, {"error": "Accès refusé"})
            if self.path != "/reconstruct":
                return self.reply(404, {"error": "Route inconnue"})
            try:
                n = int(self.headers.get("Content-Length", "0"))
            except ValueError:
                return self.reply(400, {"error": "Longueur invalide"})
            if n <= 0 or n > limit:
                return self.reply(413, {"error": "Image vide ou trop grande"})
            if not lock.acquire(blocking=False):
                return self.reply(429, {"error": "Moteur occupé"})
            try:
                raw = self.rfile.read(n)
                with tempfile.TemporaryDirectory(prefix="atelier-triposr-") as tmp:
                    root = Path(tmp)
                    source = root / "source.png"
                    try:
                        with Image.open(io.BytesIO(raw)) as im:
                            if im.format not in ("JPEG", "PNG", "WEBP"):
                                raise ValueError("Format non autorisé")
                            im = ImageOps.exif_transpose(im).convert("RGB")
                            im.thumbnail((1600, 1600))
                            im.save(source)
                    except Exception:
                        return self.reply(400, {"error": "Image invalide"})
                    result = subprocess.run([
                        sys.executable, str(engine / "run.py"), str(source),
                        "--device", args.device, "--pretrained-model-name-or-path", args.model,
                        "--output-dir", str(root / "output"), "--model-save-format", "glb",
                        "--chunk-size", "2048", "--mc-resolution", str(args.resolution),
                    ], cwd=engine, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=1200)
                    mesh = root / "output" / "0" / "mesh.glb"
                    if result.returncode or not mesh.is_file():
                        return self.reply(502, {"error": "TripoSR n’a pas produit de maillage"})
                    oriented = normalise_mesh(mesh, root / 'portrait-v27.glb')
                    data = oriented.read_bytes()
                    if len(data) < 20 or data[:4] != b"glTF" or int.from_bytes(data[8:12], "little") != len(data):
                        return self.reply(502, {"error": "GLB invalide"})
                    return self.reply(200, data, "model/gltf-binary")
            except subprocess.TimeoutExpired:
                self.reply(504, {"error": "Délai de calcul dépassé"})
            except Exception:
                self.reply(500, {"error": "Échec de reconstruction"})
            finally:
                lock.release()

    print("TripoSR : serveur local sur 127.0.0.1:%d" % args.port, flush=True)
    ThreadingHTTPServer(("127.0.0.1", args.port), Handler).serve_forever()

if __name__ == "__main__":
    main()
