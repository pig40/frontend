// import React, { Component } from 'react';
// import { Button, Table, Pagination, Checkbox, message } from 'antd'
// import _ from 'lodash'
// import moment from 'moment'
// import axios from 'axios'
// import config from '../../../../Utils/apiConfig'
// import request from '../../../../Utils/fecth'
// import './DataDeposits.less'

// const CancelToken = axios.CancelToken;
// const { api: { allDataPage } } = config

// let cancel
// export default class DataDeposits extends Component {
//     constructor(props) {
//         super(props)
//         this.state = {
//             list: [],
//             searchValue: '',
//             totalPage: 0,
//             totalSize: 0,
//             levelList: [
//                 { text: '全部', value: 'all', checked: false },
//                 { text: '公开', value: 'public', checked: false },
//                 { text: '秘密', value: 'private', checked: false },
//                 { text: '机密', value: 'confidential', checked: false },
//                 { text: '绝密', value: 'top-secret', checked: false },
//             ],
//             typeList: [
//                 { text: '全部', value: 'all', checked: false },
//                 { text: '图片', value: '文件', checked: false },
//                 { text: '文件', value: 'file', checked: false },
//                 { text: '视频', value: 'video', checked: false },
//             ],
//             loading: true,
//             settingInfo: {
//                 pageNo: 1,
//                 pageSize: 20,
//                 filter: {
//                     "type": ["file", "image", 'video'],
//                     "confidentialLevel": ["public", "private", "confidential", "top-secret"],
//                     "search": '',
//                 },
//                 sort: {
//                     "item": "timestamp", // 或者 price
//                     "type": "desc" // 或者 asc
//                 },
//             },

//         }
//     }
//     add = (id) => {
//         this.props.history.push({
//             pathname: id ? `/dashboard/dataDeposit/add/${id}/` : '/dashboard/dataDeposit/add'
//         })
//     }
//     detail = (record) => {

//         this.props.history.push({
//             pathname: '/dashboard/dataDeposit/detail',
//             state: record
//         })
//     }
//     componentDidMount() {
//         this.getList()
//     }
//     changeValueFn = (e) => {
//         this.setState({
//             searchValue: e.target.value
//         })
//     }
//     // 翻页
//     changePaginationFn = (pageNumber, pageSize) => {
//         const { settingInfo } = this.state
//         settingInfo.pageNo = pageNumber
//         settingInfo.pageSize = pageSize
//         this.setState({
//             settingInfo
//         }, () => {
//             this.getList()
//         })
//     }
//     // 列表查询
//     sarchButton = () => {
//         const value = this.state.searchValue
//         const { settingInfo } = this.state
//         if (value) {
//             settingInfo.pageNo = 1
//             settingInfo.filter.search = value
//         } else {
//             settingInfo.pageNo = 1
//             settingInfo.filter.search = ''
//         }
//         this.setState({
//             settingInfo
//         }, () => {
//             this.getList()
//         })
//     }
//     getList = () => {
//         const { settingInfo } = this.state
//         this.setState({
//             loading: true
//         })
//         request().post(allDataPage.getAllList, settingInfo, {
//             cancelToken: new CancelToken(function executor(c) {
//                 cancel = c;
//             })
//         }).then(res => {
//             if (res) {
//                 switch (res.status) {
//                     case 200:
//                         this.setState({
//                             list: res.data.data,
//                             loading: false,
//                             totalPage: res.data.totalPage,
//                             totalSize: res.data.totalSize
//                         })
//                         break;
//                     case 401:
//                         this.props.history.push('/login')
//                         break;
//                     default:
//                         message.error("全部数据列表查询失败")
//                         this.setState({
//                             loading: false,
//                             list: []
//                         })
//                 }
//             }
//         })
//     }
//     selectLevel = (level, index, flag) => {
//         if (level.value == 'all' && !level.checked) {
//             let data = this.state[flag]
//             data.map(element => {
//                 element.checked = true
//             })
//             this.setState({
//                 [flag]: data
//             })
//         } else if (level.value == 'all' && level.checked) {
//             let data = this.state[flag]
//             data.map(element => {
//                 element.checked = false
//             })
//             this.setState({
//                 [flag]: data
//             })
//         } else if (level.value !== 'all' && level.checked) {
//             let data = this.state[flag]
//             data[0].checked = false
//             data[index].checked = !level.checked
//             data
//             this.setState({
//                 [flag]: data
//             })
//         }
//         else {
//             let data = this.state[flag]
//             data[index].checked = !level.checked
//             data
//             this.setState({
//                 [flag]: data
//             })
//         }
//     }
//     clear = (confirm, flag) => {
//         confirm()
//         let data = this.state[flag]
//         data.map(element => {
//             element.checked = false
//         })
//         this.setState({
//             [flag]: data
//         })
//     }
//     confirm = (clear, flag) => {
//         clear()
//         const { settingInfo } = this.state
//         if (this.state[flag][0].checked) {

