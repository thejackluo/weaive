# WSL Virtual Adapter IP Causing Mobile Timeout Issue

**Date:** 2025-12-21
**Severity:** 🔴 Critical (blocks all mobile development)
**Affected:** React Native mobile app connecting to Windows backend
**Status:** ✅ Resolved

---

## Symptoms

### Primary Issue
- **Reflection screen times out after exactly 10 seconds** with "Cannot load reflection" error
- Analytics events timeout after 30 seconds
- Mobile device shows `[TypeError: Network request failed]` after request timeout
- **Backend receives ZERO requests** from mobile device (no logs whatsoever)

### What Made This Brutal
- Backend running correctly on `0.0.0.0:8002` ✅
- Windows Firewall disabled ✅
- JWT secret configured ✅
- API URL in .env looks correct (`192.168.x.x` format) ✅
- Backend accessible from Windows browser via `http://192.168.208.1:8002/docs` ✅

**Everything looked correct, but mobile couldn't reach the backend.**

---

## Root Cause

**The .env file was pointing to the WSL virtual adapter IP instead of the physical Wi-Fi IP.**

### Network Topology on Windows with WSL2 Installed

When WSL2 is installed (even if not actively used), Windows creates a **Hyper-V virtual network switch** with its own isolated subnet:

```
Windows PC with WSL2 installed:
├── Physical Wi-Fi Adapter: 192.168.1.194 (connected to home router)
│   └── Subnet: 192.168.1.0/24
│   └── Accessible by: Mobile devices, other computers on Wi-Fi
│
└── WSL Virtual Adapter: 192.168.208.1 (internal Hyper-V switch)
    └── Subnet: 192.168.208.0/20
    └── Accessible by: ONLY Windows host and WSL2 VMs
```

### The Trap

The backend was running **directly on Windows** (PowerShell/CMD), listening on `0.0.0.0:8002`, but the `.env` configuration pointed to the **WSL virtual adapter**:

```env
# ❌ WRONG - This is the WSL virtual network!
API_BASE_URL=http://192.168.208.1:8002
```

**What happens:**
1. Backend binds to `0.0.0.0:8002` - listens on ALL network interfaces
2. Windows browser can reach `192.168.208.1:8002` (same machine)
3. Mobile device tries to reach `192.168.208.1:8002` but **that subnet doesn't exist on the Wi-Fi network**
4. Request times out after 10 seconds - no route to host

### Why This Is Confusing

- `ipconfig` shows **both IPs** as active, valid addresses
- Backend logs show requests from `192.168.208.1:63022` (Windows browser) - **falsely suggests the IP works**
- Mobile device is on `192.168.1.194` subnet, but this mismatch isn't obvious without comparing network configs
- WSL virtual adapter looks like a "normal" network interface

---

## Evidence from Logs

### Backend Logs (Misleading)
```
INFO: 192.168.208.1:63022 - "GET /docs HTTP/1.1" 200 OK
```
✅ Windows browser accessing /docs - **works because browser is on same machine**
❌ **Zero logs from mobile device** (192.168.1.194) - packets never arrive

### Mobile Logs
```
[JOURNAL_API] 🌐 API Base URL: http://192.168.208.1:8002
[JOURNAL_API] 🚀 Sending GET request to /api/journal-entries/today
[JOURNAL_API] ⏱️  Request timeout - aborting after 10s
ERROR [JOURNAL_API] ❌ getTodayJournal error after 10003ms: Error: Request timeout - backend not responding
```

### Expo Redirect URI Log (Key Evidence)
```
exp://192.168.1.194:8082
```
**This shows the mobile device IP is `192.168.1.194` - different subnet than backend target!**

### Network Config (Smoking Gun)
```powershell
ipconfig

Wireless LAN adapter Wi-Fi:
   IPv4 Address. . . . . . . . . . . : 192.168.1.194  ← Mobile CAN reach this
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 192.168.1.1

Ethernet adapter vEthernet (WSL (Hyper-V firewall)):
   IPv4 Address. . . . . . . . . . . : 192.168.208.1  ← Mobile CANNOT reach this
   Subnet Mask . . . . . . . . . . . : 255.255.240.0
```

---

## Solution

### Fix: Update .env to Use Physical Wi-Fi IP

```env
# ✅ CORRECT - Physical Wi-Fi adapter IP
API_BASE_URL=http://192.168.1.194:8002
```

### How to Find the Correct IP

**Windows:**
```powershell
ipconfig
# Look for "Wireless LAN adapter Wi-Fi" or "Ethernet adapter Ethernet"
# IGNORE "vEthernet (WSL)" - that's the virtual adapter
```

**Mac/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

### After Changing .env

**Critical:** Expo must be restarted for .env changes to take effect:
```bash
# Press Ctrl+C in Expo terminal, then:
cd weave-mobile
npm start
```

Metro bundler **does not hot-reload .env files** - you must fully restart.

---

## How to Verify the Fix

### 1. Check Mobile Logs
```
[JOURNAL_API] 🌐 API Base URL: http://192.168.1.194:8002  ← Should match Wi-Fi IP
[JOURNAL_API] ✅ Auth token retrieved in 22ms
[JOURNAL_API] 📡 Response received in 143ms - Status: 200
```

