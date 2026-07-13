import cloudinary
import cloudinary.uploader
import re

cloudinary.config(
    cloud_name="c36upord",
    api_key="112266435841181",
    api_secret="KY4wXo7piaYTDRPv0vUOiaQthpE",
    secure=True
)

urls = [
    "https://ecohub.vn/wp-content/uploads/2022/02/gio-may-dan-bang-tay-hinh-chu-nhat.png",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPsLnh9i_Z4tTpEm_7RRXiQI2ALxX_Y8cAVUBfgAot3Q&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqLJdiVj6Unobpan92OWB1guEoThNpdqxWuw_Ifu6IAw&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZVF1c6SDRlCZNwE8x1sGtj78uAdgLF2Jd2ZXFVYNrXw&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsklqiYDKN-cmGRZSi6MsY06KxpYck35rjWvxt2Ek4Kw&s",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMAhw8EIzfvpzfkvE6bUzO6K0FF4kfwTuMDG7Chq5daQ&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBFefw0zo3kNPlsnpo90tdbvayJNZK-XVqrMmrXXcBRg&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYNFaSMZ3Bcv8dLWu0Lq1jN8vu6Cs0WNIoc3Wg5T4RvA&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQV52iVlZiKZfGM6KHO5rXbzeRzm4_nLSaioelV5k1wQA&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFPOAkvww16QRMzyPTFjie_LeiUZxlrK-8uLgrHI9bLg&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcReyJU_qLRuy2rrVa6bKpBGAd3viJAlUi1CeOjYt5gzwQ&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1dNNVCxEhIUjzAJO-OIOCRp0E480MGMcEkqZy9zu6iw&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRoVWalElgDi6y3y0T2jfJVuFt24F_ja3qW4ObBzPJigw&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRY3FrKHdXhlhSP3cRmvRv-3eo1lQYkYm4FIShyV1EIIw&s=10"
]

print("Uploading images to Cloudinary...")
optimized_urls = []
for i, url in enumerate(urls):
    try:
        print(f"Uploading {i+1}/{len(urls)}: {url}")
        res = cloudinary.uploader.upload(url)
        # Apply f_auto,q_auto transformations
        trans_url, _ = cloudinary.utils.cloudinary_url(
            res.get('public_id'),
            fetch_format="auto",
            quality="auto"
        )
        optimized_urls.append(trans_url)
    except Exception as e:
        print(f"Failed to upload {url}: {e}")
        optimized_urls.append(None)

# Now update seed.py
with open("app/seed.py", "r", encoding="utf-8") as f:
    content = f.read()

# Sequential replacement of "image_url": None,
parts = content.split('"image_url": None,')
if len(parts) - 1 == 14:
    new_content = parts[0]
    for i in range(14):
        url_str = f'"{optimized_urls[i]}"' if optimized_urls[i] else "None"
        new_content += f'"image_url": {url_str},' + parts[i+1]
    
    with open("app/seed.py", "w", encoding="utf-8") as f:
        f.write(new_content)
    print("Updated seed.py with new image URLs.")
else:
    print(f"Error: Found {len(parts) - 1} occurrences of 'image_url': None, expected 14.")
