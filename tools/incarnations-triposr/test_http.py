"""End-to-end HTTP test on a public-domain example, with no user photographs."""
import argparse
import io
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import time
import urllib.request
import urllib.error
import http.cookiejar
from PIL import Image
from skimage import data
import trimesh

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--engine",type=Path,required=True)
    ap.add_argument("--output",type=Path,required=True)
    args=ap.parse_args()
    origin="http://127.0.0.1:8765"
    with tempfile.TemporaryDirectory() as tmp:
        doc=Path(tmp)/"index.html"
        doc.write_text("<!doctype html><title>HTTP integration test</title>")
        server=subprocess.Popen([sys.executable,str(Path(__file__).with_name("server.py")),"--engine",str(args.engine),"--atelier",str(doc),"--resolution","192"])
        try:
            jar=http.cookiejar.CookieJar()
            opener=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))
            for _ in range(50):
                try:
                    with opener.open(origin+"/",timeout=2) as res:
                        assert res.status==200
                    break
                except OSError:
                    time.sleep(.2)
            else:
                raise RuntimeError("Server failed to start")
            with opener.open(origin+"/health") as res:
                assert res.status==200
            img=Image.fromarray(data.astronaut()).crop((155,30,300,220))
            payload=io.BytesIO()
            img.save(payload,format="PNG")
            req=urllib.request.Request(origin+"/reconstruct",data=payload.getvalue(),headers={"Content-Type":"image/png","Origin":origin})
            with opener.open(req,timeout=1200) as res:
                body=res.read()
                assert res.headers["Content-Type"]=="model/gltf-binary"
            assert body[:4]==b"glTF" and int.from_bytes(body[8:12],"little")==len(body)
            args.output.parent.mkdir(parents=True,exist_ok=True)
            args.output.write_bytes(body)
            mesh=trimesh.load(args.output,force="mesh")
            assert len(mesh.vertices)>1000 and mesh.visual.kind in ("vertex","texture")
            print("Real HTTP GLB",len(body),"bytes;",len(mesh.vertices),"vertices",flush=True)
        finally:
            server.terminate()
            server.wait(timeout=10)

if __name__=="__main__":
    main()
