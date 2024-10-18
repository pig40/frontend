
import React, { Component } from 'react';
import TableList from '../../TableList/List/TableList'
import config from '../../../../../Utils/apiConfig'
const { api: { dataTransaction } } = config
export default class TransactionHistory extends Component {
    render() {
        const status = {
            'downloaded': "已购买",
            'authorized': '已通过',
            'applied': '申请中',
            'declined': '已拒绝'
        }
        const statusList = [
            { text: '全部', value: 'all', checked: true },
            { text: '已购买', value: 'downloaded', checked: true },
            { text: '已通过', value: 'authorized', checked: true },
            { text: '申请中', value: 'applied', checked: true },
            { text: '已拒绝', value: 'declined', checked: true },
        ]
        return (
            <TableList name='transactionHistory' url={dataTransaction.tradeData} statusList={statusList} statusTypeList={status} history={this.props.history} {...this.props} />
        )
    }
}