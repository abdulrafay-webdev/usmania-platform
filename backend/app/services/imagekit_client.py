import base64
import requests
from app.config import settings

def upload_image_to_imagekit(file_bytes: bytes, file_name: str) -> str:
    """
    Uploads a file to ImageKit.io using Private API Key authorization.
    Returns the public image URL or fallback URL.
    """
    if not settings.IMAGEKIT_PRIVATE_KEY or not settings.IMAGEKIT_URL_ENDPOINT:
        # Fallback for local testing / unconfigured environment
        b64_data = base64.b64encode(file_bytes).decode('utf-8')
        mime_type = "image/jpeg"
        if file_name.lower().endswith(".png"):
            mime_type = "image/png"
        elif file_name.lower().endswith(".webp"):
            mime_type = "image/webp"
        return f"data:{mime_type};base64,{b64_data}"

    try:
        url = "https://upload.imagekit.io/api/v1/files/upload"
        files = {
            'file': (file_name, file_bytes),
            'fileName': file_name,
            'useUniqueFileName': 'true',
            'folder': '/jamia_usmania_photos'
        }
        
        # ImageKit basic auth using private key as username and empty password
        auth_header = base64.b64encode(f"{settings.IMAGEKIT_PRIVATE_KEY}:".encode('utf-8')).decode('utf-8')
        headers = {
            'Authorization': f'Basic {auth_header}'
        }

        res = requests.post(url, files=files, headers=headers, timeout=15)
        if res.status_code == 200 or res.status_code == 201:
            data = res.json()
            return data.get("url", "")
        else:
            # Fallback if ImageKit API returns error
            b64_data = base64.b64encode(file_bytes).decode('utf-8')
            return f"data:image/jpeg;base64,{b64_data}"
    except Exception as e:
        b64_data = base64.b64encode(file_bytes).decode('utf-8')
        return f"data:image/jpeg;base64,{b64_data}"
