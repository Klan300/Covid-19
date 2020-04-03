const express = require("express");
const request = require("request");
const app = express();
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const port = process.env.PORT || 4000;
var covid;

fetch("https://covid19.th-stat.com/api/open/timeline")
  .then(response => {
    return response.json();
  })
  .then(data => {
    covid = data;
  });

app.get("/", function(req, res) {
  res.send(covid);
});

app.get("/today", function(req, res) {
  var today = covid.Data.slice(-1)[0];
  res.send(today);
});

app.post("/webhook", (req, res) => {
  let reply_token = req.body.events[0].replyToken
  let msg = req.body.events[0].message.text
  if (msg == "ยอดล่าสุด")
    reply(reply_token, covid)
    res.sendStatus(200)
});

app.listen(port);

function reply(reply_token,covid) {
  let headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer {gnF3K0zD9X1ISUjxWDpWOip8smCuDTC5y8bDI3keJk/ks+eGOKiyJLVHKF53wtPBGoCv6qdFWAAW+z83JyvQu8rtd+ILkPg8oCmLq4cHUauZGbA0I9iSjaplLMwQJxUSb2Dullhv4uagNFK8HelmPQdB04t89/1O/w1cDnyilFU=}"
  };
  let body = JSON.stringify({
    replyToken: reply_token,
    messages: [
      {
        type: "text",
        text: `${covid}`
      },
    ]
  });
  request.post(
    {
      url: "https://api.line.me/v2/bot/message/reply",
      headers: headers,
      body: body
    },
    (err, res, body) => {
      console.log("status = " + res.statusCode);
    }
  );
}
