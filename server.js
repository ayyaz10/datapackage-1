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
  const allowedOrigins = ['https://test.microstun.com', 'https://ayyaz10.github.io'];
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
});


app.post('/userdata', async function (req, res) {
  try {
    const { name, address, religion, mobile, email, member } = req.body;
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

    if(!validator.isEmpty(address) && !validator.isEmpty(religion) && !validator.isEmpty(mobile) && !validator.isEmpty(email) && !validator.isEmpty(member)) {
      const auth = new google.auth.GoogleAuth({
        keyFile: 'credentials.json',
        scopes: 'https://www.googleapis.com/auth/spreadsheets',
      });
      // Create client instance for auth
      const client =  auth.getClient();
      
      
      // Instance for Google Sheets API
      const googleSheets = google.sheets({version: 'v4', auth: client});
      const spreadsheetId = '1CAfqG0ysuZmwI5yNabGZQT6CqMZLtGpB-uHAbEo8kEw';
  
  
  
  
    // console.log(getRows)
  
      // console.log(googleSheets)
      const data = await googleSheets.spreadsheets.values.append({
        auth,
        spreadsheetId,
        range:"Sheet1",
        valueInputOption: "USER_ENTERED",
        resource: {
          values: [
            [name, address, religion, mobile, email, member, moment().format('D/M/YYYY')]
          ]
        }
      })
  
      // console.log(data)
      db('data_collection').insert({
        name: name,
        address: address,
        religion: religion,
        mobile: mobile,
        email: email,
        member: member,
        created: new Date(),
      })
      .then(data => {
        getDbData();
        // console.log(data)
        res.status(200).send({
          isSuccess: true
        })
      })
      // addDataToExcel(userData);
    } else {
      res.send({
        isSuccess: false,
        msg: "Please fill the empty fields"
      })
    }
  } catch (error) {
    console.error(error)
    res.status(500).send({
      isSuccess: false
    })
  }
})


const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`listening to port ${PORT}`);
});