import bot from './assets/bot.svg';
import user from "./assets/user.svg";
import { useCompletion } from "ai/react";
import React from 'react';
import ReactDOM from 'react-dom';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container')

var dropzone = document.getElementById('dropzone');
var dropzone_input = dropzone.querySelector('.dropzone-input');

import fs from 'fs'
import axios from 'axios';
import FormData from 'form-data';


dropzone_input.addEventListener('change', async function(e) {
  var files = e.target.files; // Get the selected files

    var file = files[0];
    // You can also perform other operations with the file here

      // When a file is dropped in the dropzone, call the `/api/addData` API to train our bot on a new PDF File
    
        if (file.type !== "application/pdf") {
          alert("Please upload a PDF");
          return;
        }
        var formData = new FormData();
        formData.append("file", file);
        console.log(file);
        // for(var pair of formData.entries()) {
        //   console.log(pair[0]+', '+pair[1]);
        // }

        const resp = fetch('https://codegpt-3w0l.onrender.com/addData', {
          method: 'POST',
          body: formData,
          
          });

    if (resp.status === 200) {
      return 'Upload complete';
    } 
    //     const response = await fetch('http://localhost:5000/addData', {
    //       method: 'POST',
    //       headers: {
    //         'Content-Type': 'application/json'
    //       },
    //       body: formData
    // })
    
        // const body = await response.json();
    
        // if (body.success) {
        //   alert("Data added successfully");
        // }
    
  
        
    // If you have a specific property you want to access, you can do so using file.propertyName

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

// async function useCompletion({
//   api,
//   id,
//   initialCompletion,
//   initialInput,
//   credentials,
//   headers,
//   body,
//   onResponse,
//   onFinish,
//   onError,
// }) {
//   try {
//     const requestConfig = {
//       method: 'POST', // Set your HTTP method (e.g., GET, POST, etc.)
//       headers: {
//         'Content-Type': 'application/json', // Set your desired content type
//         ...headers, // Add custom headers if provided
//       },
//       body: JSON.stringify(body), // Convert the request body to JSON
//     };

//     // If you need to include credentials (e.g., for authentication)
//     if (credentials) {
//       requestConfig.headers['Authorization'] = `Basic ${btoa(
//         `${credentials.username}:${credentials.password}`
//       )}`;
//     }

//     // Make the API request using the fetch API
//     const response = await fetch(`${api}/your-endpoint`, requestConfig);

//     // Handle the response or call the onResponse callback
//     if (onResponse) {
//       onResponse(response);
//     }

//     // Parse the response JSON
//     const data = await response.json();

//     // You can do more processing here if needed

//     // Call the onFinish callback if provided
//     if (onFinish) {
//       onFinish();
//     }

//     return data;
//   } catch (error) {
//     // Handle errors or call the onError callback
//     if (onError) {
//       onError(error);
//     }

//     // You can handle errors or throw them if needed

//     throw error;
//   }
// }
