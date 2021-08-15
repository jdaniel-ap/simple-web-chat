const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const onlineUsers = [];

const server = require('http').createServer(app);

const io = require('socket.io')(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const db = require('./models/webchat');

const utils = require('./utils');

app.set('view engine', 'ejs');
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'views')));

app.get('/', async (_request, res) => {
  const chatData = await db.getHistory();
  res.render('index', { chatData });
});

async function saveMessages(data) {
  const { chatMessage, nickname, timestamp } = data;
  await db.saveMessages({ message: chatMessage, nickname, timestamps: timestamp });
}

function sendMessage(socket) {
  socket.on('message', async (data) => {
    const { nickname, chatMessage } = data;
    const timestamp = utils.formatDate();
    await saveMessages({ ...data, timestamp });
    io.emit('message', `${timestamp} - ${nickname}: ${chatMessage}`);
   });
}

function saveUser(socket) {
  socket.on('save', (d) => {
    onlineUsers.splice(onlineUsers.length, 0, { nickname: d, id: socket.id });
    io.emit('onlineUsers', onlineUsers);
  });
}

function updateUser(socket) {
  socket.on('updateUser', (u) => {
    const index = onlineUsers.findIndex((user) => user.id === socket.id);
    onlineUsers[index].nickname = u;
    io.emit('onlineUsers', onlineUsers);
  });
}

function disconnectUser(socket) {
  socket.on('disconnect', () => {
    const index = onlineUsers.findIndex((user) => user.id === socket.id);
    onlineUsers.splice(index, 1);
    io.emit('onlineUsers', onlineUsers);
  });
}

io.on('connection', (socket) => {
  sendMessage(socket);
  saveUser(socket);
  updateUser(socket);
  disconnectUser(socket);
});

server.listen(3000, () => console.log('Socket running on port', 3000));
