import io from 'socket.io-client';
import Cookies from "js-cookie";
const socket = io.connect('https://api.baas.ziggurat.cn');

if(Cookies.get("userName")){
    socket.emit('join',Cookies.get("userName"))
}

function subscribeUploadFiles(cb) {
    socket.on('ipfs file upload success', (fileProcess) => cb(null, fileProcess));
}

function subscribeUploadFilesFail(cb) {
    socket.on('ipfs file upload fail', (fileProcessFail) => cb(null, fileProcessFail));
}

function chaincodeInstantiateSuccess(cb) {
    socket.on('chaincode instantiate success', (chainCodeInsSuccess) => cb(null, chainCodeInsSuccess));
}

function chaincodeInstantiateFail(cb) {
    socket.on('chaincode instantiate fail', (chainCodeInsFail) => cb(null, chainCodeInsFail));
}

function chaincodeUpgradeSuccess(cb) {
    socket.on('chaincode upgrade success', (chainCodeUgrSuccess) => cb(null, chainCodeUgrSuccess));
}

function chaincodeUpgradeFail(cb) {
    socket.on('chaincode upgrade fail', (chainCodeUgrFail) => cb(null, chainCodeUgrFail));
}


export { subscribeUploadFiles, subscribeUploadFilesFail, chaincodeInstantiateSuccess, chaincodeInstantiateFail,chaincodeUpgradeSuccess, chaincodeUpgradeFail };
