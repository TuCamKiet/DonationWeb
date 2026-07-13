import cloudinary
import cloudinary.uploader
import cloudinary.api

# 1. Configure Cloudinary
cloudinary.config(
    cloud_name="c36upord",
    api_key="112266435841181",
    api_secret="KY4wXo7piaYTDRPv0vUOiaQthpE",
    secure=True
)

def main():
    print("Uploading image...")
    # 2. Upload an image from Cloudinary's demo domains
    upload_result = cloudinary.uploader.upload("https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg")
    
    print(f"Secure URL: {upload_result.get('secure_url')}")
    print(f"Public ID: {upload_result.get('public_id')}")
    
    print("\nFetching image metadata...")
    # 3. Get image details
    print(f"Width: {upload_result.get('width')} px")
    print(f"Height: {upload_result.get('height')} px")
    print(f"Format: {upload_result.get('format')}")
    print(f"File size: {upload_result.get('bytes')} bytes")
    
    print("\nApplying transformations...")
    # 4. Transform the image
    # f_auto: Automatically selects the most efficient image format (e.g., WebP/AVIF) based on the user's browser.
    # q_auto: Automatically adjusts compression to balance quality and file size optimally.
    transformed_url, _ = cloudinary.utils.cloudinary_url(
        upload_result.get('public_id'),
        fetch_format="auto",
        quality="auto"
    )
    
    print("Done! Click link below to see optimized version of the image. Check the size and the format.")
    print(f"{transformed_url}")

if __name__ == "__main__":
    main()