//             if (flag === 'levelList') {
//                 settingInfo.filter.confidentialLevel = ["public", "private", "confidential", "top-secret"]
//             } else {
//                 settingInfo.filter.type = ["file", "image", 'video']
//             }

//         } else {
//             this.data = []
//             this.state[flag].map(element => {
//                 if (element.checked) {
//                     this.data.push(element.value)
//                 }
//             })
//             if (flag === 'levelList') {
//                 settingInfo.filter.confidentialLevel = this.data
//             } else {
//                 settingInfo.filter.type = this.data
//             }
//         }
//         this.setState({
//             settingInfo: settingInfo
//         }, () => {
//             this.getList()
//         })
//     }
//     // 筛选，排序功能
//     handleTableChange = (pagination, filters, sorter) => {
//         const { settingInfo } = this.state
//         // 排序
//         const { order, columnKey } = sorter;
//         if (columnKey) {
//             settingInfo.sort.item = columnKey;
//         }
//         if (order === 'ascend') {
//             settingInfo.sort.type = 'asc';
//         } else if (order === 'descend') {
//             settingInfo.sort.type = 'desc';
//         }

//         this.setState({
//             settingInfo
//         }, () => {
//             this.getList()
//         });
//     }
//     // 改变每页数据数量
//     onShowSizeChange = (current, pageSize) => {
//         const { settingInfo } = this.state
//         settingInfo.pageNo = 1
//         settingInfo.pageSize = pageSize
//         this.setState({
//             settingInfo
//         }, () => {
//             this.getList()
//         })
//     }

//     render() {
//         const dataType = {
//             'image': '图片',
//             'file': '文件',
//             'video': '视频'
//         }
//         const confidentiaLevel = {
//             'public': "公开",
//             'private': '秘密',
//             'confidential': '机密',
//             'top-secret': '绝密'
//         }
//         let columns = [
//             {
//                 title: '名称',
//                 dataIndex: 'name',
//                 key: 'name',
//                 render: (text, record) => <div className='title'>{record.name}</div>
//             },
//             {
//                 title: '版本',
//                 dataIndex: 'version',
//                 key: 'version',
//             },
//             {
//                 title: '类型',
//                 dataIndex: 'type',
//                 key: 'type',
//                 render: (text) => <div className='name'>{_.get(dataType, text, '暂无')}</div>,
//                 filterIcon: filtered => <span />,
//                 filterDropdown: ({
//                     setSelectedKeys, selectedKeys, confirm, clearFilters,
//                 }) => (
//                         <div>
//                             <div className='ant-dropdown-menu' >
//                                 {
//                                     this.state.typeList.map((element, index) => {
//                                         return (
//                                             <li className='ant-dropdown-menu-item' key={element.text}>
//                                                 <Checkbox checked={element.checked} onChange={() => this.selectLevel(element, index, 'typeList')}>{element.text}</Checkbox>
//                                             </li>
//                                         )
//                                     })
//                                 }
//                             </div>
//                             <div className='ant-table-filter-dropdown-btns'>
//                                 <Button className='clear' onClick={() => this.clear(clearFilters, 'typeList')}>重置</Button>
//                                 <Button className='confirm' onClick={() => this.confirm(clearFilters, 'typeList')}>确定</Button>
//                             </div>
//                         </div>
//                     ),
//             },
//             {
//                 title: '密级',
//                 dataIndex: 'confidentialLevel',
//                 key: 'confidentialLevel',
//                 filters: [
//                     { text: '公开', value: 'public' },
//                     { text: '秘密', value: 'private' },
//                     { text: '机密', value: 'confidential' },
//                     { text: '绝密', value: 'top-secret' },
//                 ],
//                 filterIcon: filtered => <span />,
//                 filterDropdown: ({
//                     setSelectedKeys, selectedKeys, confirm, clearFilters,
//                 }) => (
//                         <div>
//                             <div className='ant-dropdown-menu' >
//                                 {
//                                     this.state.levelList.map((element, index) => {
//                                         return (
//                                             <li className='ant-dropdown-menu-item' key={element.text}>
//                                                 <Checkbox checked={element.checked} onChange={() => this.selectLevel(element, index, 'levelList')}>{element.text}</Checkbox>
//                                             </li>
//                                         )
//                                     })
//                                 }
//                             </div>
//                             <div className='ant-table-filter-dropdown-btns'>
//                                 <Button className='clear' onClick={() => this.clear(clearFilters, 'levelList')}>重置</Button>
//                                 <Button className='confirm' onClick={() => this.confirm(clearFilters, 'levelList')}>确定</Button>
//                             </div>
//                         </div>
//                     ),
//                 render: (text) => <span>{_.get(confidentiaLevel, text, '')}</span>
//             },
//             {
//                 title: '生成时间',
//                 dataIndex: 'timestamp',
//                 key: 'timestamp',
//                 sorter: true,