### 2. Check Backend Logs
```
INFO: 192.168.1.xxx:xxxxx - "GET /api/journal-entries/today HTTP/1.1" 200 OK
                      ↑
                Should show mobile device IP now!
```

### 3. Test Reflection Screen
- Should load in < 2 seconds
- No timeout errors
- Journal entries visible

---

## Prevention & Best Practices

### 1. Always Use Physical Network IP for Mobile Dev

**❌ Don't use:**
- `localhost` - Points to device itself on mobile
- WSL virtual adapter IP (`192.168.208.x`, `172.x.x.x`)
- Docker bridge IPs (`172.17.x.x`)

**✅ Use:**
- Physical Wi-Fi adapter (`192.168.1.x`, `192.168.0.x`, `10.0.x.x`)
- Ethernet adapter (if wired connection)

### 2. Document Network Topology in .env.example

```env
# Backend API Configuration
#
# ⚠️  CRITICAL: Use PHYSICAL Wi-Fi IP, NOT WSL/Docker virtual IPs!
#
# Windows users: Run `ipconfig` and use "Wireless LAN adapter Wi-Fi"
# IGNORE "vEthernet (WSL)" or "vEthernet (Default Switch)" - those are virtual
#
# Examples:
# - ✅ Physical Wi-Fi: API_BASE_URL=http://192.168.1.194:8002
# - ❌ WSL virtual:    API_BASE_URL=http://192.168.208.1:8002 (won't work)
# - ❌ Localhost:      API_BASE_URL=http://localhost:8002 (won't work)
#
API_BASE_URL=http://192.168.1.100:8000
```

### 3. Add IP Detection to Startup Script

Consider adding a pre-start validation:
```bash
# scripts/validate-mobile-env.sh
BACKEND_IP=$(grep API_BASE_URL .env | cut -d= -f2 | grep -oE '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+')

if echo "$BACKEND_IP" | grep -q "192.168.208"; then
  echo "⚠️  WARNING: .env uses WSL virtual IP (192.168.208.x)"
  echo "Mobile devices cannot reach this IP!"
  echo "Run 'ipconfig' and update .env with Wi-Fi adapter IP"
  exit 1
fi
```

### 4. Common IP Subnet Patterns

| Subnet Pattern | Type | Mobile Access |
|----------------|------|---------------|
| `192.168.1.x` | Home Wi-Fi | ✅ Yes |
| `192.168.0.x` | Home Wi-Fi | ✅ Yes |
| `10.0.x.x` | Enterprise/Router | ✅ Yes (if on same network) |
| `192.168.208.x` | WSL2 virtual | ❌ No |
| `172.16-31.x.x` | Docker/WSL | ❌ No (usually) |
| `127.0.0.1` | Localhost | ❌ No |

---

## Debugging Checklist for Mobile Connection Issues

When mobile app times out connecting to backend:

1. ✅ **Check .env API_BASE_URL** - Is it pointing to physical Wi-Fi IP?
2. ✅ **Run `ipconfig` / `ifconfig`** - Verify current Wi-Fi IP hasn't changed
3. ✅ **Restart Expo after .env change** - Metro doesn't hot-reload .env
4. ✅ **Check backend is on `0.0.0.0`** - Must listen on all interfaces
5. ✅ **Check mobile and PC are on same Wi-Fi** - Both must be on same router
6. ✅ **Disable Windows Firewall temporarily** - Rule out firewall blocking
7. ✅ **Check backend logs for incoming IP** - Should see mobile device IP
8. ✅ **Compare Expo redirect URI to backend IP** - Subnets must match

### Red Flags

🚩 Backend logs show **only** `192.168.208.x` requests (Windows browser)
🚩 Mobile logs show timeout but **backend shows zero requests**
🚩 Expo redirect URI (`exp://192.168.x.x`) doesn't match .env API URL
🚩 Backend accessible from browser but not from mobile

**All point to wrong network interface / subnet mismatch.**

---

## Time to Resolution

- **Total debugging time:** ~2 hours
- **Key discovery:** Comparing Expo redirect URI subnet to .env API URL
- **Root cause:** WSL2 virtual adapter masquerading as valid network interface

---

## Lesson Learned

**WSL2 creates a hidden network trap:**
- Installs a virtual network adapter with its own subnet
- Shows up in `ipconfig` alongside physical adapters
- Works for Windows browser (same machine), **fails for mobile devices**
- Not obvious unless you compare subnet addresses

**The fix is simple once you know it, but the debugging is brutal because everything else looks correct.**

---

## Related Issues

- [Metro Path Alias Cache Issue](./metro-path-alias-cache-issue-2025-12-18.md) - Another "restart Metro" fix
- [NativeWind Styling Issue](./nativewind-styling-issue-2025-12-17.md) - ThemeProvider gotcha

---

## References

- **Architecture:** `docs/architecture/core-architectural-decisions.md`
- **API Client:** `weave-mobile/src/services/journalApi.ts`
- **Environment Config:** `weave-mobile/.env`, `.env.example`
- **Windows WSL2 Networking:** https://learn.microsoft.com/en-us/windows/wsl/networking
