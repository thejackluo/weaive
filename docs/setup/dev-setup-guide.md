# Developer Setup Guide for Non-Technical People

**Welcome to Weave!** This guide will help you set up your development environment from scratch, even if you've never coded before.

**Time Required:** 1-2 hours (including downloads)
**Difficulty:** Beginner-friendly with detailed screenshots and explanations

---

## What You'll Be Setting Up

By the end of this guide, you'll have:
- ✅ A code editor (Cursor IDE with AI assistance)
- ✅ AI coding assistant (Claude Code Pro)
- ✅ BMAD methodology tools (for structured development)
- ✅ Version control (Git and GitHub)
- ✅ All necessary programming tools (Node.js, Python)
- ✅ This project running on your computer

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Install Cursor IDE](#2-install-cursor-ide-your-code-editor)
3. [Set Up Claude Code](#3-set-up-claude-code-ai-assistant)
4. [Install Git and GitHub](#4-install-git-and-github)
5. [Install Node.js](#5-install-nodejs)
6. [Install Python](#6-install-python)
7. [Clone This Project](#7-clone-this-project)
8. [Set Up BMAD](#8-set-up-bmad-methodology)
9. [Verify Everything Works](#9-verify-everything-works)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Prerequisites

### What You Need

- **Computer:** Windows 10+, macOS 10.15+, or Linux
- **Internet Connection:** For downloading tools and AI features
- **Disk Space:** ~5GB free space
- **Email Account:** For creating accounts
- **Student Email (Optional):** For free Cursor Student license

### Create These Accounts (Free)

Before you start, create accounts on these platforms:

1. **GitHub** (code hosting)
   - Go to https://github.com/signup
   - Create account with your email
   - Verify your email address

2. **Anthropic** (for Claude AI)
   - Go to https://console.anthropic.com
   - Sign up with Google/email
   - You'll get free credits to start

3. **Cursor** (code editor)
   - Go to https://cursor.sh
   - Sign up for an account
   - If you have a student email (.edu), apply for free Student license

---

## 2. Install Cursor IDE (Your Code Editor)

Cursor is like Microsoft Word, but for code. It has built-in AI that helps you write code.

### Step 2.1: Download Cursor

1. Go to https://cursor.sh
2. Click **"Download for [Your OS]"**
3. Wait for download to complete (~200MB)

### Step 2.2: Install Cursor

**On Windows:**
1. Open the downloaded `CursorSetup.exe`
2. Click "Install"
3. Wait for installation (2-3 minutes)
4. Launch Cursor when prompted

**On macOS:**
1. Open the downloaded `.dmg` file
2. Drag Cursor to Applications folder
3. Open Applications → Cursor
4. Click "Open" if you see security warning

**On Linux:**
```bash
# Download the .AppImage
chmod +x Cursor-*.AppImage
./Cursor-*.AppImage
```

### Step 2.3: Sign In to Cursor

1. When Cursor opens, click **"Sign In"**
2. Choose "Sign in with GitHub" (recommended)
3. Authorize Cursor to access GitHub
4. You're now signed in!

### Step 2.4: Apply for Cursor Student (Optional)

If you have a student email:
1. Go to https://cursor.sh/settings
2. Click **"Education"** tab
3. Enter your `.edu` email address
4. Check your email and verify
5. You'll get **free Cursor Pro for 2 years!**

**What you get with Student license:**
- Unlimited AI completions
- Claude Code Pro access
- Premium features

---

## 3. Set Up Claude Code (AI Assistant)

Claude Code is an AI that helps you write code, fix bugs, and understand the codebase.

### Step 3.1: Install Claude Code in Cursor

1. Open Cursor
2. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
3. Type: `Install Claude Code`
4. Press Enter
5. Wait for installation (30 seconds)

### Step 3.2: Get Your Anthropic API Key

1. Go to https://console.anthropic.com
2. Sign in to your account
3. Click **"API Keys"** in the left sidebar
4. Click **"Create Key"**
5. Name it: `Weave Development`
6. Click **"Create Key"**
7. **IMPORTANT:** Copy the key immediately! You can't see it again.

Example key format: `sk-ant-api03-xxxxx...`

### Step 3.3: Add API Key to Cursor

1. In Cursor, press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Type: `Claude Code: Settings`
3. Press Enter
4. Paste your API key in the field
5. Click **"Save"**

### Step 3.4: Test Claude Code

1. Open any file in Cursor (or create a new one)
2. Press `Ctrl+L` (or `Cmd+L` on Mac)
3. Type: "Hello Claude, are you working?"
4. Press Enter
5. You should see Claude respond!

**If it works:** ✅ You're all set!
**If it doesn't work:** See [Troubleshooting](#10-troubleshooting)

---

## 4. Install Git and GitHub

Git tracks changes to your code. GitHub stores your code online.

### Step 4.1: Install Git

**On Windows:**
1. Download Git: https://git-scm.com/download/win
2. Run the installer
3. **IMPORTANT:** Use default settings (just keep clicking "Next")
4. Finish installation

**On macOS:**
```bash
# Open Terminal (Cmd+Space, type "Terminal")
xcode-select --install
```
Click "Install" when prompted.

**On Linux:**
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install git

# Fedora
sudo dnf install git
```

### Step 4.2: Configure Git

Open Terminal (or Git Bash on Windows) and run:

```bash
# Set your name (use your real name)
git config --global user.name "Your Name"

# Set your email (use your GitHub email)
git config --global user.email "your.email@example.com"

# Verify it worked
git config --list
```

You should see your name and email displayed.

### Step 4.3: Connect Git to GitHub

1. Open Terminal
2. Generate SSH key:
```bash
ssh-keygen -t ed25519 -C "your.email@example.com"
```
3. Press Enter 3 times (accept defaults, no passphrase)
4. Copy your public key:

**On Windows/Linux:**
```bash
cat ~/.ssh/id_ed25519.pub
```

**On macOS:**
```bash
pbcopy < ~/.ssh/id_ed25519.pub
```

5. Go to https://github.com/settings/keys
6. Click **"New SSH key"**
7. Title: `My Development Machine`
8. Paste the key in "Key" field
9. Click **"Add SSH key"**

### Step 4.4: Test GitHub Connection

```bash
ssh -T git@github.com
```

You should see: `Hi [username]! You've successfully authenticated...`

---

## 5. Install Node.js

Node.js lets you run JavaScript code and is needed for the mobile app.

### Step 5.1: Download Node.js

1. Go to https://nodejs.org
2. Download **"LTS"** version (left button)
3. Current recommended: Node.js 20.x or 22.x

### Step 5.2: Install Node.js

**On Windows/macOS:**
1. Run the downloaded installer
2. Click "Next" through all steps
3. Accept the license agreement
4. Use default installation location
5. Finish installation

**On Linux:**
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Fedora
sudo dnf install nodejs
```

### Step 5.3: Verify Node.js Installation

Open a **new** Terminal window and run:

```bash
node --version
# Should show: v20.x.x or v22.x.x

npm --version
# Should show: 10.x.x or higher
```

If you see version numbers, you're good! ✅

### Step 5.4: Important Note About Package Installation

When working with the Expo mobile app (`weave-mobile/`), always use `npx expo install` instead of `npm install` for adding new packages:

**✅ Correct:**
```bash
cd weave-mobile
npx expo install react-native-screens
```

**❌ Incorrect:**
```bash
cd weave-mobile
npm install react-native-screens
```

**Why?** `npx expo install` automatically installs SDK-compatible versions and prevents dependency conflicts that can cause hard-to-debug issues.

---

## 6. Install Python

Python is needed for the backend API.

### Step 6.1: Download Python

1. Go to https://www.python.org/downloads/
2. Download **Python 3.11** or **Python 3.12**
3. **DO NOT** download Python 3.13 (too new, some packages don't support it yet)

### Step 6.2: Install Python

**On Windows:**
1. Run the installer
2. **CRITICAL:** Check ✅ **"Add Python to PATH"** at the bottom!
3. Click "Install Now"
4. Wait for installation
5. Click "Close"

**On macOS:**
```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Python
brew install python@3.11
```

**On Linux:**
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install python3.11 python3.11-venv python3-pip

# Fedora
sudo dnf install python3.11
```

### Step 6.3: Install UV Package Manager

UV is a fast Python package manager (better than pip).

```bash
# Windows (PowerShell)
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### Step 6.4: Verify Python Installation

Open a **new** Terminal window:

```bash
python3 --version
# Should show: Python 3.11.x or 3.12.x

uv --version
# Should show: uv x.x.x
```

---

## 7. Clone This Project

Now let's download the Weave project to your computer.

### Step 7.1: Choose a Location

Decide where to store the project. Good options:
- **Windows:** `C:\Users\YourName\Documents\Projects\`
- **macOS/Linux:** `~/Documents/Projects/` or `~/Code/`

### Step 7.2: Clone the Repository

Open Terminal and navigate to your chosen location:

```bash
# Create a Projects folder if it doesn't exist
mkdir -p ~/Documents/Projects
cd ~/Documents/Projects

# Clone the Weave repository (replace with actual GitHub URL)
git clone https://github.com/YOUR-USERNAME/weavelight.git

# Enter the project folder
cd weavelight
```

### Step 7.3: Open Project in Cursor

1. In Cursor, click **File → Open Folder**
2. Navigate to your `weavelight` folder
3. Click **"Open"**
4. Cursor will load the project

You should see the project files in the left sidebar!

---

## 8. Set Up BMAD Methodology

BMAD is a structured workflow system that guides development with AI agents.

### Step 8.1: Understand BMAD Structure

BMAD is already in this project! You'll see these folders:
- `.bmad/` - BMAD system files (agents, workflows)
- `.claude/` - Claude Code configuration
- `docs/` - All project documentation

### Step 8.2: Verify BMAD Files Exist

In Cursor, check that these folders exist:
- ✅ `.bmad/core/` - Core BMAD system
- ✅ `.bmad/bmb/` - BMAD Builder module
- ✅ `.bmad/_cfg/` - Configuration files
- ✅ `.claude/` - Claude Code settings

### Step 8.3: Configure Your BMAD Settings

1. Open `.bmad/core/config.yaml` in Cursor
2. Update these fields:
```yaml
user_name: "Your Name"
communication_language: "English"
output_folder: "docs/"
```
3. Save the file (Ctrl+S or Cmd+S)

### Step 8.4: Test BMAD Integration

1. In Cursor, press `Ctrl+L` (or `Cmd+L`)
2. Ask Claude: "Can you explain the BMAD workflow status?"
3. Claude should read `docs/bmm-workflow-status.yaml` and explain it

If Claude can read the file and explain it, BMAD is working! ✅

---

## 9. Verify Everything Works

Let's run through a quick checklist to make sure everything is set up correctly.

### Checklist: Tools Installed

Open Terminal and run these commands:

```bash
# Git
git --version
# ✅ Should show: git version 2.x.x

# Node.js
node --version
# ✅ Should show: v20.x.x or v22.x.x

npm --version
# ✅ Should show: 10.x.x

# Python
python3 --version
# ✅ Should show: Python 3.11.x or 3.12.x

# UV
uv --version
# ✅ Should show: uv x.x.x
```

### Checklist: Accounts Created

- ✅ GitHub account (and logged in)
- ✅ Anthropic account (and have API key)
- ✅ Cursor account (and signed in to Cursor IDE)

### Checklist: Project Setup

- ✅ Weave project cloned to your computer
- ✅ Project opened in Cursor
- ✅ Can see `.bmad/` and `docs/` folders
- ✅ Claude Code responds when you press Ctrl+L

### Checklist: Documentation Access

In Cursor, try opening these files to verify they exist:
- ✅ `CLAUDE.md` - Main guidance file
- ✅ `docs/sprint-plan.md` - Sprint roadmap
- ✅ `docs/architecture.md` - System architecture
- ✅ `docs/bmm-workflow-status.yaml` - Workflow tracking

---

## 10. Troubleshooting

### Problem: "Command not found" errors

**Symptom:** When you type `git`, `node`, or `python3`, you see "command not found"

**Solution:**
1. Close Terminal completely
2. Open a **new** Terminal window
3. Try the command again

If still not working:
- **Windows:** Restart your computer
- **macOS/Linux:** Run `source ~/.bashrc` or `source ~/.zshrc`

---

### Problem: Claude Code doesn't respond

**Symptom:** You press Ctrl+L but nothing happens, or you get an error

**Possible causes:**

**1. No API key set**
- Go to Cursor settings
- Check if Anthropic API key is entered
- Make sure it starts with `sk-ant-api03-`

**2. API key invalid**
- Go back to https://console.anthropic.com
- Create a new API key
- Replace the old one in Cursor settings

**3. No internet connection**
- Claude Code requires internet to work
- Check your connection
- Try loading a website to verify

---

### Problem: Git authentication fails

**Symptom:** When you try to clone/push, you get "Permission denied"

**Solution:**
1. Make sure you added your SSH key to GitHub (Step 4.3)
2. Test connection: `ssh -T git@github.com`
3. If still failing, use HTTPS instead:
```bash
git clone https://github.com/YOUR-USERNAME/weavelight.git
```

---

### Problem: Python installation doesn't work on Windows

**Symptom:** `python3` command not found, or Python not in PATH

**Solution:**
1. Uninstall Python completely
2. Download Python again from python.org
3. **This time:** Check ✅ "Add Python to PATH" during installation
4. Finish installation
5. Restart computer
6. Try `python --version` (note: `python` not `python3` on Windows)

---

### Problem: Node.js version is too old

**Symptom:** You have Node.js but it's version 16 or older

**Solution:**
1. Uninstall old Node.js
   - **Windows:** Control Panel → Programs → Uninstall Node.js
   - **macOS:** `brew uninstall node`
   - **Linux:** `sudo apt-get remove nodejs`
2. Install the latest LTS version (Step 5)
3. Verify: `node --version` should show v20 or v22

---

### Problem: BMAD files are missing

**Symptom:** You don't see `.bmad/` folder in Cursor

**Possible causes:**

**1. Hidden files not showing**
- In Cursor, press `Ctrl+Shift+P` (or `Cmd+Shift+P`)
- Type: "View: Toggle Hidden Files"
- Press Enter
- You should now see `.bmad/` and `.claude/`

**2. Wrong branch**
- Make sure you're on the `main` branch
- In Terminal: `git checkout main`

---

### Problem: Too many errors, want to start fresh

**Solution: Clean installation**

1. Delete the `weavelight` folder
2. Clone the project again (Step 7)
3. Open in Cursor
4. Verify all files exist

---

## Next Steps

### You're All Set! 🎉

You now have a complete development environment. Here's what to do next:

### 1. Read the Documentation

Start with these files (in order):
1. `CLAUDE.md` - Project overview and guidelines
2. `docs/sprint-plan.md` - What we're building and when
3. `docs/architecture.md` - How the system works

### 2. Start Week 0: Foundation

Open `docs/sprint-plan.md` and read the "Week 0: Foundation" section. This is where code development starts.

### 3. Ask Claude for Help

Press `Ctrl+L` in Cursor and ask Claude:
- "Can you explain the project structure?"
- "What should I work on first?"
- "How do I run the documentation viewer?"

### 4. Run the Documentation Viewer

To browse all docs in a nice UI:

**Windows:**
```powershell
.\dev\docs-viewer\scripts\serve.ps1
```

**macOS/Linux:**
```bash
./dev/docs-viewer/scripts/serve.sh
```

Then open: http://localhost:3030

---

## Getting Help

### Documentation

- **CLAUDE.md** - Main project guide
- **docs/dev/** - Developer guides
- **docs/setup/** - Setup and configuration

### Ask Claude Code

Claude can help with:
- Explaining code
- Finding files
- Understanding workflows
- Debugging errors

Just press `Ctrl+L` and ask!

### Common Questions

**Q: Do I need to know how to code?**
A: No! Claude Code will guide you through writing code step by step.

**Q: How much will API costs be?**
A: For development, you'll use ~$5-10/month in Claude API credits. Anthropic gives you free credits to start.

**Q: Can I use this on multiple computers?**
A: Yes! Just clone the repo on each computer and sign in to Cursor.

**Q: What if I break something?**
A: Git tracks all changes. You can always undo with `git reset --hard` (but ask Claude first!).

---

## Summary

You've installed:
- ✅ Cursor IDE with AI assistance
- ✅ Claude Code Pro (AI coding assistant)
- ✅ Git and GitHub (version control)
- ✅ Node.js (for mobile app)
- ✅ Python + UV (for backend API)
- ✅ BMAD methodology (structured workflows)
- ✅ Weave project (this codebase)

**You're ready to build!** 🚀

Next: Open `docs/sprint-plan.md` and start Week 0: Foundation.

**Questions?** Ask Claude Code by pressing `Ctrl+L` in Cursor!

---

**Last Updated:** 2025-12-16
**Maintainer:** Weave Development Team
**Difficulty:** Beginner-friendly
**Estimated Setup Time:** 1-2 hours
