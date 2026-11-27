"""CPU adapter for the TripoSR torchmcubes interface.
scikit-image emits axis order (0,1,2); TripoSR expects torchmcubes
coordinates in reverse axis order and reverses them at its call site.
"""
import numpy as np
import torch
from skimage.measure import marching_cubes as _marching_cubes

def marching_cubes(volume, level=0.0):
    data = volume.detach().cpu().numpy().astype(np.float32, copy=False)
    vertices, faces, _, _ = _marching_cubes(data, level=float(level), gradient_direction="descent", allow_degenerate=False)
    return (
        torch.from_numpy(np.ascontiguousarray(vertices[:, ::-1], dtype=np.float32)).to(volume.device),
        torch.from_numpy(np.ascontiguousarray(faces, dtype=np.int64)).to(volume.device),
    )
