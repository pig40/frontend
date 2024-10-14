import { observable, action, configure } from 'mobx'
configure({ enforceActions: true });

class DataApprovalModel {

    @observable count = 0
    @observable settingInfo = {

        'allData': this.getPage('allData'),
        'dataApproval': this.getPage('dataApproval'),
        'purchasedData': this.getPage('purchasedData'),
        'dataDeposit': this.getPage('dataDeposit'),
        'transactionHistory': this.getPage('transactionHistory'),
    }
    @observable authList = []
    @action setAuth(authList) {
        this.authList = authList
    }
    @action getAuth() {
        return this.authList
    }
    @action removeAuth() {
        this.authList = []
    }
    @action getPage(name) {
        // if (sessionStorage.getItem('settingInfo') && JSON.parse(sessionStorage.getItem('settingInfo'))) {
        //     let settingInfo = JSON.parse(sessionStorage.getItem('settingInfo'))
        //     if (name === settingInfo.name) {
        //         return {
        //             pageNo: settingInfo.pageNo,
        //             pageSize: settingInfo.pageSize
        //         }
        //     } else {
        //         return {
        //             pageNo: 1,
        //             pageSize: 20
        //         }
        //     }

        // } else {
        return {
            pageNo: 1,
            pageSize: 20
        }
        //}
    }
    @action getDataApprovalCount(count) {
        this.count = count

    }
    @action changePage(pageNo, pageSize, name) {

        this.settingInfo[name] = {
            pageNo,
            pageSize
        }
    }
    //重置分页
    @action resetPage() {
        sessionStorage.removeItem('settingInfo')
        this.settingInfo = {
            'allData': {
                pageNo: 1,
                pageSize: 20
            },
            'dataApproval': {
                pageNo: 1,
                pageSize: 20
            },
            'purchasedData': {
                pageNo: 1,
                pageSize: 20
            },
            'dataDeposit': {
                pageNo: 1,
                pageSize: 20
            },
            'transactionHistory': {
                pageNo: 1,
                pageSize: 20
            },
        }
    }
}

export default new DataApprovalModel();





