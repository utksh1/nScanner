# 🔍 nScanner – Safe, Web-Based Network Recon Tool

**nScanner** is a cybersecurity utility that performs **non-intrusive port scanning** and generates a risk assessment based on observed service banners and configurations. Built with Python FastAPI backend and Next.js frontend.

> ⚠️ For educational and personal use only. Not for unauthorized or commercial use.

## 🚀 Features

- **FastAPI Backend:** Asynchronous, high-speed, scalable performance
- **Safety-Focused Scanning:** Non-exploitative TCP checks for service banners, headers, and TLS info
- **Risk Assessment:** Vulnerability risk score and level calculation
- **RESTful API:** Well-defined, documented endpoints
- **Web UI:** Modern Next.js interface for easy scanning

## 🧠 Prerequisites

- Python 3.8+ (3.11/3.12 recommended)
- Node.js 16+
- Git

## 💻 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/Anushree401/nScanner.git
   cd nScanner
   ```

2. **Setup environment**
   ```bash
   ./setup.sh
   ```

3. **Start the application**
   ```bash
   ./start.sh
   ```

The backend will run on `http://127.0.0.1:8000` and frontend on `http://localhost:3000`.

## 📖 API Usage

### Start a Scan
```bash
curl -X POST "http://127.0.0.1:8000/api/scan" \
  -H "Content-Type: application/json" \
  -d '{"host": "scanme.nmap.org", "ports": "22,80,443"}'
```

### Get Results
Replace `YOUR_SCAN_ID` with the ID from the POST response.
```bash
curl -X GET "http://127.0.0.1:8000/api/scan/YOUR_SCAN_ID"
```

Access interactive API docs at `http://127.0.0.1:8000/docs`.

## 📄 License

Restricted Educational Use License.

## 🙋‍♀️ Authors

**Anushree Balaji**  
📧 [anushree1606balaji@gmail.com](mailto:anushree1606balaji@gmail.com)  
🔗 [GitHub – Anushree401](https://github.com/Anushree401)

**Utkarsh Singh**  
📧 [Utkarshsingh60101@gmail.com](mailto:Utkarshsingh60101@gmail.com)  
🔗 [GitHub – utksh1](https://github.com/utksh1)
