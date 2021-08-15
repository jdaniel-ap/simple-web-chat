const inputChat = document.querySelector('#message');
const nicknameInput = document.querySelector('#name');
const nickBtn = document.querySelector('#send-nick');
const sendBtn = document.querySelector('#send-btn');
const socket = window.io('http://localhost:3000');
const usersBox = document.querySelector('#users');
const chatBox = document.querySelector('#chatbox');
const testid = 'data-testid';

function randomStringGenerator(size) {
  let randomString = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < size; i += 1) {
    randomString += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return String(randomString);
}

function createUserElement(nickname, position) {
  const li = document.createElement('li');
  const liContent = document.createTextNode(`${nickname}`);
  li.setAttribute('data-testid', 'online-user');
  li.appendChild(liContent);
  if (position === 'firstChild') return usersBox.prepend(li);
  usersBox.appendChild(li);
}

const user = randomStringGenerator(16);
let userb = user;

sendBtn.addEventListener('click', (e) => {
  const data = {
    chatMessage: inputChat.value,
    nickname: userb,
  };

  socket.emit('message', data);
  e.preventDefault();
  inputChat.value = '';
});

window.onload = () => {
  const li = document.createElement('li');
  const liContent = document.createTextNode(`${user}`);
  li.setAttribute(testid, testid);
  li.appendChild(liContent);
  li.classList.add(`${user}`);
  usersBox.appendChild(li);

  socket.emit('save', user);
};

socket.on('message', (data) => {
  const span = document.createElement('span');
  const spanContent = document.createTextNode(`${data}`);
  span.setAttribute(testid, 'message');
  span.appendChild(spanContent);
  chatBox.appendChild(span);
});

socket.on('onlineUsers', (data) => {
    const currentUser = data.findIndex((element) => element.id === socket.id);
    usersBox.innerHTML = '';
    data.forEach((element, index) => {
      if (currentUser === index) {
        createUserElement(element.nickname, 'firstChild');
        return;
      }
      createUserElement(element.nickname, '');
    });
});

nickBtn.addEventListener('click', () => {
  userb = nicknameInput.value;
  socket.emit('updateUser', userb);
  nicknameInput.value = '';
});
