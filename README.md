# 🤖 NeedBot - AI Powered Chatbot

## 📌 Overview

NeedBot is an AI-powered chatbot built using **HTML, CSS, JavaScript, and Python Flask**. It provides intelligent, real-time responses to user queries by connecting to an AI model through a secure API.

The chatbot offers a clean and user-friendly interface with conversation management features such as chat history, rename, delete, search, and multiple AI personas.

---

# ✨ Features

* 🤖 AI-powered chatbot
* 💬 Real-time AI responses
* 📝 Chat History
* ➕ New Chat
* ✏️ Rename Conversation
* 🗑️ Delete Individual Chat
* 🗑️ Delete All Chats
* 🔍 Search Conversation History
* 🌙 Light & Dark Mode
* 📋 Copy AI Responses
* 🎭 Multiple Personas

  * Assistant
  * Teacher
  * Coder
  * Interviewer
  * Career Mentor
  * Debugger
* 🔒 Secure API Key Integration
* 📱 Responsive User Interface

---

# 🛠️ Technologies Used

### Frontend

* HTML5
* CSS3
* JavaScript

### Backend

* Python
* Flask

### AI Integration

* OpenRouter API (AI Model)
* API Key Authentication

### Database / Storage

* JSON File (Chat History)

---

# 📂 Project Structure

```text
NeedBot/
│
├── static/
│   ├── style.css
│   └── script.js
│
├── templates/
│   └── index.html
│
├── chat_history.json
├── app.py
├── requirements.txt
├── .env
├── README.md
└── .gitignore
```

---

# 🚀 How It Works

1. The user opens the NeedBot application.
2. The user enters a question in the chat box.
3. JavaScript sends the request to the Flask backend.
4. Flask receives the request.
5. The backend sends the user's message to the AI model using a secure API Key.
6. The AI generates a response.
7. Flask sends the response back to the frontend.
8. JavaScript displays the response instantly.
9. The conversation is automatically saved in the chat history.

---

# 💻 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/NeedBot.git
cd NeedBot
```

### 2. Create a Virtual Environment (Optional)

```bash
python -m venv venv
```

Activate it:

**Windows**

```bash
venv\Scripts\activate
```

**Linux / macOS**

```bash
source venv/bin/activate
```

---

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

---

### 4. Configure the API Key

Create a `.env` file in the project folder.

```env
OPENROUTER_API_KEY=your_api_key_here
```

---

### 5. Run the Application

```bash
python app.py
```

---

### 6. Open in Browser

```text
http://127.0.0.1:5000
```

---

# 📁 Main Files

## app.py

* Flask backend
* API communication
* Chat history management
* Persona handling
* Routes

## index.html

Creates the chatbot interface.

Includes:

* Header
* Sidebar
* Chat Area
* Input Box
* Buttons

## style.css

Provides:

* Modern UI
* Responsive Design
* Dark Mode
* Animations
* Chat Styling

## script.js

Handles:

* Sending Messages
* Receiving AI Responses
* Chat History
* Search
* Rename
* Delete
* Copy Response
* Theme Switching

---

# 🎭 Available Personas

* 🤖 Assistant
* 👨‍🏫 Teacher
* 💻 Coder
* 🎤 Interviewer
* 🧑‍💼 Career Mentor
* 🐛 Debugger

Each persona changes the AI's response style according to the selected role.

---

# 📜 API Integration

NeedBot securely communicates with the AI model using an API Key.

The API Key is stored in the `.env` file and accessed only by the backend, ensuring it is never exposed to users.

---

# 💾 Chat History

NeedBot automatically stores conversations in a JSON file.

Users can:

* View previous conversations
* Continue old chats
* Rename chats
* Delete selected chats
* Delete all chats

---

# 🎯 Future Enhancements

* User Authentication
* Voice Input & Voice Response
* Image Upload Support
* File Upload & Analysis
* Multiple AI Models
* Database Integration (MongoDB/MySQL)
* User Profiles
* Export Chat as PDF
* Multi-language Support

---

# 👩‍💻 Developer

**G. Uma Devi**

B.Tech Student

---

# 📄 License

This project is developed for educational and learning purposes.

---

## ⭐ If you found this project useful, don't forget to give it a Star on GitHub!
