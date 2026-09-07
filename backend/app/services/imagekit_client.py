import os
import io
import base64
import requests
from PIL import Image as PILImage
from app.config import settings

def compress_image_bytes(file_bytes: bytes, max_dimension=800, quality=75) -> bytes:
    """
    Compresses image bytes using PIL to ensure file sizes are small (<80KB),
    fast to transfer, and well within all serverless function payload limits.
    """
    try:
        im = PILImage.open(io.BytesIO(file_bytes))
        if im.mode in ("RGBA", "P", "LA"):
            # Create a clean white background for transparent images
            bg = PILImage.new("RGB", im.size, (255, 255, 255))
            if im.mode == "RGBA":
                bg.paste(im, mask=im.split()[3])
            else:
                bg.paste(im)
            im = bg
        elif im.mode != "RGB":
            im = im.convert("RGB")

        # Resize if larger than max_dimension
        if im.width > max_dimension or im.height > max_dimension:
            im.thumbnail((max_dimension, max_dimension), PILImage.Resampling.LANCZOS)

        out_buf = io.BytesIO()
        im.save(out_buf, format="JPEG", quality=quality, optimize=True)
        compressed = out_buf.getvalue()
        return compressed
    except Exception:
        return file_bytes

def upload_image_to_imagekit(file_bytes: bytes, file_name: str) -> str:
    """
    Compresses image and uploads to ImageKit.io using Private API Key authorization.
    Returns the public image URL or lightweight fallback base64 URL.
    """
    # 1. Compress image bytes first
    compressed_bytes = compress_image_bytes(file_bytes, max_dimension=800, quality=75)

    if not settings.IMAGEKIT_PRIVATE_KEY or not settings.IMAGEKIT_URL_ENDPOINT:
        # Lightweight compressed fallback
        b64_data = base64.b64encode(compressed_bytes).decode('utf-8')
        return f"data:image/jpeg;base64,{b64_data}"

    try:
        url = "https://upload.imagekit.io/api/v1/files/upload"
        upload_name = file_name
        if not (upload_name.lower().endswith(".jpg") or upload_name.lower().endswith(".jpeg")):
            upload_name = f"{os.path.splitext(file_name)[0]}.jpg" if '.' in file_name else f"{file_name}.jpg"

        files = {
            'file': (upload_name, compressed_bytes, 'image/jpeg')
        }
        data = {
            'fileName': upload_name,
            'useUniqueFileName': 'true',
            'folder': '/jamia_usmania_photos'
        }
        
        # ImageKit basic auth using private key as username and empty password
        auth_header = base64.b64encode(f"{settings.IMAGEKIT_PRIVATE_KEY}:".encode('utf-8')).decode('utf-8')
        headers = {
            'Authorization': f'Basic {auth_header}'
        }

        res = requests.post(url, files=files, data=data, headers=headers, timeout=15)
        if res.status_code in (200, 201):
            data_res = res.json()
            return data_res.get("url", "")
        else:
            # Fallback with compressed bytes
            b64_data = base64.b64encode(compressed_bytes).decode('utf-8')
            return f"data:image/jpeg;base64,{b64_data}"
    except Exception:
        b64_data = base64.b64encode(compressed_bytes).decode('utf-8')
        return f"data:image/jpeg;base64,{b64_data}"
