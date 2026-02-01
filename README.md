# 🎥 VideoChat Pro: Full-Stack WebRTC & Real-Time Messaging

A high-performance, full-stack communication platform featuring peer-to-peer video calls and instant messaging. Built with a focus on **Clean Architecture** (Controller-Service-Repository) and robust security practices.



## 🚀 Key Features

* **P2P Video Communication:** Low-latency video calls powered by WebRTC API.
* **Real-Time Chat:** Scalable messaging system using Socket.io with "delivered/read" message statuses.
* **Robust Authentication:** Secure login system using JWT (JSON Web Tokens) and Bcrypt password hashing.
* **Email Verification:** Automated user verification flow using Nodemailer and Handlebars templates.
* **Cloud Backup Engine:** Automated synchronization service that backs up local JSON database files to **Google Cloud Storage**.
* **Clean Architecture:** Modular code structure for high maintainability and testability.

## 🛠 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React, Redux Toolkit, Socket.io-client, WebRTC |
| **Backend** | Node.js, Express.js, Socket.io |
| **Security** | JWT, Bcrypt, Middleware protection |
| **Infrastructure** | Google Cloud Platform (GCP), Nodemailer |
| **Data Handling** | Asynchronous File System ORM (JSON-based) |



## 🏗 Project Structure

The backend follows the **Separation of Concerns** principle:
- `/src/controllers` - Handles HTTP request/response logic.
- `/src/services` - Contains core business logic (Cloud Sync, WebRTC Signaling, Mail).
- `/src/middlewares` - Route protection and user verification layers.
- `/src/models` - Data schemas and factory functions.
- `/src/utils` - Asynchronous I/O helpers and security utilities.

## 🔧 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/shevchenkogit/video-chat-pro.git](https://github.com/shevchenkogit/video-chat-pro.git)
   cd video-chat-pro