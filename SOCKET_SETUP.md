# Socket.io Setup Instructions

## Important: Server Setup

You MUST use the custom server for Socket.io to work!

### To Start the Server:

1. **Stop any running Next.js server** (Ctrl+C)

2. **Start with the custom server:**
   ```bash
   npm run dev
   ```

   This will run `node server.js` which includes Socket.io.

3. **DO NOT use:**
   ```bash
   next dev
   ```
   This will NOT work with Socket.io!

### Verify Server is Running:

When you start the server, you should see:
```
> Ready on http://localhost:3000
> Socket.io server initialized
```

If you see this, Socket.io is working!

### Check Connection:

1. Open browser console (F12)
2. Look for: `✅ Socket.io CONNECTED`
3. If you see `❌ Socket.io CONNECTION ERROR: timeout`, the server is not running with Socket.io

### Troubleshooting:

- **Timeout errors**: Make sure you're using `npm run dev` (not `next dev`)
- **Connection refused**: Make sure the server is running on port 3000
- **CORS errors**: Already fixed in server.js

