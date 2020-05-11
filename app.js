var express = require("express");
var path = require("path");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var passport = require("passport");
var Strategy = require("passport-twitter").Strategy;
var session = require('express-session');
var Twit  = require('twit');
var url = require('url');
var socketIO = require('socket.io');
var http = require('http');

var T= {};
var activeSelection = {};
var socketList = {};

var app = express();
let server = http.createServer(app);
let io = socketIO(server);
io.on('connection', (socket) => {
  // console.log(socket.id);
  socket.on('recievedUser', (data) => {
    // console.log(data);
    socketList[data.user] = socket; //just in case storing the socket ID to user ID
    // console.log(socketList);
    // console.log(T);
    var stream = T[data.user].stream('statuses/filter', { track: '@' + data.user });
    stream.on('tweet',  (tweet) => {
      // console.log(tweet);
      socket.emit("newTweet", tweet);
    })
  })
})

function reply(status, replyStatusId = null,userName) {
  T.post('statuses/update', {
    status,
    replyStatusId,
    username: `@${userName}`
  });
}

function getTweet(id) {
  T.get('/statuses/show/' + id, function gotData(err,data,res) {
    // console.log(data);
  })
}

let searchTweets = async (user) => {
  let result = {
    data:''
  };
  await T.get('search/tweets', {q: '@'+user},
  (err,data,response) => {
    result.data = data;
    // console.log(result);
    // getTweet(data.statuses[0].id_str);
  })
  // console.log(result)
  return result;
}

let pro = {} ;
passport.use(new Strategy({
  consumerKey: 'u5h3Mu4EVEOeatsJCdkAWb2ip',
  consumerSecret: 'tnRS7uqqV94EiyJOisxG9lnMYXOL5DzdysuhSsY7p69I6HVKGE',
  callbackURL: 'http://localhost:3000'
}, (token,tokenSecret,profile,callback) => {
  pro[profile.username] = profile;
  console.log(profile);
  T[profile.username] = new Twit({
      consumer_key: 'u5h3Mu4EVEOeatsJCdkAWb2ip'
    , consumer_secret: 'tnRS7uqqV94EiyJOisxG9lnMYXOL5DzdysuhSsY7p69I6HVKGE'
    , access_token: token
    , access_token_secret: tokenSecret
  });

  console.log(T);
  return callback(null,profile);
}));

passport.serializeUser(function(user,callback) {
  callback(null,user);
});

passport.deserializeUser(function(obj,callback) {
  callback(null,obj);
});
// app.set('views',path.join(__dirname,'views'));
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(session(
  {
    secret: 'whatever',
    resave: true,
    saveUninitialized: true
  }
))
app.use(passport.initialize());
app.use(passport.session());

app.get('/home',(req,res) => {
  // res.send(`Hello World ${req.user.username}`);
  res.render('list');
})

app.get('/twitter/login', passport.authenticate('twitter'));

app.get("/login", (req,res) => {
  res.render('login');
})

app.get('/', passport.authenticate('twitter', {
  failureRedirect: '/twitter/login'
}), function(req,res) {
  res.redirect('/home');
});

app.get('/tweets', async (req,res) => {
  // console.log(searchTweets(req.user.username));
  if(req.user)
  {
    await T[req.user.username].get('search/tweets', {q: '@'+req.user.username},
    (err,data,response) => {
      if(err) {
        res.send(err);
      }
      res.send(data);
    })
  }
  res.send("error");
  // res.send(searchTweets(req.user.username));
})

app.get('/tweet',async (req,res) => {
  let q = url.parse(req.url,true);
  console.log(req.user.username);
  activeSelection[req.user.username] = q.query.id;
  let result = await T[req.user.username].get('/statuses/show/' + q.query.id);
  // console.log(result.id,result.in_reply_to_screen_name,);
  let ans1;
  let finalAns = [];
  finalAns.push(result.data);


  let result1 = await T[req.user.username].get('/search/tweets', {q: '@' + result.data.user.screen_name});
  var stream = T[req.user.username].stream('statuses/filter', { track: '@' + result.data.user.screen_name });

  stream.on('tweet',  (tweet) => {
    console.log(tweet);
    socketList[req.user.username].emit("newReply", tweet);
  });

  for(let i = result1.data.statuses.length-1; i>= 0; i--) {
    if(result1.data.statuses[i].in_reply_to_status_id_str === activeSelection[req.user.username])
     {
        finalAns.push(result1.data.statuses[i]);
     }
  }
  // console.log(finalAns);

  res.send(JSON.stringify(finalAns));
})

app.post('/reply', async (req,res) => {
  // console.log(req.body);
  T[req.user.username].post('statuses/update', {
    in_reply_to_status_id: req.body.id,
    status: `@${req.body.name} ` + req.body.data
  }, (err, data, response) => {
    if(err) {
      res.send(err);
    }
    res.send(data);
  });
});

app.get('/getuser', async(req,res) => {
  res.send(pro[req.user.username]);
});

let port = process.env.PORT;
if(port == null || port == "") {
  port = 3000;
}

server.listen(port, () => console.log("App working on port 3000"));