//                 render: (text, record) => (
//                     moment(text).format('YYYY-MM-DD HH:mm:ss')
//                 )
//             },
//             {
//                 title: '状态',
//                 dataIndex: 'status',
//                 key: 'status',
//                 render: (text) => <span>已存证</span>
//             },
//             {
//                 title: '价格',
//                 sorter: true,
//                 dataIndex: 'price',
//                 key: 'price',
//                 render: (text) => <span>{text || ""}</span>
//             },
//             {
//                 title: '操作',
//                 dataIndex: "sortType",
//                 render: (text, record, index) =>
//                     <div className='action'>
//                         <React.Fragment>
//                             <span onClick={() => this.detail(record)}>详情</span>
//                             <span onClick={() => this.add(record.id)}>更新</span>
//                             <span>下载</span>
//                         </React.Fragment>
//                     </div>
//             },
//         ]
//         return (
//             <div className='dataDeposits'>
//                 <Button className="create-plus" onClick={() => this.add()}>
//                     <img src={require('../../../../images/dataDeposit/plus.svg')} alt='' style={{ marginRight: 11 }} />
//                     新增数据
//                 </Button>
//                 <div className="search-box">
//                     <input
//                         className='search-input'
//                         onEnded={() => this.sarchButton()}
//                         value={this.state.searchValue}
//                         onChange={this.changeValueFn}
//                         placeholder='请输入数据名/数据哈希'
//                         type="text" />
//                     <div className='search-btn'>
//                         <img src={require('../../../../images/dataDeposit/search.svg')} alt='' onClick={() => this.sarchButton()} />
//                     </div>
//                 </div>
//                 {/*列表*/}
//                 <div className='list-wrap'>
//                     <Table
//                         columns={columns}
//                         loading={this.state.loading}
//                         dataSource={this.state.list}
//                         rowKey={record => record.id}
//                         locale={{
//                             emptyText: <div className="data-deposit-empty"><img
//                                 src={require('../../../../images/dashboard/empty.svg')} alt="" /><span>未找到搜索结果</span>
//                             </div>
//                         }}
//                         pagination={false}
//                         onChange={this.handleTableChange}

//                     />
//                     {
//                         !this.state.loading ?
//                             <div className="pagination-box" style={{ marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
//                                 {
//                                     this.state.totalPage && this.state.totalPage > 10 &&
//                                     < div >
//                                         <span className="firstPage" onClick={() => {
//                                             this.changePaginationFn(this.state.settingInfo.pageNo - 10)
//                                         }}>
//                                             <div className='firstPageBg'></div>
//                                         </span>
//                                     </div>
//                                 }
//                                 <Pagination
//                                     pageSizeOptions={['10', '20', '30', '40']}
//                                     showSizeChanger
//                                     onShowSizeChange={this.onShowSizeChange}
//                                     current={this.state.settingInfo.pageNo}
//                                     pageSize={this.state.settingInfo.pageSize}
//                                     total={this.state.totalSize}
//                                     onChange={this.changePaginationFn} />

//                                 {
//                                     this.state.totalPage && this.state.settingInfo.pageNo + 10 <= this.state.totalPage &&
//                                     <span className="lastPage" style={{ marginLeft: 8 }} onClick={() => {
//                                         this.changePaginationFn(this.state.settingInfo.pageNo + 10)
//                                     }}>
//                                         <div className='lastPageBg'></div>
//                                     </span>
//                                 }
//                             </div>
//                             :
//                             null
//                     }
//                 </div>
//             </div>
//         );
//     }
// }


import React, { Component } from 'react';
import TableList from '../TableList/List/TableList'
import config from '../../../../Utils/apiConfig'
const { api: { allDataPage } } = config

export default class DataDeposits extends Component {
    render() {
        // const status = {

        // }
        // const statusList = [

        // ]
        const status = {

        }
        const statusList = [
            { text: '全部', value: 'all', checked: true },
            { text: '已授权', value: 'authorized', checked: true },
            { text: '未授权', value: 'unauthorized', checked: true },
        ]
        return (
            <TableList name='dataDeposit' url={allDataPage.depositData} statusList={statusList} statusTypeList={status} history={this.props.history} {...this.props}/>
        )
    }
}