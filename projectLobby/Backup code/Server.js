const WebSocket = require('ws');

// Define the port to listen on
const PORT = process.env.PORT || 3000;

// Create WebSocket server
const wss = new WebSocket.Server({ port: PORT });

// Define an array to store active users
let activeUsers = [];

// Function to broadcast active users to all clients
function broadcastActiveUsers() {
    const usersMessage = JSON.stringify(activeUsers);
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(usersMessage);
        }
    });
}

// Handle WebSocket connections
wss.on('connection', function connection(ws) {
    console.log('A new client connected');

    // Add new client to active users list
    ws.on('message', function incoming(message) {
        console.log('Received: %s', message);
        // If the received message starts with '#username', extract the username
        if (message.startsWith('#username:')) {
            const username = message.replace('#username:', '').trim();
            ws.username = username;
            if (!activeUsers.includes(username)) {
                activeUsers.push(username);
                broadcastActiveUsers(); // Broadcast the updated list of active users
            }
        } else {
            // Broadcast the received message to all clients except the sender
            wss.clients.forEach(function each(client) {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(message.toString());
                }
            });
        }
    });

    // Remove client from active users list on disconnection
    ws.on('close', function () {
        console.log('Client disconnected');
        const index = activeUsers.indexOf(ws.username);
        if (index !== -1) {
            activeUsers.splice(index, 1);
            broadcastActiveUsers(); // Broadcast the updated list of active users
        }
    });
});

console.log(`WebSocket server is running on port ${PORT}`);
