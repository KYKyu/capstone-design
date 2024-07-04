import sys
import pyautogui as p
from PIL import Image
import pytesseract

def readText():
    pytesseract.pytesseract.tesseract_cmd = r'C:/Program Files/Tesseract-OCR/tesseract.exe'
    news = Image.open('C:/Project/websocket-server/forum/socketio/static/capture/gpt-ocr.png')
    text = pytesseract.image_to_string(news, lang='kor+eng')
    ret = ''.join(text.split())
    print(ret.lower())

if __name__ == '__main__':
    readText()