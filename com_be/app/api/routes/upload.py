import cloudinary
import cloudinary.uploader
from fastapi import APIRouter, File, HTTPException, UploadFile

from app.api.deps import CurrentUserDep
from app.core.config import get_settings

router = APIRouter(tags=["upload"])

# Initialize Cloudinary config lazily when the first request comes or at startup
def init_cloudinary():
    settings = get_settings()
    if not settings.cloudinary_cloud_name:
        raise HTTPException(status_code=500, detail="Cloudinary credentials not configured")
    
    cloudinary.config(
        cloud_name=settings.cloudinary_cloud_name,
        api_key=settings.cloudinary_api_key,
        api_secret=settings.cloudinary_api_secret,
        secure=True
    )

@router.post("/upload")
async def upload_image(
    current_user: CurrentUserDep,
    file: UploadFile = File(...)
):
    """
    Uploads an image file to Cloudinary and returns the secure URL.
    Only authenticated users can upload.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Chỉ hỗ trợ tải lên file ảnh")

    try:
        init_cloudinary()
        
        # Read file contents
        contents = await file.read()
        
        # Upload to Cloudinary using python SDK
        # We store it in a specific folder 'avatars' for organization
        result = cloudinary.uploader.upload(
            contents,
            folder="avatars",
            # We apply f_auto and q_auto to optimize size and format automatically
            transformation=[
                {"quality": "auto", "fetch_format": "auto"}
            ]
        )
        
        return {"url": result.get("secure_url")}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi tải ảnh lên: {str(e)}")
