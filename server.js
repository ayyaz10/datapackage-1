const {
  v4: uuidv4
} = require('uuid');
const moment = require('moment');
const {google} = require('googleapis');
const knex = require('knex');
const express = require('express');
// var path = require("path");
const cors = require('cors');
const xlsx = require('xlsx');
const app = express();

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "https://ayyaz10.github.io/");
  res.header("Access-Control-Allow-Headers", "origin, X-Reqeusted-With, Content-Type, Accept");
  next();
})
// app.use(cors());
// console.log(moment().format('D/M/YYYY'))
// const db = knex({
//   client: 'pg',
//   connection: {
//     host : '127.0.0.1',
//     user : 'postgres',
//     password : '1231',
//     database : 'api-db'
//   }
// });

const db = knex ({
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  }
});

function addDataToExcel(userData) {
  const wb = xlsx.readFile('./userdata.xlsx');
  const ws = wb.Sheets['userdata'];
  const data = xlsx.utils.sheet_to_json(ws)
  // console.log(ws)
  data.push(userData)
  const newWorkbook = xlsx.utils.book_new();
  const newws = xlsx.utils.json_to_sheet(data);
  xlsx.utils.book_append_sheet(newWorkbook, newws, "userdata");

  xlsx.writeFile(newWorkbook, "./userdata.xlsx");

}
function addDbDataToExcel(userData) {
  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.json_to_sheet(userData);
  xlsx.utils.book_append_sheet(wb, ws, "Sheet1");
  xlsx.writeFile(wb, "./userdatadb.xlsx");
}



app.get('/', async function (req, res) {
  res.send('working')
 
  // Get metadata about apreadsheet
  // const metaData = await googleSheets.spreadsheets.get({
  //   auth,
  //   spreadsheetId
  // })


  // // Read rows from spreadsheet
  // const getRows = await googleSheets.spreadsheets.values.get({
  //   auth, 
  //   spreadsheetId,
  //   range: "Sheet1"
  // })

  // res.send(getRows.data);
})


async function  getDbData() {
  const userdata = await db.select("*").table('userdata');
  addDbDataToExcel(userdata)
}

function customId() {

}

app.post('/usermaildata', async function (req, res) {
  const { name, mobile, email } = req.body;

  try {
    db('emailer_site_userdata').insert({
      name: name,
      mobile: mobile,
      email: email,
      created: new Date(),
    })
    .then(data => {
      // console.log(data)
      res.status(200).send({
        isSuccess: true
      })
    })
  } catch (error) {
    res.status(500).send({
      isSuccess: false
    })
  }
  // try {
  //   db('emailer_site_userdata').insert({
  //     name,
  //     mobile,
  //     email,
  //     created: new Date()
  //   }).then(data => {
  //     res.status(200).send({
  //       isSuccess: true
  //     })
  //   })

  // } catch (error) {
  //   console.error(error)
  //   res.status(500).send({
  //     isSuccess: false,
  //     error
  //   })
  // }

  
})

app.post('/userdata', async function (req, res) {
  try {
    const { name, address, religion, mobile, email, member } = req.body;
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

// CREATE TABLE data_collection(
// 	id serial PRIMARY KEY, 
// 	name VARCHAR(100),
// 	address text,
// 	religion VARCHAR(100),
// 	mobile VARCHAR(100),
// 	email text,
// 	member VARCHAR(100),
// 	created TIMESTAMP
// )
