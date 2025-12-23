# ⚠️ IMPORTANT: Restart Server for Socket.io

## The Problem
Socket.io is timing out because the server is NOT running with the custom `server.js` file.

## Solution: Restart Server Properly

### Step 1: Stop Current Server
1. Go to the terminal where your server is running
2. Press `Ctrl + C` to stop it
3. Wait for it to fully stop

### Step 2: Start with Custom Server
Run this command:
```bash
npm run dev
```

**DO NOT use:**
- `next dev` ❌
- `next dev --turbopack` ❌

### Step 3: Verify Server Started
You should see these messages in the terminal:
```
> Ready on http://localhost:3000
> Socket.io server initialized
> Socket.io path: /socket.io/
```

If you see "Socket.io server initialized", Socket.io is working!

### Step 4: Check Browser Console
After refreshing the page, you should see:
```
✅ Socket.io CONNECTED - Socket ID: [some-id]
```

If you still see timeout errors, the server is not using server.js!

## Troubleshooting

### Still Getting Timeout?
1. **Check terminal output** - Do you see "Socket.io server initialized"?
   - YES → Socket.io is running, check browser console
   - NO → Server is not using server.js, restart with `npm run dev`

2. **Kill all Node processes** (if needed):
   ```bash
   taskkill /F /IM node.exe
   ```
   Then restart with `npm run dev`

3. **Check port 3000**:
   ```bash
   netstat -ano | findstr :3000
   ```
   Make sure only one process is using port 3000

