
const moment = require('moment');

const getDatesBetween = (startDate, endDate, activeDays) => {
  const dates = [];
  let current = moment(startDate);

  // Iterate from startDate to endDate
  while (current.isSameOrBefore(endDate)) {
      // Check if the current day is in activeDays
      if (activeDays.includes(current.format('dddd'))) {
          dates.push(new Date(current));
      }
      current.add(1, 'days');
  }

  return dates;
};

function formatTime(time) {
  const momentTime = moment(time, 'HH:mm:ss');
  return momentTime.isValid() ? momentTime.format('HH:mm:ss') : null;
}

    /**
//  * Formats a time string to 'HH:mm:ss' format.
//  * @param {string} time - The time string to format.
//  * @returns {string} - The formatted time string.
//  */

module.exports = { getDatesBetween, formatTime  };
