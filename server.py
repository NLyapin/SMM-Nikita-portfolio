#!/usr/bin/env python
# -*- coding: utf-8 -*-
import http.server
import socketserver
import os
import webbrowser
from pathlib import Path

# Получаем директорию, где находится этот скрипт
SCRIPT_DIR = Path(__file__).parent.absolute()
os.chdir(SCRIPT_DIR)

PORT = 3000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(SCRIPT_DIR), **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

def main():
    print("\n" + "="*50)
    print("  Запуск локального сервера")
    print("="*50)
    print(f"\nДиректория проекта: {SCRIPT_DIR}")
    print(f"\nСервер запускается на http://localhost:{PORT}")
    print("\nНажмите Ctrl+C для остановки сервера\n")

    # Запускаем сервер
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"✅ Сервер запущен на http://localhost:{PORT}")
        print("="*50 + "\n")

        # Открываем браузер через 1 секунду
        import threading
        def open_browser():
            import time
            time.sleep(1)
            webbrowser.open(f'http://localhost:{PORT}')

        browser_thread = threading.Thread(target=open_browser, daemon=True)
        browser_thread.start()

        # Проверка через curl/requests
        def check_server():
            import time
            time.sleep(2)
            try:
                import urllib.request
                req = urllib.request.urlopen(f'http://localhost:{PORT}', timeout=3)
                if req.getcode() == 200:
                    print(f"✅ Проверка: Сервер отвечает (HTTP {req.getcode()})")
            except Exception as e:
                print(f"⚠️ Проверка не удалась: {e}")

        check_thread = threading.Thread(target=check_server, daemon=True)
        check_thread.start()

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\nСервер остановлен.")

if __name__ == "__main__":
    main()

