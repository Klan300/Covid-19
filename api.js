const express = require('express')
const app = express()
const fetch = require('node-fetch');
const port = 3000
var covid ;

fetch("https://covid19.th-stat.com/api/open/timeline")
  .then(response => {
    return response.json();
  })
  .then(data => {
    covid = data;
  })

app.get('/',function(req,res){
    res.send(covid);
})

app.get('/today', function(req,res){
    var today = covid.Data.slice(-1)[0];
    res.send(today);
})


app.listen(port, () => console.log(`App listening at http://localhost:${port}`))