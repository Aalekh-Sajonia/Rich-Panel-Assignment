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
var socketList = {};

var app = express();
let server = http.createServer(app);
let io = socketIO(server);
io.on('connection', (socket) => {
  // console.log(socket.id);
  socket.on('recievedUser', (data) => {
    // console.log(data);
    socketList[data.user] = socket.id; //just in case storing the socket ID to user ID
    // console.log(socketList);
    console.log(T[data.user]);
    var stream = T[data.user].stream('statuses/filter', { track: '@' + data.user });
    stream.on('tweet',  (tweet) => {
      console.log(tweet);
      socket.emit("newTweet", tweet);
    })
  })
})

// var T = new Twit({
//     consumer_key: 'u5h3Mu4EVEOeatsJCdkAWb2ip'
//   , consumer_secret: 'tnRS7uqqV94EiyJOisxG9lnMYXOL5DzdysuhSsY7p69I6HVKGE'
//   , access_token: '1258283006793482240-o1mWQfQGAVmgbAKqx8t2VO2QsUVtz0'
//   , access_token_secret: 'AoLAZco0FVlDMsgyrb4wA0MGzRnZj4g85slt4YqTxsygX'
// });
//
// var stream = T.stream('statuses/filter', { track: '@aalekh_s' })
//
// stream.on('tweet', function (tweet) {
//   // console.log(tweet)
// })

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
  callbackURL: 'https://warm-bastion-55542.herokuapp.com/'
}, (token,tokenSecret,profile,callback) => {
  pro[profile.username] = profile;
  // console.log(profile);
  T[profile.username] = new Twit({
      consumer_key: 'u5h3Mu4EVEOeatsJCdkAWb2ip'
    , consumer_secret: 'tnRS7uqqV94EiyJOisxG9lnMYXOL5DzdysuhSsY7p69I6HVKGE'
    , access_token: token
    , access_token_secret: tokenSecret
  });

  // console.log(T);
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
  // console.log(q.query);
  let result = await T[req.user.username].get('/statuses/show/' + q.query.id);
  if(result) {
    res.send(JSON.stringify(result));
  }
  else {
    res.send("error");
  }
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
