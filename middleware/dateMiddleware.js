//Middleware to handle dates

const prepend0 = (d) => {return Math.floor(d / 10) == 0 ? '0' + String(d) : d}

// converts date object into 'YYYY-MM-DDTHH:MM' format in local time
const localTimeString = (datetime) => {
    datetime = new Date(datetime)
    return `${datetime.getFullYear()}-${prepend0(datetime.getMonth() + 1)}-${prepend0(datetime.getDate())}T${prepend0(datetime.getHours())}:${prepend0(datetime.getMinutes())}`
}

// Given an appointment that starts at <dateTime> and lasts <duration> minutes, returns the string representation of the end date-time
// dateTime is a string representation of the start date-time
const computeEnd = (dateTime, duration) => {
    let end = new Date(dateTime)
    end.setMinutes(end.getMinutes() + duration)

    return end.toString()
}

module.exports = { localTimeString, computeEnd };