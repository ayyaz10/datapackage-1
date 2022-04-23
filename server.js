const validator = require('validator');
// const moment = require('moment');
// const {google} = require('googleapis');
const knex = require('knex');
const express = require('express');
const cors = require('cors');
// const xlsx = require('xlsx');
const bodyParser = require('body-parser');
const app = express();

// app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// var whitelist = ['https://test.microstun.com']
// var corsOptions = {
//   origin: function (origin, callback) {
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true)
//     } else {
//       callback(new Error('Not allowed by CORS'))
//     }
//   }
// }
// app.use(cors());
// var corsOptions = {
//   origin: "https://test.microstun.com",
//   optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
// }

app.use((req, res, next) => {
  const allowedOrigins = ['https://test.microstun.com', 'https://ayyaz10.github.io/'];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
       res.setHeader('Access-Control-Allow-Origin', origin);
  }
  //res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:8020');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', true);
  return next();
});

const db = knex ({
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  }
});

app.get('/', async function (req, res) {
  res.send('working')
})

// Khalistan fund router /sfjkhuserdata
app.post('/sfjkhuserdata', async function (req, res) {
  console.log(req.body)
  const { name, address, mobile, email, tlamount, nameofbank } = req.body;

  try {
    if(!validator.isMobilePhone(mobile)) {
      res.send({
        isSuccess: false,
        msg: "Please enter a valid Mobile Number"
      })
      return
    }
    if(!validator.isEmail(email)) {
      res.send({
        isSuccess: false,
        msg: "Please enter a valid Email Address"
      })
      return
    }

    if(!validator.isEmpty(address) && !validator.isEmpty(mobile) && !validator.isEmpty(email) && !validator.isEmpty(tlamount) && !validator.isEmpty(nameofbank)) {
      db('sfj_kh4fm_userdata').insert({
        name,
        address,
        mobile,
        email,
        tlamount,
        nameofbank,
        created: new Date(),
      })
      .then(data => {
        // console.log(data)
        res.status(200).send({
          isSuccess: true
        })
      })
    } else {
      res.send({
        isSuccess: false,
        msg: "Please fill the empty fields"
      })
    }
  } catch (error) {
    res.status(500).send({
      isSuccess: false
    })
  }
})

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`listening to port ${PORT}`);
});