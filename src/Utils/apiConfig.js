const unicomeAPI = "http://42.159.213.172:7001/api/v1"
const format = require('string-format');
format.extend(String.prototype);

module.exports = {
    api: {
        UnicomUser: {
            UTest: `${unicomeAPI}/user/keys`,
            login: `${unicomeAPI}/user/login`,
            role: `${unicomeAPI}/user/role`,
        },
        evidence: {
            overview: `${unicomeAPI}/user/info`,
            dataInfo: `${unicomeAPI}/data/info`,
        },
        infringement: {
            list: `${unicomeAPI}/tort/list`,
            addData: `${unicomeAPI}/tort/add`,
            upload: `${unicomeAPI}/tort/upload`,
            validate: `${unicomeAPI}/tort/validate/{name}`,
            getDetail: `${unicomeAPI}/tort/inspect?id={id}`,
            viewORdown: `${unicomeAPI}/tort/fetch`
        },
        allDataPage: {
            depositData: `${unicomeAPI}/data/list/own`,
            getAll: `${unicomeAPI}/data/list/all`,
            level: `${unicomeAPI}/config/list?category={type}`,
            uploadFile: `${unicomeAPI}/data/upload`,
            addData: `${unicomeAPI}/data/add`,
            updateData: `${unicomeAPI}/data/update`,
            detail: `${unicomeAPI}/data/fetch?id={id}`,
            getData: `${unicomeAPI}/data/inspect`,
        },
        dataTransaction: {
            apply: `${unicomeAPI}/data/apply`,
            download: `${unicomeAPI}/data/download`,
            boughtData: `${unicomeAPI}/data/list/bought`,
            tradeData: `${unicomeAPI}/data/list/sold`,
            reviewData: `${unicomeAPI}/data/list/review`,
            reviewAction: `${unicomeAPI}/data/review`,
            reviewCountPending: `${unicomeAPI}/data/info`,

        }
    },
}
