const express = require("express");
const request = require("request");
const app = express();
require('dotenv').config()
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const port = process.env.PORT || 4000;
const mongoose = require("mongoose");
var CronJob = require("cron").CronJob;
const User = require("./models/user");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());


mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/line-covid19', {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB error", err);
});

var job = new CronJob(
  "* 12 * * *",
  async function () {
    await fetch("https://covid19.th-stat.com/api/open/timeline")
      .then((response) => {
        return  response.json();
      })
      .then( async (data) => {
        let today = data.Data.slice(-1)[0];
        console.log(today);
        await broadcast_covid_today(today);

      });
  },
  null,
  true,
  "Asia/Bangkok"
);
job.start();

app.post("/webhook", async (req, res) => {
  let reply_token = req.body.events[0].replyToken;
  const user_Id = req.body.events[0].source.userId;
  const id = await User.where('userId').equals(user_Id).find({}); 
  if (id.length == 0) {
      create_userId(user_Id);
  }
  console.log(id);
  fetch("https://covid19.th-stat.com/api/open/timeline")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      let today = data.Data.slice(-1)[0];
      console.log(req.body.events[0]);
      let msg = req.body.events[0].message.text;
      if (msg == "ยอดล่าสุด") {
        reply_covid_today(reply_token, today);
      }
    });
  res.sendStatus(200).end();
});

app.listen(port);

async function broadcast_covid_today(today) {
  let confirm = today.Confirmed;
  let newconfirm = today.NewConfirmed;
  let recover = today.Recovered;
  let hospitalize = today.Hospitalized;
  let Death = today.Deaths;
  let headers = {
    "Content-Type": "application/json",
    Authorization:
      "Bearer {gnF3K0zD9X1ISUjxWDpWOip8smCuDTC5y8bDI3keJk/ks+eGOKiyJLVHKF53wtPBGoCv6qdFWAAW+z83JyvQu8rtd+ILkPg8oCmLq4cHUauZGbA0I9iSjaplLMwQJxUSb2Dullhv4uagNFK8HelmPQdB04t89/1O/w1cDnyilFU=}",
  };
  let body = JSON.stringify({
    messages: [
      {
        type: "flex",
        altText: "ยอดล่าสุด",
        contents: {
          type: "bubble",
          header: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: "ยอดผูติดเชื้อสะสม",
                size: "sm",
                color: "#33312b",
                contents: [
                  {
                    type: "span",
                    text: "ติดเชื้อสะสม",
                    color: "#33312b",
                    size: "md",
                    weight: "bold",
                  },
                ],
              },
              {
                type: "box",
                layout: "vertical",
                contents: [
                  {
                    type: "text",
                    text: `${confirm} ราย`,
                    color: "#33312b",
                    size: "xl",
                    align: "center",
                    gravity: "center",
                    weight: "regular",
                  },
                ],
                action: {
                  type: "uri",
                  label: "action",
                  uri: "https://patdpat.github.io/covid",
                },
                margin: "lg",
              },
            ],
            backgroundColor: "#ffd800",
          },
          hero: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: `ติดเพิ่ม ${newconfirm} ราย`,
                color: "#FFFFFF",
                size: "md",
                align: "center",
                margin: "sm",
              },
            ],
            margin: "md",
            spacing: "lg",
            paddingAll: "5px",
            backgroundColor: "#33312b",
            borderColor: "#ffd800",
            borderWidth: "2px",
          },
          body: {
            type: "box",
            layout: "horizontal",
            contents: [
              {
                type: "box",
                layout: "vertical",
                contents: [
                  {
                    type: "text",
                    text: "กำลังรักษา",
                    margin: "xxl",
                    color: "#FFFFFF",
                    size: "md",
                    weight: "bold",
                    style: "normal",
                  },
                  {
                    type: "box",
                    layout: "vertical",
                    contents: [
                      {
                        type: "text",
                        text: `${hospitalize} ราย`,
                        size: "xl",
                        color: "#FFFFFF",
                        margin: "none",
                        align: "center",
                      },
                    ],
                    margin: "lg",
                  },
                ],
                backgroundColor: "#f78820",
                spacing: "none",
                margin: "none",
                borderWidth: "1px",
                borderColor: "#FFFFFF",
                paddingAll: "20px",
              },
              {
                type: "box",
                layout: "vertical",
                contents: [
                  {
                    type: "text",
                    text: "รักษาหายแล้ว",
                    color: "#FFFFFF",
                  },
                  {
                    type: "box",
                    layout: "vertical",
                    contents: [
                      {
                        type: "text",
                        text: `${recover} ราย`,
                        color: "#FFFFFF",
                        size: "xl",
                        align: "center",
                        gravity: "center",
                        decoration: "none",
                      },
                    ],
                    margin: "lg",
                  },
                ],
                backgroundColor: "#32CD32",
                paddingAll: "20px",
                margin: "none",
                borderWidth: "1px",
                borderColor: "#FFFFFF",
              },
            ],
            spacing: "none",
            margin: "xs",
            paddingAll: "0px",
          },
          footer: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: "เสียชีวิตรวม",
                color: "#FFFFFF",
                size: "md",
                weight: "regular",
              },
              {
                type: "box",
                layout: "vertical",
                contents: [
                  {
                    type: "text",
                    text: `${Death} ราย`,
                    color: "#FFFFFF",
                    align: "center",
                    size: "xl",
                    margin: "md",
                  },
                ],
                margin: "md",
                paddingBottom: "15px",
              },
            ],
            backgroundColor: "#FF4500",
            spacing: "md",
            margin: "sm",
            borderWidth: "1px",
            borderColor: "#FFFFFF",
          },
        },
      },
    ],
  });

  await request.post(
    {
      url: "https://api.line.me/v2/bot/message/broadcast",
      headers: headers,
      body: body,
    },
    async (err, res, body) => {
      await console.log("status = " + res.statusCode);
    }
  );
}

