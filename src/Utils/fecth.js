import axios from 'axios'
import Cookies from 'js-cookie'

// let token = Cookies.get("token")

// var fetch = axios.create({
//     headers: {
//         'Content-Type': 'application/json; charset=utf-8',
//         'authorization': `Bearer ${token}`,
//         'Content-Security-Policy': 'upgrade-insecure-requests',
//         'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'
//     }
// })
// fetch.interceptors.response.use((response) => {
//     // Do something with response data
//     return response;
// }, (err) => {
//     // const res = JSON.parse(JSON.stringify(err));
//     // return res;
//     return err;
// });

function getData() {
    let token = Cookies.get("token")
    var fetch = axios.create({
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            "Access-Control-Expose-Headers": "Content-Disposition",
            'authorization': `Bearer ${token}`,
            'Content-Security-Policy': 'upgrade-insecure-requests',
            'accept': "application/json",
            // 'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'
        },
        onUploadProgress: p => { return 100 * (p.loaded / p.total) },
        onDownloadProgress: p => { return 100 * (p.loaded / p.total) }
    })
    fetch.interceptors.response.use((response) => {
        // Do something with response data
        return response;
    }, (err) => {
        console.log(err)
        const res = JSON.parse(JSON.stringify(err));
        return res.response;
    });
    return fetch
}


export default getData;
// export default fetch;