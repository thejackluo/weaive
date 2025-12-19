# AgentVibes TTS Setup Guide

Quick guide to get Text-to-Speech working with Claude Code + AgentVibes.

## What is AgentVibes TTS?

AgentVibes adds voice personality to AI assistants. Instead of just reading text responses, Claude can **speak** to you at key moments:
- Acknowledging tasks
- Announcing completion
- Highlighting major decisions and findings

## Prerequisites

- WSL2/Linux or macOS
- Terminal access with sudo permissions
- Internet connection (for initial setup)

## Installation

### Step 1: Install Piper TTS

#### On WSL/Linux:

```bash
# Install pipx (Python package installer)
sudo apt-get update && sudo apt-get install -y pipx

# Install Piper TTS
pipx install piper-tts

# Add pipx to PATH
pipx ensurepath

# Restart terminal or reload config
source ~/.bashrc  # or ~/.zshrc for zsh
```

#### On macOS:

```bash
# The installer will download precompiled binaries
.claude/hooks/piper-installer.sh
```

### Step 2: Download Voice Models

```bash
# Run the voice downloader
.claude/hooks/piper-download-voices.sh

# Or download recommended voices automatically
.claude/hooks/piper-download-voices.sh --yes
```

Recommended starter voices:
- `en_US-lessac-medium` - Clear, neutral American English
- `en_US-ryan-high` - Natural-sounding American English (higher quality)
- `en_GB-alan-medium` - British English

### Step 3: Test It Out

```bash
# Test TTS directly
.claude/hooks/play-tts.sh "Hello! This is AgentVibes speaking."

# Test with voice preview
/agent-vibes:preview
```

## Configuration

### Change Voice

List available voices:
```bash
/agent-vibes:list
```

Switch voice:
```bash
/agent-vibes:personality [voice-name]
```

### Adjust Verbosity

AgentVibes has three verbosity levels:

1. **LOW** - Only acknowledgment and completion
2. **MEDIUM** (default) - Add major decisions and key findings
3. **HIGH** - Speak frequently during work

The verbosity is configured in your startup hook at `.claude/hooks/startup.sh`.

### Mute/Unmute

```bash
# Mute globally
touch ~/.agentvibes-muted

# Unmute globally
rm ~/.agentvibes-muted

# Mute this project only
touch .claude/agentvibes-muted

# Unmute this project
touch .claude/agentvibes-unmuted
```

## Troubleshooting

### "Piper TTS not installed" Error

**Cause:** `piper` command not found in PATH

**Fix:**
```bash
# Verify pipx installation
which pipx

# If not found, reinstall pipx
sudo apt-get install -y pipx

# Install piper
pipx install piper-tts
pipx ensurepath

# Restart terminal
```

### "Voice model not found" Error

**Cause:** Voice files haven't been downloaded

**Fix:**
```bash
# Download recommended voices
.claude/hooks/piper-download-voices.sh --yes

# Or download specific voice manually
curl -L "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/lessac/medium/en_US-lessac-medium.onnx" \
  -o ~/.claude/piper-voices/en_US-lessac-medium.onnx

curl -L "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/lessac/medium/en_US-lessac-medium.onnx.json" \
  -o ~/.claude/piper-voices/en_US-lessac-medium.onnx.json
```

### No Audio Output on WSL

**Cause:** WSL audio subsystem not configured

**Fix:**
```bash
# Install PulseAudio
sudo apt-get install -y pulseaudio

# Or install mpv/aplay as fallback
sudo apt-get install -y mpv alsa-utils
```

### Audio Cuts Off First Word

**Cause:** WSL audio subsystem latency

**Fix:** AgentVibes automatically adds 200ms padding with ffmpeg:
```bash
# Install ffmpeg
sudo apt-get install -y ffmpeg
```

## Advanced Features

### Multi-Language Support

AgentVibes supports translation and language learning modes:

```bash
# Enable translation to Spanish
/agent-vibes:translate es

# Enable learning mode (speaks in both languages)
/agent-vibes:learn es
```

### Background Music

Add ambient background music to TTS:

```bash
# Enable background music
/agent-vibes:background on

# Configure music file
# Place audio file in .claude/audio/background/
```

### Speech Rate Control

```bash
# Create config file
echo "1.5" > ~/.claude/config/tts-speech-rate.txt

# Values:
# 0.5 = slower
# 1.0 = normal (default)
# 2.0 = faster
```

## Voice Storage

Voices are stored in:
- Default: `~/.claude/piper-voices/`
- Custom: Set path in `~/.claude/piper-voices-dir.txt`

Each voice consists of two files:
- `.onnx` - Neural network model
- `.onnx.json` - Model metadata

## Performance Tips

### For Remote Sessions (SSH/RDP)

AgentVibes auto-detects remote sessions and compresses audio:
- Reduces to mono 22kHz
- 64kbps bitrate
- Prevents choppy playback

### For Low-End Systems

Use smaller voice models:
- `*-low` models (~5MB) - Fast but robotic
- `*-medium` models (~25MB) - Balanced (recommended)
- `*-high` models (~80MB) - Best quality but slower

## Uninstall

```bash
# Remove Piper TTS
pipx uninstall piper-tts

# Remove voice files
rm -rf ~/.claude/piper-voices/

# Remove config
rm -rf ~/.claude/config/
```

## Resources

- AgentVibes Website: https://agentvibes.org
- GitHub Repo: https://github.com/paulpreibisch/AgentVibes
- Piper Voices: https://huggingface.co/rhasspy/piper-voices
- Voice Samples: https://rhasspy.github.io/piper-samples/

## Quick Reference Card

```bash
# Installation
pipx install piper-tts && .claude/hooks/piper-download-voices.sh --yes

# Test
.claude/hooks/play-tts.sh "Hello world"

# Configure
/agent-vibes:list                    # List voices
/agent-vibes:personality [voice]     # Change voice
/agent-vibes:preview                 # Test current voice

# Control
touch ~/.agentvibes-muted            # Mute
rm ~/.agentvibes-muted               # Unmute

# Troubleshoot
which piper                          # Check installation
ls ~/.claude/piper-voices/           # Check voices
```

---

**Status:** If you can hear Claude speaking, you're all set!
