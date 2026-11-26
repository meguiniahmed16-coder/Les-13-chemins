"""Convert the verified CPU adapter's X-front/Z-up mesh to V27 coordinates."""
from pathlib import Path
import sys
import trimesh
import numpy as np

def normalise_mesh(source: Path, target: Path):
    mesh = trimesh.load(source, force="mesh", process=False)
    if len(mesh.vertices) < 20 or len(mesh.faces) < 10:
        raise ValueError("Invalid head mesh")
    if not np.isfinite(mesh.vertices).all():
        raise ValueError("Non-finite vertices")
    if mesh.visual.kind not in ("vertex", "texture"):
        raise ValueError("No reconstructed appearance")
    mesh.vertices = np.ascontiguousarray(mesh.vertices[:, [1, 2, 0]])
    if mesh.is_watertight and mesh.volume < 0:
        mesh.invert()
    mesh.export(target, file_type="glb")
    return target

if __name__ == "__main__":
    normalise_mesh(Path(sys.argv[1]), Path(sys.argv[2]))
