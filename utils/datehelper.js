
const isValidDate = (dateString) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) {
      return false;
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return false;
    }
    return true;
  };

const validateDates = (checkinDate, checkoutDate) => {
    if (!isValidDate(checkinDate) || !isValidDate(checkoutDate)) {
        throw new Error('Invalid date format');
    }
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const startDate = new Date(checkinDate);
    const endDate = new Date(checkoutDate);
    const durationInDays = Math.round(Math.abs((startDate - endDate) / oneDay));
    if (durationInDays > 30) {
        throw new Error('Duration should be less than 30 days');
    }
    if (startDate >= endDate) {
        throw new Error('Checkin date should be less than checkout date');
    }
};

module.exports =  { validateDates };