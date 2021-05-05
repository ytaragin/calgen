const {genCalendar, genYear} = require('./gen')
const fs = require('fs');


function gen_local(year) {

    let data = []

try {
    let datastr = fs.readFileSync('last_data.txt');

    data = JSON.parse(datastr);

  } catch (err) {
    console.error(err)

  }

  genYear(year, data )

}

gen_local(5782);

