const numberOfNights = (checkinDate, checkoutDate) => {
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const firstDate = new Date(checkinDate);
    const secondDate = new Date(checkoutDate);
    return Math.round(Math.abs((firstDate - secondDate) / oneDay));
  };
module.exports = {
    numberOfNights
};