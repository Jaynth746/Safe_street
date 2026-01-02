import requests
from PIL import Image
import io

def test_analyze_endpoint():
    url = "http://localhost:8000/analyze"
    
    # Create a dummy image (red square)
    img = Image.new('RGB', (224, 224), color = 'red')
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='JPEG')
    img_byte_arr.seek(0)
    
    files = {'roadImage': ('test_image.jpg', img_byte_arr, 'image/jpeg')}
    data = {'email': 'test@example.com'}
    
    try:
        print(f"Sending request to {url}...")
        response = requests.post(url, files=files, data=data)
        
        print(f"Status Code: {response.status_code}")
        print("Response JSON:")
        print(response.json())
        
        if response.status_code == 200 and response.json().get("success"):
            print("\n✅ API Test Passed!")
        else:
            print("\n❌ API Test Failed")
            
    except requests.exceptions.ConnectionError:
        print("\n❌ Could not connect to server. Is it running?")

if __name__ == "__main__":
    test_analyze_endpoint()
