const chatBox = document.getElementById("chat");
const userDisplay = document.getElementById("user-display");
const API_URL = "http://localhost:3000/messages";

const sendSound = new Audio("sounds/send.mp3");
const alertSound = new Audio("sounds/alert.mp3");

// Gera uma cor única por usuário
function hashColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 70%)`;
}

// Formata a mensagem com cor e horário
function formatMessage(msg) {
  const color = hashColor(msg.user);
  const isCurrentUser = msg.user === localStorage.getItem("user");
  return `<div style="${isCurrentUser ? 'font-weight:bold' : ''}"><span style="color:${color}">[${msg.time}] ${msg.user}:</span> ${msg.text}</div>`;
}

// Carrega mensagens do servidor
function loadMessages() {
  fetch(API_URL)
    .then(res => res.json())
    .then(messages => {
      chatBox.innerHTML = messages.map(formatMessage).join("");
      chatBox.scrollTop = chatBox.scrollHeight;
      alertSound.play();
    })
    .catch(() => {
      chatBox.innerHTML += `<div style="color:red">[Erro] Falha ao carregar mensagens.</div>`;
    });
}

// Envia nova mensagem
function sendMessage() {
  const user = localStorage.getItem("user");
  const textInput = document.getElementById("text");
  const text = textInput.value.trim();
  const sendBtn = document.getElementById("send-btn");

  if (!text) return;

  // Easter Egg
  if (text === "/rickroll") {
    alert("🎵 Never gonna give you up...");
    textInput.value = "";
    return;
  }

  if (text === "/limpar") {
    chatBox.innerHTML = "";
    textInput.value = "";
    return;
  }

  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  sendBtn.disabled = true;

  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user, text, time })
  })
    .then(() => {
      const div = document.createElement("div");
      const color = hashColor(user);
      div.innerHTML = `<span style="color:${color}">[${time}] ${user}:</span> ${text}`;
      chatBox.appendChild(div);
      chatBox.scrollTop = chatBox.scrollHeight;
      textInput.value = "";
      sendSound.play();
    })
    .catch(() => {
      chatBox.innerHTML += `<div style="color:red">[Erro] Falha ao enviar mensagem.</div>`;
    })
    .finally(() => {
      sendBtn.disabled = false;
    });
}

// Entrar no chat
function enterChat() {
  const username = document.getElementById("login-user").value.trim();

  if (!/^[\w\d]{3,}$/i.test(username)) {
    alert("Digite um nome de usuário válido (mínimo 3 caracteres, letras ou números).");
    return;
  }

  localStorage.setItem("user", username);
  document.getElementById("login-screen").classList.remove("active");
  document.getElementById("chat-screen").classList.add("active");
  userDisplay.textContent = username;
  chatBox.innerHTML += `<div style="color:gray">⚡ ${username} entrou no chat</div>`;
  loadMessages();
}

// Muda o nome do usuário
function changeUser() {
  const newUser = prompt("Digite seu novo nome de usuário:");
  if (newUser && /^[\w\d]{3,}$/i.test(newUser)) {
    localStorage.setItem("user", newUser.trim());
    userDisplay.textContent = newUser.trim();
    loadMessages();
  }
}

// Faz logout do chat
function logout() {
  localStorage.removeItem("user");
  location.reload();
}

// Carrega mensagens automaticamente
window.addEventListener("DOMContentLoaded", () => {
  const savedUser = localStorage.getItem("user");
  if (savedUser) {
    document.getElementById("login-screen").classList.remove("active");
    document.getElementById("chat-screen").classList.add("active");
    userDisplay.textContent = savedUser;
    loadMessages();
  }
});
