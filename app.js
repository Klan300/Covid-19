const express = require("express");
const request = require("request");
const app = express();
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const port = process.env.PORT || 4000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/webhook", (req, res) => {
  fetch("https://covid19.th-stat.com/api/open/timeline")
    .then(response => {
      return response.json();
    })
    .then(data => {
      let today = data.Data.slice(-1)[0];
      let reply_token = req.body.events[0].replyToken;
      let msg = req.body.events[0].message.text;
      if (msg == "ยอดล่าสุด") reply_covid_today(reply_token, today);
    });
  res.sendStatus(200);
});

app.listen(port);

async function reply_covid_today(reply_token, today) {
  let confirm = today.Confirmed;
  let newconfirm = today.NewConfirmed;
  let recover = today.Recovered;
  let hospitalize = today.Hospitalized;
  let Death = today.Deaths;
  let headers = {
    "Content-Type": "application/json",
    Authorization:
      "Bearer {gnF3K0zD9X1ISUjxWDpWOip8smCuDTC5y8bDI3keJk/ks+eGOKiyJLVHKF53wtPBGoCv6qdFWAAW+z83JyvQu8rtd+ILkPg8oCmLq4cHUauZGbA0I9iSjaplLMwQJxUSb2Dullhv4uagNFK8HelmPQdB04t89/1O/w1cDnyilFU=}"
  };
  let body = JSON.stringify({
    replyToken: reply_token,
    messages: [
      {
        type: "flex",
        altText: "This is a Flex Message",
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
                    weight: "bold"
                  }
                ]
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
                    weight: "regular"
                  }
                ],
                action: {
                  type: "uri",
                  label: "action",
                  uri: "https://patdpat.github.io/covid"
                },
                margin: "lg"
              }
            ],
            backgroundColor: "#ffd800"
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
                margin: "sm"
              }
            ],
            margin: "md",
            spacing: "lg",
            paddingAll: "5px",
            backgroundColor: "#33312b",
            borderColor: "#ffd800",
            borderWidth: "2px"
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
                    style: "normal"
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
                        align: "center"
                      }
                    ],
                    margin: "lg"
                  }
                ],
                backgroundColor: "#f78820",
                spacing: "none",
                margin: "none",
                borderWidth: "1px",
                borderColor: "#FFFFFF",
                paddingAll: "20px"
              },
              {
                type: "box",
                layout: "vertical",
                contents: [
                  {
                    type: "text",
                    text: "รักษาหายแล้ว",
                    color: "#FFFFFF"
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
                        decoration: "none"
                      }
                    ],
                    margin: "lg"
                  }
                ],
                backgroundColor: "#32CD32",
                paddingAll: "20px",
                margin: "none",
                borderWidth: "1px",
                borderColor: "#FFFFFF"
              }
            ],
            spacing: "none",
            margin: "xs",
            paddingAll: "0px"
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
                weight: "regular"
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
                    margin: "md"
                  }
                ],
                margin: "md",
                paddingBottom: "15px"
              }
            ],
            backgroundColor: "#FF4500",
            spacing: "md",
            margin: "sm",
            borderWidth: "1px",
            borderColor: "#FFFFFF"
          },
        }
      }
    ]
  });

  await request.post(
    {
      url: "https://api.line.me/v2/bot/message/reply",
      headers: headers,
      body: body
    },
    async (err, res, body) => {
      await console.log("status = " + res.statusCode);
    }
  );
}