async function reply_covid_today(reply_token, today) {
  let confirm = today.Confirmed;
  let newconfirm = today.NewConfirmed;
  let recover = today.Recovered;
  let hospitalize = today.Hospitalized;
  let Death = today.Deaths;
  let headers = {
    "Content-Type": "application/json",
    Authorization:
      "Bearer {gnF3K0zD9X1ISUjxWDpWOip8smCuDTC5y8bDI3keJk/ks+eGOKiyJLVHKF53wtPBGoCv6qdFWAAW+z83JyvQu8rtd+ILkPg8oCmLq4cHUauZGbA0I9iSjaplLMwQJxUSb2Dullhv4uagNFK8HelmPQdB04t89/1O/w1cDnyilFU=}",
  };
  let body = JSON.stringify({
    replyToken: reply_token,
    messages: [
      {
        type: "flex",
        altText: "ยอดล่าสุด",
        contents: {
          type: "bubble",
          header: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: "ยอดผูติดเชื้อสะสม",
                size: "sm",
                color: "#33312b",
                contents: [
                  {
                    type: "span",
                    text: "ติดเชื้อสะสม",
                    color: "#33312b",
                    size: "md",
                    weight: "bold",
                  },
                ],
              },
              {
                type: "box",
                layout: "vertical",
                contents: [
                  {
                    type: "text",
                    text: `${confirm} ราย`,
                    color: "#33312b",
                    size: "xl",
                    align: "center",
                    gravity: "center",
                    weight: "regular",
                  },
                ],
                action: {
                  type: "uri",
                  label: "action",
                  uri: "https://patdpat.github.io/covid",
                },
                margin: "lg",
              },
            ],
            backgroundColor: "#ffd800",
          },
          hero: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: `ติดเพิ่ม ${newconfirm} ราย`,
                color: "#FFFFFF",
                size: "md",
                align: "center",
                margin: "sm",
              },
            ],
            margin: "md",
            spacing: "lg",
            paddingAll: "5px",
            backgroundColor: "#33312b",
            borderColor: "#ffd800",
            borderWidth: "2px",
          },
          body: {
            type: "box",
            layout: "horizontal",
            contents: [
              {
                type: "box",
                layout: "vertical",
                contents: [
                  {
                    type: "text",
                    text: "กำลังรักษา",
                    margin: "xxl",
                    color: "#FFFFFF",
                    size: "md",
                    weight: "bold",
                    style: "normal",
                  },
                  {
                    type: "box",
                    layout: "vertical",
                    contents: [
                      {
                        type: "text",
                        text: `${hospitalize} ราย`,
                        size: "xl",
                        color: "#FFFFFF",
                        margin: "none",
                        align: "center",
                      },
                    ],
                    margin: "lg",
                  },
                ],
                backgroundColor: "#f78820",
                spacing: "none",
                margin: "none",
                borderWidth: "1px",
                borderColor: "#FFFFFF",
                paddingAll: "20px",
              },
              {
                type: "box",
                layout: "vertical",
                contents: [
                  {
                    type: "text",
                    text: "รักษาหายแล้ว",
                    color: "#FFFFFF",
                  },
                  {
                    type: "box",
                    layout: "vertical",
                    contents: [
                      {
                        type: "text",
                        text: `${recover} ราย`,
                        color: "#FFFFFF",
                        size: "xl",
                        align: "center",
                        gravity: "center",
                        decoration: "none",
                      },
                    ],
                    margin: "lg",
                  },
                ],
                backgroundColor: "#32CD32",
                paddingAll: "20px",
                margin: "none",
                borderWidth: "1px",
                borderColor: "#FFFFFF",
              },
            ],
            spacing: "none",
            margin: "xs",
            paddingAll: "0px",
          },
          footer: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: "เสียชีวิตรวม",
                color: "#FFFFFF",
                size: "md",
                weight: "regular",
              },
              {
                type: "box",
                layout: "vertical",
                contents: [
                  {
                    type: "text",
                    text: `${Death} ราย`,
                    color: "#FFFFFF",
                    align: "center",
                    size: "xl",
                    margin: "md",
                  },
                ],
                margin: "md",
                paddingBottom: "15px",
              },
            ],
            backgroundColor: "#FF4500",
            spacing: "md",
            margin: "sm",
            borderWidth: "1px",
            borderColor: "#FFFFFF",
          },
        },
      },
    ],
  });

  await request.post(
    {
      url: "https://api.line.me/v2/bot/message/reply",
      headers: headers,
      body: body,
    },
    async (err, res, body) => {
      await console.log("status = " + res.statusCode);
    }
  );
}

async function create_userId(user_Id){
  const user = new User ({ userId: user_Id });
  await user.save();
}
