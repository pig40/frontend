import Cookies from "js-cookie";

const lang = Cookies.get('lang');
const timeFormat = {
    getLocalDateTime: function (param) {
        let result = new Date(param);
        return result.toLocaleString(lang);
    }
};

export default timeFormat