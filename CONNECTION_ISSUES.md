# Connection Issues - Troubleshooting Guide

## Issue: "Disconnected from server" Error

### ✅ FIXED - Enhanced Error Handling Implemented

---

## What Was Changed

### Client-Side Improvements ([public/app.js](public/app.js))

**Added:**
- ✅ **Automatic reconnection** - Socket.IO will try to reconnect automatically
- ✅ **Better error messages** - Shows specific reason for disconnection
- ✅ **Reconnection notifications** - Informs user when reconnecting
- ✅ **Connection error handling** - Detects when server is down

**New Events Handled:**
```javascript
socket.on('disconnect', (reason))     // Handles disconnection
socket.on('connect')                  // Handles reconnection
socket.on('connect_error')            // Connection failed
socket.on('reconnect')                // Successfully reconnected
socket.on('reconnect_failed')         // Reconnection failed
```

### Server-Side Improvements ([server/index.js](server/index.js))

**Added:**
- ✅ **Global error handlers** - Catches unhandled errors
- ✅ **Graceful shutdown** - Proper cleanup on exit
- ✅ **Error logging** - Better debugging information
- ✅ **Crash prevention** - Server stays running even with errors

**New Error Handlers:**
```javascript
process.on('uncaughtException')       // Catches all errors
process.on('unhandledRejection')      // Catches promise errors
process.on('SIGTERM')                 // Graceful shutdown
process.on('SIGINT')                  // Ctrl+C handling
```

---

## Common Scenarios

### Scenario 1: Server Crashed
**Symptom:** "Disconnected from server" message

**What happens now:**
1. Client shows: "Connection lost. Attempting to reconnect..."
2. Socket.IO tries to reconnect automatically
3. If server is back up, you'll see: "Reconnected successfully!"
4. If server is still down, you'll see connection errors in console

**Solution:**
```bash
# Restart the server
node server/index.js
```

### Scenario 2: Network Issue
**Symptom:** Temporary connection loss

**What happens now:**
1. Client automatically tries to reconnect
2. No need to refresh the page
3. When connection is restored, game continues

**Solution:** Wait for automatic reconnection (usually < 5 seconds)

### Scenario 3: Server Forcefully Disconnected You
**Symptom:** "Server disconnected you. Please refresh and login again."

**What happens now:**
1. Client redirects to login screen after 3 seconds
2. You need to log in again

**Causes:**
- Server was restarted
- You were kicked by server logic
- Server detected an issue with your session

**Solution:** Refresh page and login again

### Scenario 4: Server Not Running
**Symptom:** "Cannot connect to server. Is it running?"

**What happens now:**
1. Client shows connection error
2. Keeps trying to reconnect

**Solution:**
```bash
# Start the server
node server/index.js
```

---

## How to Keep Server Running

### Option 1: Use `npm start` (Recommended)
```bash
npm start
```
This keeps server running in your terminal.

### Option 2: Use Process Manager (Production)
```bash
# Install PM2
npm install -g pm2

# Start server with PM2
pm2 start server/index.js --name card-game

# View logs
pm2 logs card-game

# Stop server
pm2 stop card-game

# Restart server
pm2 restart card-game
```

### Option 3: Use `nohup` (Linux/Mac)
```bash
nohup node server/index.js > server.log 2>&1 &
```

### Option 4: Windows Service (Windows)
Use tools like `node-windows` to run as a service.

---

## Monitoring Server Status

### Check if Server is Running:
```bash
# Windows
netstat -ano | findstr :3000

# Mac/Linux
lsof -i :3000
```

### View Server Logs:
Server logs are output to the console where you started it.

For background processes, check the output file.

---

## Browser Console Messages

### Normal Connection:
```
Connected to server
```

### Disconnection:
```
Disconnected from server. Reason: transport close
Connection lost. Attempting to reconnect...
```

### Reconnection:
```
Reconnected after 1 attempts
Reconnected successfully!
```

### Server Down:
```
Connection error: Error: xhr poll error
Cannot connect to server. Is it running?
```

---

## Testing the Fix

### Test Automatic Reconnection:
1. Start server: `node server/index.js`
2. Login and enter lobby
3. **Stop server** (Ctrl+C)
4. You'll see: "Connection lost. Attempting to reconnect..."
5. **Restart server**: `node server/index.js`
6. You'll see: "Reconnected successfully!"

### Test Connection Error:
1. Make sure server is **not running**
2. Open browser to http://localhost:3000
3. Open console (F12)
4. You'll see connection errors
5. Start server
6. Connection will establish automatically

---

## Prevention Tips

### 1. Keep Server Terminal Open
Don't close the terminal running the server.

### 2. Use Screen/Tmux (Linux/Mac)
```bash
# Start screen session
screen -S card-game

# Run server
node server/index.js

# Detach: Ctrl+A, then D
# Reattach: screen -r card-game
```

### 3. Add Server Monitoring
Use PM2 or similar tools for automatic restart on crash.

### 4. Check Server Logs Regularly
Watch for errors in the server console.

---

## Error Messages Explained

| Message | Meaning | Action |
|---------|---------|--------|
| "Connection lost. Attempting to reconnect..." | Network issue or server stopped | Wait for reconnection |
| "Reconnected successfully!" | Connection restored | Continue playing |
| "Cannot connect to server. Is it running?" | Server is down | Start the server |
| "Failed to reconnect. Please refresh the page." | Multiple reconnection attempts failed | Refresh browser |
| "Server disconnected you." | Server kicked you | Login again |

---

## Server Now More Stable

### Improvements:
✅ Catches and logs all errors instead of crashing
✅ Continues running even with unhandled exceptions
✅ Graceful shutdown on Ctrl+C
✅ Better error logging for debugging
✅ Won't crash from single-user errors

### Client Now More Resilient:
✅ Automatic reconnection attempts
✅ Clear status messages
✅ No data loss on temporary disconnections
✅ Smooth reconnection experience

---

## Still Having Issues?

### Check These:
1. ✅ Server is running: `curl http://localhost:3000`
2. ✅ Port 3000 is available (not used by another app)
3. ✅ No firewall blocking connections
4. ✅ Browser console shows actual error messages

### Provide for Debugging:
1. Server console output
2. Browser console output (F12)
3. Steps to reproduce the issue
4. When the disconnection happens (login, game start, during play, etc.)

---

## Summary

The **"Disconnected from server"** issue is now handled gracefully with:

1. **Auto-reconnection** - Client tries to reconnect automatically
2. **Error prevention** - Server catches errors instead of crashing
3. **Clear messaging** - Users know what's happening
4. **Robust recovery** - Smooth reconnection when server is back

**Just keep the server running and you should have no issues!** 🎮✨
