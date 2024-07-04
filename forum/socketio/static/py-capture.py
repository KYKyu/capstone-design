import sys
import pyautogui as p

dest = "C:/project/websocket-server/forum/socketio/static/capture/"

def capture(x, y):
    y += 30
    p.screenshot(dest + "gpt-ocr.jpg", region=(190, 350, 800, 440))
    print("[Python] word capture finish")

if __name__ == '__main__':
    # capture(int(sys.argv[1]), int(sys.argv[2]))
    capture(450, 450)   