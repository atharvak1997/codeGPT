import bot from './assets/bot.svg';
import user from "./assets/user.svg";

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container')

var dropzone = document.getElementById('dropzone');
var dropzone_input = dropzone.querySelector('.dropzone-input');


dropzone_input.addEventListener('change', function(e) {
  var files = e.target.files; // Get the selected files

  for (var i = 0; i < files.length; i++) {
    var file = files[i];

    // Access file information
    var fileName = file.name; // File name
    var fileType = file.type; // File type (MIME type)
    var fileSize = file.size; // File size in bytes

    // Log the file information
    console.log('File Name:', fileName);
    console.log('File Type:', fileType);
    console.log('File Size (bytes):', fileSize);

    // You can also perform other operations with the file here

    // If you have a specific property you want to access, you can do so using file.propertyName
  }
});


let loadInterval;

function loader(element) {
  element.textContent = '';

  loadInterval = setInterval(() => {
    element.textContent += '.';

    if (element.textContent === '....') {
      element.textContent = '';
    }
  },300)
}

function typeText(element, text) {
  let index = 0;
  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index += 1;
    }
    else {
      clearInterval(interval);
    }

  }, 20)
}

function generateUniqueID() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`
}

function chatStripe(isAi, value, uniqueID) {
  return (
    `
    <div class = "wrapper ${isAi && 'ai'}">
      <div class = "chat">
        <div class = "profile">
          <img
            src="${isAi ? bot : user}"
            alt="${isAi ? 'bot' : 'user'}"
          />
        </div>
        <div class="message" id=${uniqueID}>${value}</div>
      </div>
    </div>
    `
  )
}

const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  // User's chatStripe
    chatContainer.innerHTML += chatStripe(false, data.get('prompt'));

  form.reset();

  // bot's chatStripe
  const uniqueID = generateUniqueID();
    chatContainer.innerHTML += chatStripe(true, ' ', uniqueID);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    const messageDiv = document.getElementById(uniqueID);
  
    loader(messageDiv);

    // Fetch data from server

    const response = await fetch('https://codegpt-3w0l.onrender.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: data.get('prompt')
      })
    })
    clearInterval(loadInterval);
    messageDiv.innerHTML = '';

    if(response.ok) {
      const data = await response.json();
      const parsedData = data.bot;

      typeText(messageDiv, parsedData)
    }
    else {
      const err = await response.text();

      messageDiv.innerHTML = "Something is wrong";

      alert(err);
    }
  

  
}

  form.addEventListener('submit', handleSubmit);
  form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
})





 