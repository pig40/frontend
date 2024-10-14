
import React, { Component } from 'react';
import TableList from '../../TableList/List/TableList'
import config from '../../../../../Utils/apiConfig'
const { api: { dataTransaction } } = config

export default class PurchasedData extends Component {
    render() {
        const status = {
            'downloaded': "已下载",
            'authorized': '待下载',
            'applied': '申请中',
            'declined': '被拒绝'
        }
        const statusList = [
            { text: '全部', value: 'all', checked: true },
            { text: '已下载', value: 'downloaded', checked: true },
            { text: '待下载', value: 'authorized', checked: true },
            { text: '申请中', value: 'applied', checked: true },
            { text: '被拒绝', value: 'declined', checked: true },
        ]
        return (
            <TableList name='purchasedData' url={dataTransaction.boughtData} statusList={statusList} statusTypeList={status} history={this.props.history} {...this.props} />
        )
    }
}