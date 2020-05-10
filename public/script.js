const insertTweet = document.querySelector("#tweets");
const selection = document.querySelector("#selection");
const replyField = document.querySelector('#reply-text');
const iconLoader = document.querySelector('#iconLoader');
const chatBottomLeft = document.querySelector('.chat-bottom-left');
const panelImage = document.querySelector('.panel-img');
const planeIcon = document.querySelector('#icon-loader');

//chat loaderSelection
const leftProfile = document.querySelector('.chat-top-1');
const rightProfile = document.querySelector('.profile-container');
const chat = document.querySelector('.chat-data');

let url;
if(location.protocol === 'https:'){
  url = 'https://localhost:3000/';

} else {
  url = 'http://localhost:3000/';
}

let socketInsetTweet = (data) => {
    console.log(data);
    var date = data.created_at.split(" ");
    date = date[0] + " " + date[1] + " " + date[2] + " " + date[3];
    const tweet = `<div id=${data.id_str} class="card mb-3" style="max-width: 450px; max-height: 450px; " onclick="clicked(this.id)">
    <div class="row no-gutters">
      <div class="col-md-4">
        <img style="padding: 20px;" src=${data.user.profile_image_url} class="card-img" alt="...">
      </div>
      <div class="col-md-8">
        <div class="card-body">
          <h5 class="card-title">${data.user.name}</h5>
          <p class="card-text">${data.text}</p>
          <p class="card-text"><small>${date}</small></p>
        </div>
      </div>
    </div>
  </div>`
  insertTweet.insertAdjacentHTML('afterbegin', tweet);
}

let socket = io();
socket.on("connect", () => {
  console.log("connected");
})
socket.on('newTweet', (data) => {
  console.log("newtweet got");
  console.log(data);
  socketInsetTweet(data);
});

let selectedTweet = {} ;

let iconLoaded = () => {
  planeIcon.classList.remove("fa-paper-plane");
  planeIcon.classList.add("fa-spinner");
}

let iconLoaded1 = () => {
  planeIcon.classList.remove("fa-spinner");
  planeIcon.classList.add("fa-paper-plane");
}

let insertReply = (data) => {
  console.log(data);
  let time = data.created_at.split(" ");
  time = time[3];
  const text3 = `<table style="width: 90%; margin-bottom: 20px;">
    <tr>
      <td style="width: 60px;">
        <img style="width: 25px; height: 25px; float: right;" src=${data.user.profile_image_url} class="card-img">
      </td>
      <td style="padding-left: 20px; font-weight: 500;">
      ${data.user.name}
      </td>
      <td style="float: right; font-weight: 100;">
        ${time}
      </td>
    </tr>
    <tr>
      <tr>
        <td>
        </td>
        <td colspan="2" style="padding-left: 20px; font-weight: 500;">
          ${data.text}
        </td>
      </tr>
    </tr>
    <tr>
      <td>
      </td>
    </tr>
  </table>`;
  chat.insertAdjacentHTML("beforeend",text3);
}

