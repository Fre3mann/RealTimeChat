const nameContainer = document.getElementById('name-container');
const nameInput = document.getElementById('name-input');
const enterButton = document.getElementById('enter-button');
const chatContainer = document.getElementById('chat-container');
const messageContainer = document.getElementById('message-container');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const activeUsersList = document.getElementById('active-users-list');

// Hide the chat container initially
chatContainer.style.display = 'none';

// Function to show chat and hide name input
function showChat() {
    chatContainer.style.display = 'block';
    nameContainer.style.display = 'none';
}

// Function to initialize WebSocket connection
function initWebSocket(name) {
    const socket = new WebSocket('ws://localhost:3000');

    // Handle incoming messages
    socket.addEventListener('message', function (event) {
        const message = event.data;
        appendMessage(message);
    });

    // Function to append a new message to the message container
    function appendMessage(message) {
        const messageElement = document.createElement('p');
        
        // Check if the message is a Blob
        if (message instanceof Blob) {
            // Read the Blob as text
            const reader = new FileReader();
            reader.onload = function() {
                messageElement.innerText = reader.result;
                messageContainer.appendChild(messageElement);
                messageContainer.scrollTop = messageContainer.scrollHeight;
            };
            reader.readAsText(message);
        } else {
            // If it's not a Blob, assume it's a string
            messageElement.innerText = message;
            messageContainer.appendChild(messageElement);
            messageContainer.scrollTop = messageContainer.scrollHeight;
        }
    }

    // Function to send message
    function sendMessage() {
        const message = messageInput.value;
        if (message.trim() !== '') {
            // Check if the WebSocket connection is open
            if (socket.readyState === WebSocket.OPEN) {
                // Send the message
                socket.send(name + ': ' + message);
                messageInput.value = '';
                appendMessage("You: " + message);
            } else {
                console.error('WebSocket connection is not open.');
                // You can handle this scenario appropriately, such as displaying an error message to the user
            }
        }
    }

    // Send message when the send button is clicked or "Enter" is pressed
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });
}

// Function to join the chat
function joinChat() {
    const name = nameInput.value.trim();
    if (name !== '') {
        showChat();
        initWebSocket(name);
    } else {
        alert('Please enter your name.');
    }
}

// Add event listener for "Enter" key on name input
nameInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        joinChat();
    }
});

// Add event listener to the enter button
enterButton.addEventListener('click', joinChat);

// Function to update active users list
function updateActiveUsersList(users) {
    // Clear existing user list
    activeUsersList.innerHTML = '';
    // Add each user to the list
    users.forEach(user => {
        const userItem = document.createElement('li');
        userItem.textContent = user;
        activeUsersList.appendChild(userItem);
    });
}

// Function to handle user disconnections
function handleUserDisconnect(username) {
    // Find and remove the disconnected user from the list
    const userItems = activeUsersList.querySelectorAll('li');
    userItems.forEach(userItem => {
        if (userItem.textContent === username) {
            userItem.remove();
        }
    });
}

// WebSocket event listener for receiving active users list
socket.addEventListener('users', function (event) {
    const users = JSON.parse(event.data);
    updateActiveUsersList(users);
});

// WebSocket event listener for user disconnection
socket.addEventListener('disconnect', function (event) {
    const username = event.data;
    handleUserDisconnect(username);
});
