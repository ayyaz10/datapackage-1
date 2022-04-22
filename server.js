

const validator = require('validator');
// const {check, validationResult} = reqire('express-validator');
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
  extended: false
}));

// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "https://ayyaz10.github.io/");
//   res.header("Access-Control-Allow-Headers", "origin, X-Reqeusted-With, Content-Type, Accept");
//   next();
// })
// var corsOptions = {
//   origin: 'https://ayyaz10.github.io/',
//   optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
// }
// app.use(cors({
//   origin: "https://ayyaz10.github.io/sfckhforfm/",
//   methods: ["GET", "POST"]
// }));
app.use(cors())
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

async function getPkDbData() {
  // const idData = await.db.select()
} 

function assignVoterId(id, numToAdd) {
const obj = {};
function addZeros(preZeroId) {
  console.log(preZeroId)
  let zeroAddedId;
  if (preZeroId < 9) {
    zeroAddedId = `0000${preZeroId}`;
  }else if (preZeroId > 9 && preZeroId < 99) {
    // console.log('should')
    zeroAddedId = `000${preZeroId}`;
  } else if (preZeroId > 99 && preZeroId < 999) {
    zeroAddedId = `00${preZeroId}`;
  } else if (preZeroId > 999 && preZeroId < 9999) {
    zeroAddedId = `0${preZeroId}`;
  } else {
    zeroAddedId = `${preZeroId}`;
  }
   obj.id = zeroAddedId;
   console.log(obj)
}
  // console.log(id + " my")
  if (id) {
    if (numToAdd === 3) {
      
      id = id + numToAdd;
      addZeros(id);
      numToAdd = 5;
      // console.log(1)
    } else if (numToAdd === 5) {
      id = id + numToAdd;
      addZeros(id);
      numToAdd = 7;
      // console.log(2)
    } else {
      id = id + numToAdd;
      addZeros(id);
      numToAdd = 3;
      // console.log(3)
    }
  } else {
    id = 1;
    addZeros(id);
    numToAdd = 3;
    // console.log(4)
  }
  // obj.id = id;
  obj.numToAdd = numToAdd;
  // console.log(obj)
  return obj;

}


async function insertNumToAdd(number) {
  const dbNumToAdd = await getDbNumToAdd();
  // console.log(dbNumToAdd)
  if(typeof dbNumToAdd == 'undefined') {
    const dbNum = db('num_to_add').insert({
      number
     })
    return dbNum;
  } else {
    const res = await db('num_to_add').update({number});
    // console.log(res)
  }
}   

async function getDbVoterId() {
   const dbData = await db.select().from('pk_userdata').orderBy([{column:"id",order:"desc"}]).limit(1)
  //  console.log(dbData + "getDbVoterId")
  // console.log(dbData.length)
   if(dbData.length < 1) {
    return;
   }
  //  console.log(Number(dbData[0].voter_id))
   return dbData[0].voter_id;
}
// HAVING ISSUE WITH 9
async function getDbNumToAdd() {
   const dbNumToAdd = await db.select("number").table('num_to_add');
   if(dbNumToAdd.length < 1) {
    return;
   } 
     return dbNumToAdd[0].number;
  //  if(dbNumToAdd.length < 1) {
  //    return
  //  } 
  //  console.log(dbNumToAdd)
}

app.post('/voterdata', async function(req, res) {
  const { name, mobile, email } = req.body;
  const dbVoterId = await getDbVoterId();
  const dbNumToAdd = await getDbNumToAdd();
  const voterData = assignVoterId(Number(dbVoterId), Number(dbNumToAdd));
  const dbNum = insertNumToAdd(voterData.numToAdd);
  db('pk_userdata').insert({
  voter_id: voterData.id,
  name: name,
  mobile: mobile,
  email: email,
  created: new Date(),
})
  .then(dbres => {
    res.status(200).send({
      voterId: voterData.id,
      isSuccess: true
    })
  })
  // const databaseRes = await assignVoterId(req)
  // res.send('ok')
})



app.post('/sfckhuserdata', async function (req, res) {
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
      db('sfc_kh4fm_userdata').insert({
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

// CREATE TABLE sfc_kh4fm_userdata(
//  id serial PRIMARY KEY, 
//  name VARCHAR(100),
//  address text,
//  religion VARCHAR(100),
//  mobile VARCHAR(100),
//  email text,
//  member VARCHAR(100),
//  created TIMESTAMP
// )


// CREATE TABLE data_collection(
//  id serial PRIMARY KEY, 
//  name VARCHAR(100),
//  address text,
//  religion VARCHAR(100),
//  mobile VARCHAR(100),
//  email text,
//  member VARCHAR(100),
//  created TIMESTAMP
// )


// CREATE TABLE pk_userdata(
//  id serial PRIMARY KEY,
//  voter_id text,
//  name VARCHAR(100),
//  mobile VARCHAR(100),
//  email text,
//  created TIMESTAMP
// )


// CREATE TABLE num_to_add(
//  id serial PRIMARY KEY,
//  number VARCHAR(100),
// )
