const insertTweet = document.querySelector("#tweets");
const selection = document.querySelector("#selection");
const replyTweet = document.querySelector('#replyTweet');
const replyField = document.querySelector('#replyText');
const iconLoader = document.querySelector('#iconLoader');
let url;
if(location.protocol === 'https:'){
  url = 'https://localhost:3000/';

} else {
  url = 'http://localhost:3000/';
}

let socketInsetTweet = (data) => {
  const text = `  <div id=${data.id_str} class="card mb-3" style="max-width: 450px; max-height: 450px; background-color: #74C2E1;" onclick="clicked(this.id)" >
    <div class="row no-gutters">
      <div class="col-md-4">
        <img style="padding: 20px;" src=${data.user.profile_image_url} class="card-img" alt="...">
      </div>
      <div class="col-md-8">
        <div class="card-body">
          <h5 class="card-title">${data.user.name}</h5>
          <p class="card-text">${data.text}</p>
          <p class="card-text"><small>${data.created_at}</small></p>
        </div>
      </div>
    </div>
    </div>`;
    insertTweet.insertAdjacentHTML('afterbegin', text);
}

let socket = io();
socket.on('newTweet', (data) => {
  console.log(data);
  socketInsetTweet(data);
});

let selectedTweet = {} ;

let iconLoaderFun = () => {
  const text = `<div class="spinner-grow text-primary" role="status">
                  <span class="sr-only">Loading...</span>
                </div>`;
  iconLoader.innerHTML = '';
  iconLoader.insertAdjacentHTML("beforeend",text);
}

let iconLoaded = () => {
  const text = `<i class="fa fa-paper-plane" aria-hidden="true"></i>`;
  iconLoader.innerHTML = '';
  iconLoader.insertAdjacentHTML("beforeend",text);
}

let insertSelection = (data) => {
  selectedTweet = data;
  let date = data.data.created_at.split(" ");
  date = date[3];
  const text1 = `<div class="row comment-box p-1 pt-3 pr-4">
        <div class="col-lg-2 col-3 user-img text-center">
          <img src=${data.data.user.profile_image_url} class="main-cmt-img">
        </div>
        <div class="col-lg-10 col-9 user-comment bg-light rounded pb-1">
             <div class="row">
                   <div class="col-lg-8 col-6 border-bottom pr-0">
                      <p class="w-100 p-2 m-0">${data.data.text}</p>
                   </div>
                   <div class="col-lg-4 col-6 border-bottom">
                      <p class="w-100 p-2 m-0"><span class="float-right"><i class="fa fa-clock-o mr-1" aria-hidden="true"></i>${date}</span></p>
                   </div>
             </div>
            <div class="user-comment-desc p-1 pl-2">
                <p class="m-0 mr-2">${data.data.user.screen_name}</p>
            </div>
        </div>
      </div>
      <div class="row">
        <div class="col-lg-11 offset-lg-1">
        </div>
      </div>`;
  replyTweet.insertAdjacentHTML('beforeend',text1);
}


let insertSelectionSub = (data) => {
  // selectedTweet = data;
  let date = data.created_at.split(" ");
  date = date[3];
  const text1 = `<div class="row comment-box p-1 pt-3 pr-4">
        <div class="col-lg-2 col-3 user-img text-center">
          <img src=${data.user.profile_image_url} class="main-cmt-img">
        </div>
        <div class="col-lg-10 col-9 user-comment bg-light rounded pb-1">
             <div class="row">
                   <div class="col-lg-8 col-6 border-bottom pr-0">
                      <p class="w-100 p-2 m-0">${data.text}</p>
                   </div>
                   <div class="col-lg-4 col-6 border-bottom">
                      <p class="w-100 p-2 m-0"><span class="float-right"><i class="fa fa-clock-o mr-1" aria-hidden="true"></i>${date}</span></p>
                   </div>
             </div>
            <div class="user-comment-desc p-1 pl-2">
                <p class="m-0 mr-2">${data.user.screen_name}</p>
            </div>
        </div>
      </div>
      <div class="row">
        <div class="col-lg-11 offset-lg-1">
        </div>
      </div>`;
  replyTweet.insertAdjacentHTML('beforeend',text1);
}

let test = async () => {
  if(!selectedTweet.data || replyField.value == '') {
    return ;
  }
  iconLoaderFun();
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
  insertSelectionSub(resJSON);
  iconLoaded();
}

let loaderSelection = () => {
  const text = `<div style="text-align: center; padding: 30px;">
    <div class="spinner-border" role="status">
      <span class="sr-only">Loading...</span>
    </div>
  </div>`;
  replyTweet.insertAdjacentHTML('beforeend', text);
}

let clearLoader2 = () => {
  replyTweet.innerHTML = '';
}

let loadTweet = async (id) => {
  // console.log(id);
  // selectedTweet = {} ;
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
  console.log(resJSON);
  clearLoader2();
  insertSelection(resJSON);
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
    const text = `  <div id=${ele.id_str} class="card mb-3" style="max-width: 450px; max-height: 450px; background-color: #74C2E1;" onclick="clicked(this.id)" >
      <div class="row no-gutters">
        <div class="col-md-4">
          <img style="padding: 20px;" src=${ele.user.profile_image_url} class="card-img" alt="...">
        </div>
        <div class="col-md-8">
          <div class="card-body">
            <h5 class="card-title">${ele.user.name}</h5>
            <p class="card-text">${ele.text}</p>
            <p class="card-text"><small>${ele.created_at}</small></p>
          </div>
        </div>
      </div>
      </div>`;
      insertTweet.insertAdjacentHTML('beforeend', text);
  })
}

let load = async () => {
  loader();
  let result = await fetch(url+'tweets');
  let res = await result.json();

  console.log(res.statuses);
  if(res) {
    socket.emit("recievedUser", {
      user: res.statuses[0].in_reply_to_screen_name
    })
  }
  clearLoader();
  renderList(res.statuses);
}

load();