let test = async () => {
  if(!selectedTweet.data || replyField.value == '') {
    return ;
  }
  iconLoaded();
  console.log(replyField.value,selectedTweet.data.id,selectedTweet.data.user.screen_name);
  let data = {
    data: replyField.value,
    id: selectedTweet.data.id_str,
    name: selectedTweet.data.user.screen_name
  }
  replyField.value = '';
  const result = await fetch(url+'reply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  const resJSON = await result.json();
  console.log(resJSON);
  insertReply(resJSON);
  iconLoaded1();
}

let loaderSelection = () => {
  const text = `<div class="spinner-border" role="status" style="margin-top: 20px;">
                  <span class="sr-only">Loading...</span>
                </div>
                `;
  leftProfile.insertAdjacentHTML('beforeend', text);
  rightProfile.insertAdjacentHTML('beforeend', text);
}

let insertSelection = (data) => {
  console.log(data);
  let time = data.created_at.split(" ");
  time = time[3];
  const text1 = `<table style="width:90%; margin-top: 10px;">
    <tr class = "chat-loader-profile">
      <td style="text-align: right; font-weight: 100;"><img style="width: 40px; height: 40px;" src=${data.user.profile_image_url} class="card-img"></td>
      <td style="text-align: center; font-weight: 500;">${data.user.name}</td>
      <td><span class="dot"></span></td>
    </tr>
  </table>`;
  const text2 = `<img class="profile-image" src="${data.user.profile_image_url}" alt="Smiley face">
  <p class="profile-name">
    ${data.user.name}
  </p>
  <p class="profile-status">
    Online
  </p>
  <button class="button"><i class="fa fa-phone" aria-hidden="true"></i>Call</button>
  <button class="button"><i class="fa fa-envelope" aria-hidden="true"></i>Email</button>`;

  const text3 = `<table style="width: 90%; margin-bottom: 20px;">
    <tr>
      <td style="width: 60px;">
        <img style="width: 25px; height: 25px; float: right;" src=${data.user.profile_image_url} class="card-img">
      </td>
      <td style="padding-left: 20px; font-weight: 500;">
      ${data.user.name}
      </td>
      <td style="float: right; font-weight: 100;">
        ${time}
      </td>
    </tr>
    <tr>
      <tr>
        <td>
        </td>
        <td colspan="2" style="padding-left: 20px; font-weight: 500;">
          ${data.text}
        </td>
      </tr>
    </tr>
    <tr>
      <td>
      </td>
    </tr>
  </table>`;
  chat.innerHTML = '';
  leftProfile.innerHTML = '';
  rightProfile.innerHTML = '';
  chat.insertAdjacentHTML("beforeend",text3);
  rightProfile.insertAdjacentHTML("beforeend",text2);
  leftProfile.insertAdjacentHTML("beforeend",text1);

}

let clearLoader2 = () => {
  chat.innerHTML = '';
  leftProfile.innerHTML = '';
  rightProfile.innerHTML = '';
}

let loadTweet = async (id) => {
  clearLoader2();
  loaderSelection();
  let data = {
    id: id
  }
  const result = await fetch(`${url}tweet?id=${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  const resJSON = await result.json();
  selectedTweet = resJSON;
  // console.log(resJSON);
  insertSelection(resJSON.data);
}

let clicked = (id) => {
  console.log(id);
  loadTweet(id);
}

let loader = () => {
  const text = `<div style="text-align: center; padding: 30px;">
    <div class="spinner-border" style="width: 10rem; height: 10rem;" role="status">
      <span class="sr-only">Loading...</span>
    </div>
  </div>`;
  insertTweet.insertAdjacentHTML('beforeend', text);
}

let clearLoader = () => {
  insertTweet.innerHTML = '';
}

const renderList = (items) => {
  items.forEach(ele => {
        var date = ele.created_at.split(" ");
        date = date[0] + " " + date[1] + " " + date[2] + " " + date[3];
        const text = `<div id=${ele.id_str} class="card mb-3" style="max-width: 450px; max-height: 450px; " onclick="clicked(this.id)" >
	      <div class="row no-gutters">
	        <div class="col-md-4">
	          <img style="padding: 20px;" src="${ele.user.profile_image_url}" class="card-img" alt="...">
	        </div>
	        <div class="col-md-8">
	          <div class="card-body">
	            <h5 class="card-title">${ele.user.name}</h5>
	            <p class="card-text">${ele.text}</p>
	            <p class="card-text"><small>${date}</small></p>
	          </div>
	        </div>
	      </div>
      </div>`
      insertTweet.insertAdjacentHTML('beforeend', text);
  })
}

let updateProfiles = (data) => {
  // console.log("profile",data);
  const text = `<img style="width: 25px; height: 25px; float: right;" src="${data.photos[0].value}" class="card-img">`;
  const text1 = `<img style="width: 30px; height: 30px; border-radius:50%;" src=${data.photos[0].value} alt="..." />`
  panelImage.innerHTML = '';
  panelImage.insertAdjacentHTML('beforeend',text1);
  chatBottomLeft.innerHTML = '';
  chatBottomLeft.insertAdjacentHTML('beforeend', text);
}

let load = async () => {
  loader();
  let result = await fetch(url+'tweets');
  let res = await result.json();
  if(res.statuses.length > 0)
  {
    console.log(res);
    console.log(res.statuses);
    if(res) {
      socket.emit("recievedUser", {
        user: res.statuses[0].in_reply_to_screen_name
      })
    }
  }
  let profile = await fetch(url + "getuser");
  let resprofile = await profile.json();
  updateProfiles(resprofile);
  clearLoader();
  renderList(res.statuses);
}

load();
