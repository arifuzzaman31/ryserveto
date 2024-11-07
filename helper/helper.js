const bcrypt = require("bcrypt");
const saltRounds = 12;

const bcryptHash = async (text) => {
    const salt = await bcrypt.genSalt(saltRounds);
    const result = await bcrypt.hash(text, salt)
    return result.toString();
}

const hashCheck = async (text,hashPas) => {
    const result = await bcrypt.compare(text,hashPas);
    return result;
}
const slugify = (text) => {
    return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

const runSMSservice = async (message,phone_number) => {
    let apiUrl =
            "https://sms.novocom-bd.com/api/v2/SendSMS?SenderId=8809638112244&Is_Unicode=false&Is_Flash=false&Message=" +
            message +
            "&MobileNumbers=" +
            phone_number +
            "&ApiKey=FdMUiVSDor5vYnFIUcxUAHF0QeoTkE3b9%2B4PA3QgBx8%3D&ClientId=5bdbb24f-263c-4ca3-953c-3448b967089e";
        // Make a GET request
        const send_sms_api = fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
            throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
        })
        .catch(error => {
            console.error('Error:', error);
        });

        return send_sms_api;
}

const formattedDate = async(date) => {
    const inputDate = new Date(date);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = inputDate.getUTCDate();
    const monthIndex = inputDate.getUTCMonth();
    const year = inputDate.getUTCFullYear();
    return `${day}-${months[monthIndex]}-${year}`;
}

const  formatDate = (dateString) => { // Jul 3
    const date = new Date(dateString);
    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

const formatDateWithDayName = (dateString) => {
    const date = new Date(dateString);
    const options = { weekday: 'short' };
    return date.toLocaleDateString('en-US', options);
}
const make_data = (model,reqData) => {
    const info = {};
    model.forEach(field => {
      if (reqData[field]) {
        info[field] = reqData[field];
      }
    });
    return info
}
module.exports = {
    bcryptHash,hashCheck,slugify,runSMSservice,formattedDate,formatDate,formatDateWithDayName,make_data
}