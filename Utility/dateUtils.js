
const moment = require('moment');

const getDatesBetween = (startDate, endDate, dayOfWeek) => {
  const start = moment(startDate);
  const end = moment(endDate);
  const dayIndex = moment().day(dayOfWeek).day(); 

  
  console.log('startDate', startDate);
  console.log('endDate', endDate);

  const dates = [];
  
  let current = start.clone();
  
  while (current.day() !== dayIndex) {
    current.add(1, 'days');
  }

  while (current.isSameOrBefore(end)) {
    dates.push(current.format('MM-DD-YYYY'));
    current.add(7, 'days');
  }
  console.log(dates);

  return dates;
};

module.exports = { getDatesBetween };
