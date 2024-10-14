
import React, { Component } from 'react';
import TableList from '../../TableList/List/TableList'
import config from '../../../../../Utils/apiConfig'
const { api: { dataTransaction } } = config

export default class DataApproval extends Component {
    render() {
        const status = {
            'authorized': '已通过',
            'applied': '待审批',
            'declined': '已拒绝'
        }
        const statusList = [
            { text: '全部', value: 'all', checked: true },
            { text: '已通过', value: 'authorized', checked: true },
            { text: '待审批', value: 'applied', checked: true },
            { text: '已拒绝', value: 'declined', checked: true },
        ]
        return (
            <TableList name='dataApproval' url={dataTransaction.reviewData} statusList={statusList} statusTypeList={status} history={this.props.history} {...this.props} />
        )
    }
}