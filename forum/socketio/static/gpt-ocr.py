import base64
import requests
import os

# OpenAI API Key
api_key = os.environ.get('OPENAI_API_KEY')

# Function to encode the image
def encode_image(image_path):
  with open(image_path, "rb") as image_file:
    return base64.b64encode(image_file.read()).decode('utf-8')

# Path to your image
image_path = "C:/Project/websocket-server/forum/socketio/static/capture/gpt-ocr.jpg"

# Getting the base64 string
base64_image = encode_image(image_path)

headers = {
  "Content-Type": "application/json",
  "Authorization": f"Bearer {api_key}"
}

payload = {
  "model": "gpt-4o",
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "사진에 있는 빨간점과 가장 가까운 단어만 추출해서 불용어를 처리하고 너는 그 어떤 말도 하지 말고 그 단어만 출력해줘"
        },
        {
          "type": "image_url",
          "image_url": {
            "url": f"data:image/jpeg;base64,{base64_image}"
          }
        }
      ]
    }
  ],
  "max_tokens": 300
}

def readText(): 
  response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)
  result = response.json()
  text = result['choices'][0]['message']['content']
  ret = ''.join(text.split())
  print(ret.lower())

if __name__ == '__main__':
    readText()

