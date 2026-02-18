#!/usr/bin/env python3
"""
RetroSix PCE PCB Viewer - Local Server
Serves the board viewer on localhost using only Python's standard library.
Works on Windows and macOS.
"""

import sys
import os
import http.server
import socketserver
import webbrowser
import signal

PORT = 8001
HOST = "127.0.0.1"


def check_python_version():
    """Ensure we're running Python 3.6+."""
    if sys.version_info < (3, 6):
        print(f"[ERROR] Python 3.6+ is required. You have {sys.version}")
        sys.exit(1)
    print(f"[OK] Python {sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}")


def get_project_root():
    """Return the project root (one level up from Scripts/)."""
    return os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def check_required_files(root):
    """Verify all files the viewer needs are present."""
    required = [
        "index.html",
        os.path.join("assets", "panzoom.js"),
        os.path.join("assets", "Top.jpg"),
        os.path.join("assets", "Top Copper.jpg"),
        os.path.join("assets", "Bottom.jpg"),
        os.path.join("assets", "Bottom Copper.jpg"),
    ]

    missing = []
    for f in required:
        path = os.path.join(root, f)
        if not os.path.isfile(path):
            missing.append(f)

    if missing:
        print("[ERROR] Missing required files:")
        for f in missing:
            print(f"  - {f}")
        sys.exit(1)

    print(f"[OK] All required files found")


def find_available_port(host, start_port):
    """If the default port is busy, find the next available one."""
    import socket

    for port in range(start_port, start_port + 100):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind((host, port))
                return port
            except OSError:
                continue

    print(f"[ERROR] No available port found in range {start_port}-{start_port + 99}")
    sys.exit(1)


def serve(root, host, port):
    """Start the HTTP server and open the browser."""
    os.chdir(root)

    handler = http.server.SimpleHTTPRequestHandler

    # Suppress per-request log noise
    handler.log_message = lambda self, fmt, *args: None

    try:
        httpd = socketserver.TCPServer((host, port), handler)
    except OSError:
        port = find_available_port(host, port)
        httpd = socketserver.TCPServer((host, port), handler)

    url = f"http://{host}:{port}"
    print(f"[OK] Server running at {url}")
    print(f"     Press Ctrl+C to stop\n")

    # Graceful shutdown on Ctrl+C
    def shutdown(sig, frame):
        print("\nShutting down...")
        httpd.shutdown()
        sys.exit(0)

    signal.signal(signal.SIGINT, shutdown)

    webbrowser.open(url)
    httpd.serve_forever()


def main():
    print("RetroSix PCE PCB Viewer\n")

    check_python_version()

    root = get_project_root()
    print(f"[OK] Project root: {root}")

    check_required_files(root)

    port = PORT
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print(f"[WARN] Invalid port '{sys.argv[1]}', using default {PORT}")
            port = PORT

    serve(root, HOST, port)


if __name__ == "__main__":
    main()
