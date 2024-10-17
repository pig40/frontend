
import React, { Component } from 'react';
import { Button, Table, Pagination, Checkbox, message, Modal, Spin } from 'antd'
import { inject, observer } from "mobx-react/index";
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie'
import _ from 'lodash'
import axios from 'axios'
import config from '../../../../../Utils/apiConfig'
import request from '../../../../../Utils/fecth'
import { throttle } from '../../../../../Utils/throttle'
import { eq } from '../../../../../Utils/common'
import './tableList.less'
const CancelToken = axios.CancelToken;
const confirmModal = Modal.confirm;
const { api: { dataTransaction, allDataPage } } = config
let cancel

@inject("DataApprovalModel")
@observer
export default class TableList extends Component {
    constructor(props) {
        super(props)
        this.statusList = props.statusList.slice(1, props.statusList.length).map(element => {
            return element.value
        })
        this.openKeys = props.openKeys.length
        this.state = {
            list: [],
            searchValue: '',
            totalPage: 0,
            totalSize: 0,
            name: this.props.name,
            visible: false,
            requestLoading: false, //默认都勾选
            levelList: [{ text: '全部', value: 'all', checked: true }],//密级
            buyerList: [{ text: '全部', value: 'all', checked: true }], //全部购买者
            ownerList: [{ text: '全部', value: 'all', checked: true },], //存证用户
            typeList: [{ text: '全部', value: 'all', checked: true }],//类型
            statusList: props.statusList || [],//状态
            loading: true,
            url: props.url,
            settingInfo: {
                pageNo: this.props.DataApprovalModel.settingInfo[props.name].pageNo,
                pageSize: this.props.DataApprovalModel.settingInfo[props.name].pageSize,
                filter: {
                    "types": [],
                    "status": this.statusList,
                    "confidentialLevels": [],
                    "search": '',
                },
                sort: {
                    "item":
                        props.name === 'dataDeposit' ? 'timestamp' :
                            ['transactionHistory', 'dataApproval'].includes(props.name) ? "tradeTime" : "addTime", // 或者 price
                    "type": "desc" // 或者 asc
                },
            },

        }
        this.info = _.cloneDeep(this.state.settingInfo)
    }
    detail = (record) => {
        this.props.history.push({
            pathname: this.state.name === 'dataDeposit' ? '/dashboard/dataDeposit/detail' : `/dashboard/dataTransaction/${this.state.name}/detail`,
            state: Object.assign(
                { ...record },
                {
                    flag: this.state.name
                }
            )
        })
    }
    componentDidMount() {
        this.getList() //获取列表
        this.getLevel()
        this.getType()
    }
    getLevel = () => {
        this.getConfigList('confidential-level', (res) => {
            let levelList = []
            res.data.map(element => {
                levelList.push({
                    text: element.name,
                    value: element.id,
                    checked: true
                })
            })
            this.setState({
                levelList: [{ text: '全部', value: 'all', checked: true }].concat(levelList)
            })
        })
    }
    getType = () => {
        this.setState({
            typeLoading: true,
        }, () => {
            this.getConfigList('type', (res) => {
                let typeList = []
                res.data.map(element => {
                    typeList.push({
                        text: element.name,
                        value: element.id,
                        checked: true
                    })
                })
                this.setState({
                    typeList: [{ text: '全部', value: 'all', checked: true }].concat(typeList)
                })
            })
        })

    }
    getConfigList = (type, successCallback, failCallback) => {
        request().get(allDataPage.level.format({ type: type })).then(res => {
            if (res && res.status === 200) {
                successCallback && successCallback(res)
            } else if (res && res.status === 401) {
                Cookies.remove('token', { path: '' });
                Cookies.remove('userInfo', { path: '' });
                Cookies.remove('userName', { path: '' });
                this.props.history.push("/login")
            } else {
                failCallback && failCallback()
            }
        })
    }
    componentWillUnmount() {
        cancel && cancel()
        this.setState = () => {
        }
    }
    componentWillReceiveProps(props) {
        if (this.state.visible || this.openKeys !== props.openKeys.length) return
        this.openKeys = props.openKeys.length
        this.statusList = props.statusList.slice(1, props.statusList.length).map(element => {
            return element.value
        })
        this.state.levelList.map(element => {
            element.checked = true
        })
        this.state.typeList.map(element => {
            element.checked = true
        })
        let data = this.state.settingInfo

        // this.setState({
        //     searchValue: '',
        // })
        // if (this.state.settingInfo.filter.search !== '') {
        //     const { settingInfo } = this.state
        //     settingInfo.filter.search = ''
        //     this.setState({
        //         settingInfo
        //     }, () => {
        //         this.getList()
        //     })
        // }
        this.setState({
            levelList: this.state.levelList,//密级
            buyerList: [{ text: '全部', value: 'all', checked: true }], //全部购买者
            ownerList: [{ text: '全部', value: 'all', checked: true },], //存证用户
            typeList: this.state.typeList,
            searchValue: '',
            settingInfo: {
                pageNo: props.DataApprovalModel.settingInfo[props.name].pageNo,
                pageSize: props.DataApprovalModel.settingInfo[props.name].pageSize,
                filter: Object.assign({
                    "types": [],
                    "status": this.statusList,
                    "confidentialLevels": [],
                    "search": '',
                }),
                sort: {
                    item: props.name === 'dataDeposit' ? 'timestamp' :
                        ['transactionHistory', 'dataApproval'].includes(props.name) ? "tradeTime" : "addTime", // 或者 price
                    "type": "desc" // 或者 asc
                },
            },

        }, () => {
            if (!eq(data, this.state.settingInfo)) {
                this.getList()
            }

        })
    }
    changeValueFn = (e) => {
        const { settingInfo } = this.state
        settingInfo.filter.search = e.target.value
        this.setState({
            searchValue: e.target.value,
            settingInfo: settingInfo
        })
    }
    // 列表查询
    sarchButton = () => {
        const value = this.state.searchValue
        if (value === this.value) return
        this.value = value
        const { settingInfo } = this.state
        settingInfo.pageNo = 1
        settingInfo.filter.search = value
        this.props.DataApprovalModel.changePage(1, settingInfo.pageSize, this.state.name)
        sessionStorage.setItem('settingInfo', JSON.stringify({
            name: this.state.name,
            pageNo: 1,
            pageSize: settingInfo.pageSize
        }))
        this.setState({
            settingInfo
        }, () => {
            this.getList()
        })
    }
    //获取数据
    getList = (callback) => {
        const { settingInfo } = this.state
        this.setState({
            loading: true
        })
        request().post(this.state.url, settingInfo, {
            cancelToken: new CancelToken(function executor(c) {
                cancel = c;
            })
        }).then(res => {
            if (_.get(res, 'status') === 200) {
                callback && callback()
                let data = res.data.transactions || res.data.datas
                data.map(element => {
                    element.isLoading = false
                    element.progress = 0
                })
                this.state.name === 'dataApproval' && request().get(dataTransaction.reviewCountPending).then(res => {
                    if (res && res.status === 200) {
                        this.props.DataApprovalModel.getDataApprovalCount(res.data.review.pending)
                    }
                })
                this.setState({
                    list: data,
                    loading: false,
                    totalPage: res.data.totalPage,
                    totalSize: res.data.totalSize,

                })

            } else if (_.get(res, 'status') === 401) {
                this.props.history.push('/login')
            } else {
                this.state.name === 'dataApproval' && this.props.DataApprovalModel.getDataApprovalCount(0)
                res && message.error("列表查询失败")
                this.setState({
                    loading: false,
                    list: [],
                    totalPage: 0,
                    totalSize: 0
                })
            }
        })
    }
    getUsers = (res) => {
        if (!['dataApproval', 'transactionHistory'].includes(this.state.name)) {
            return []
        }
        let flag = this.state.name === 'dataApproval' ? 'owner' : 'buyer'
        let key = this.state.name === 'dataApproval' ? 'applicants' : 'buyers'
        let list = this.state[`${flag}List`]
        let data = []
        //将之前勾选过的状态不变 新增的默认选中
        res.data[key] && res.data[key].length && res.data[key].map(element => {
            if (list.filter(item => { return item.value === element }).length) {
                data.push({
                    text: element,
                    value: element,
                    checked: list.filter(item => { return item.value === element })[0].checked
                })
            } else {
                data.push({
                    text: element,
                    value: element,
                    checked: true
                })
            }
        })
        data = [this.state[`${flag}List`][0]].concat(data)
        if (this.state.settingInfo.filter.buyer && !this.state.settingInfo.filter.buyer.length && this.state[`${flag}List`][0].checked) {
            return data
        }
        this.selectedKeys && this.selectedKeys(data.filter(element => { return element.checked === true }))
        return data
    }
    //选择密级、类型、状态 购买用户
    selectLevel = (level, index, flag, setSelectedKeys) => {
        //设置选择的key
        this.level = _.cloneDeep(level)
        let data = this.state[flag]
        if (level.value === 'all') { //选择全部
            data.map(element => {
                element.checked = !this.level.checked
            })
            this.setState({
                [flag]: data
            })
        } else {
            //不是全部
            data[index].checked = !level.checked
            data[0].checked = data.filter(element => { return element.value !== 'all' && element.checked === true }).length === data.length - 1 ? true : false
            this.setState({
                [flag]: data
            })
        }
        setSelectedKeys(data.filter(element => { return element.checked === true }))
        this.confirm(null, flag)
    }
    handleCancel = () => {
        cancel && cancel()
        this.setState({
            visible: false,
            requestLoading: false
        })
    }
    submit = () => {
        if (!this.record) return
        this.setState({
            requestLoading: true
        }, () => {
            if (this.flag === 'apply') {
                let obj = {
                    id: _.get(this.record, 'id', ''),
                    version: _.get(this.record, 'version', '')
                }
                request().post(dataTransaction.apply, obj, {
                    cancelToken: new CancelToken(function executor(c) {
                        cancel = c;
                    })
                }).then(res => {
                    this.setState({
                        requestLoading: false,
                        visible: false
                    })
                    if (res) {
                        if (res.status === 200) {
                            message.success('申请成功！')
                            // this.getList()
                        } else if (res.status === 409) {
                            message.error('该条数据已经申请过了！')
                        }
                        else {
                            console.log('res:%o', res)
                            let messages = '申请失败！'
                            message.error(messages)
                        }
                    }

                })
            } else { //下载
                this.downloadFile(this.index)
            }
        })
    }
    getCurrentUsername = (record) => {
        let name = ''
        try {
            name = JSON.parse(Cookies.get("userInfo")).name
        } catch (error) {

        }
        return name === _.get(record, 'owner')
    }
    //重置 重置为初始状态
    clear = (clear, flag) => {
        clear()
        let data = this.state[flag]
        data.map(element => {
            element.checked = true
            // element.checked = false
        })
        this.setState({
            [flag]: data
        })
    }
    //确定
    confirm = (confirm) => {
        confirm && confirm()
    }
    getFilterList = (flag) => {
        const { settingInfo } = this.state
        this.data = []
        this.state[flag].map(element => {
            element.checked && this.data.push(element.value)

        })
        let type = {
            'levelList': {
                text: 'confidentialLevels',
                list: []
            },
            'statusList': {
                text: 'status',
                list: this.statusList
            },
            'typeList': {
                text: 'types',
                list: []
            },
            'buyerList': {
                text: 'buyer',
                list: []
            },
            'ownerList': {
                text: 'applicant',
                list: []
            },
        }
        settingInfo.filter[type[flag].text] = this.state[flag][0].checked ? type[flag].list : this.data.length ? this.data : type[flag].list
        this.setState({
            settingInfo: settingInfo
        }, () => {
            // this.getList()
        })
    }
    // 筛选，排序功能
    handleTableChange = (pagination, filters, sorter) => {
        const { settingInfo } = this.state;
        const { order, columnKey } = sorter;

        // 如果有排序列和排序顺序，则更新settingInfo中的排序信息
        if (columnKey) {
            settingInfo.sort.item = columnKey;
            settingInfo.sort.type = order === 'ascend' ? 'asc' : 'desc';
        }

        // 如果filters发生变化（意味着进行了筛选操作），将pageNo重置为1
        if (!_.isEmpty(filters) && !_.isEqual(this.sorter, filters)) {
            settingInfo.pageNo = 1;
        }

        // 根据表格的名称，获取对应的筛选列表
        this.getFilterList('levelList');
        this.getFilterList('typeList');
        this.getFilterList('statusList');
        if (this.state.name === 'transactionHistory') {
            this.getFilterList('buyerList');
        } else if (this.state.name === 'dataApproval') {
            this.getFilterList('ownerList');
        }

        // 更新状态，并在状态更新后进行数据获取
        this.setState({ settingInfo }, () => {
            // 如果新状态的排序信息和之前保存的排序信息相同，则不进行数据获取
            if (this.settingInfo && _.isEqual(this.settingInfo, settingInfo)) {
                return;
            }

            // 获取数据，并在成功后更新排序器和设置信息
            this.getList(() => {
                this.sorter = filters;
                this.settingInfo = _.cloneDeep(settingInfo);
            });
        });
    };

    // 改变每页数据数量
    // 改变每页数据数量
    onShowSizeChange = (pageSize) => {
        const { settingInfo } = this.state;
        // 重置到第一页
        settingInfo.pageNo = 1;
        settingInfo.pageSize = pageSize;

        // 更新分页数据
        this.props.DataApprovalModel.changePage(settingInfo.pageNo, settingInfo.pageSize, this.state.name);

        // 存储设置到 sessionStorage
        sessionStorage.setItem('settingInfo', JSON.stringify({
            name: this.state.name,
            pageNo: settingInfo.pageNo,
            pageSize: settingInfo.pageSize
        }));

        this.setState({ settingInfo }, () => {
            this.getList(); // 获取新列表
        });
    }

    // 翻页
    changePaginationFn = (pageNumber) => {
        const { settingInfo } = this.state;

        // 仅在有效的页码范围内进行分页
        if (pageNumber < 1 || pageNumber > this.state.totalPage) {
            return;
        }

        settingInfo.pageNo = pageNumber;

        // 更新分页数据
        this.props.DataApprovalModel.changePage(pageNumber, settingInfo.pageSize, this.state.name);

        // 存储设置到 sessionStorage
        sessionStorage.setItem('settingInfo', JSON.stringify({
            name: this.state.name,
            pageNo: pageNumber,
            pageSize: settingInfo.pageSize
        }));

        this.setState({ settingInfo }, () => {
            this.getList(); // 获取新列表
        });
    }

    //下载文件
    downloadFile = (index) => {
        console.log('直接下载通过')
        let data = this.state.list
        data[index] && (data[index].isLoading = true)
        this.setState({
            list: data,
            loading: this.state.visible ? this.state.loading : true
        }, () => {
            let url = dataTransaction.download
            request().post(url, {
                "id": this.record.id,     // 数据id
                "version": this.record.version,
            }, {
                responseType: 'blob',

                onDownloadProgress: (p) => {
                    // console.log('p:%o', p.loaded, _.get(p.srcElement, 'response.size', 0),p)
                    // data[index] && (data[index].progress = p.loaded / 568367 * 100)
                    // this.setState({
                    //     list: data
                    // })
                },
                cancelToken: new CancelToken(function executor(c) {
                    cancel = c;
                })
            },
            ).then(res => {
                data[index] && (data[index].isLoading = false)
                // data[index] && (data[index].progress = 0)
                this.setState({
                    list: data,
                    requestLoading: false,
                    visible: false,
                    loading: false
                })
                if (res) {
                    switch (res.status) {
                        case 200:
                            //下载过直接下载
                            data[index] && (data[index].free = true)
                            this.setState({
                                list: data,
                            })
                            // let reg = new RegExp('"', "g");

                            // let fileName = res.headers["content-disposition"].split(";")[1].split("filename=")[1].replace(reg, "");

                            // if (res.headers["content-disposition"].includes('filename*=UTF-8')) {
                            //     fileName = decodeURI(res.headers["content-disposition"].slice(res.headers["content-disposition"].indexOf('filename*=UTF-8') + 17, res.headers["content-disposition"].length))
                            // }

                            let header = res.headers["content-disposition"]
                            let reg = new RegExp('"', "g");
                            let fileName = header.split(";")[1].split("filename=")[1].replace(reg, "");
                            if (header.replace(`attachment; filename="${fileName}"; filename*=UTF-8''`, '') && header.includes('filename*=UTF-8')) {
                                fileName = decodeURI(header.slice(`attachment; filename="${fileName}"; filename*=UTF-8''`.length, header.length))
                            }
                            const blob = new Blob([res.data], { type: res.headers["content-type"] })
                            if (window.navigator.msSaveOrOpenBlob) {
                                try {
                                    window.navigator.msSaveOrOpenBlob(blob, fileName);
                                    message.success("下载成功")
                                } catch (error) {
                                    message.error("下载失败")
                                }
                            } else {
                                const elink = document.createElement('a')
                                elink.download = fileName
                                elink.style.display = 'none'
                                elink.href = URL.createObjectURL(blob)
                                if (typeof elink.download === 'undefined') {
                                    elink.setAttribute('target', '_blank');
                                }
                                document.body.appendChild(elink)
                                elink.click()
                                URL.revokeObjectURL(elink.href) // 释放URL 对象
                                document.body.removeChild(elink)
                                message.success("下载成功")
                            }
                            // if ('download' in document.createElement('a')) { // 非IE下载
                            //     const elink = document.createElement('a')
                            //     elink.download = fileName
                            //     elink.style.display = 'none'
                            //     elink.href = URL.createObjectURL(blob)
                            //     if (typeof elink.download === 'undefined') {
                            //         elink.setAttribute('target', '_blank');
                            //     }
                            //     document.body.appendChild(elink)
                            //     elink.click()
                            //     URL.revokeObjectURL(elink.href) // 释放URL 对象
                            //     document.body.removeChild(elink)
                            //     message.success("下载成功")
                            // } else { // IE10+下载
                            //     try {
                            //         navigator.msSaveBlob(blob, fileName)
                            //         message.success("下载成功")
                            //     } catch (error) {
                            //         message.error("下载失败")
                            //     }
                            // }

                            break;
                        default:
                            message.error("下载失败")
                    }
                } else {
                    message.error("下载失败")
                }
            })
        })

    }
    apply = (record) => {
        this.record = record
        this.flag = 'apply'
        this.setState({
            visible: true
        })
    }
    add = (id) => {
        this.props.history.push({
            pathname: id ? `/dashboard/dataDeposit/add/${id}/` : '/dashboard/dataDeposit/add'
        })
    }

    //筛选下拉列表
    dropDown = (setSelectedKeys, clearFilters, confirm, flag) => {
        return (
            <div>
                <div className='ant-dropdown-menu' >
                    {
                        this.state[flag].map((element, index) => {
                            return (
                                <li className='ant-dropdown-menu-item' key={element.text}>
                                    <Checkbox checked={element.checked} onChange={() => this.selectLevel(element, index, flag, setSelectedKeys)}>{element.text}</Checkbox>
                                </li>
                            )
                        })
                    }
                </div>
                <div className='ant-table-filter-dropdown-btns'>
                    <span className='clear' onClick={() => this.clear(clearFilters, flag)}>重置</span>
                    <span className='confirm' onClick={() => this.confirm(confirm)}>确定</span>
                </div>
            </div>
        )
    }
    //数据审批的通过/拒绝
    approve = (flag, record, index) => {

        confirmModal({
            title: `是否${flag === 'approve' ? '通过' : '拒绝'}该条数据`,
            onOk: () => {
                let data = this.state.list
                data[index] && (data[index].isLoading = true)
                this.setState({
                    list: data
                }, () => {
                    let url = dataTransaction.reviewAction
                    request().post(url, {
                        "id": record.id,     // 数据id
                        "version": record.version,
                        "action": flag
                    }, {
                        cancelToken: new CancelToken(function executor(c) {
                            cancel = c;
                        })
                    }
                    ).then(res => {
                        if (res && res.status === 200) {
                            data[index] && (data[index].isLoading = false)
                            data[index] && (data[index].status = flag === 'approve' ? 'authorized' : 'declined')
                            this.setState({
                                list: data
                            })
                            message.success('操作成功！')
                            // this.getList()
                            request().get(dataTransaction.reviewCountPending).then(res => {
                                if (res && res.status === 200) {
                                    this.props.DataApprovalModel.getDataApprovalCount(res.data.review.pending)
                                }
                            })

                        } else {
                            if (res && _.get(res, 'data.message', '').includes('Error: Error: The review data is not exist')) {
                                this.getList()
                                return message.error('该条数据已被处理过了！')
                            }
                            message.error('操作失败！')
                        }
                    })
                })
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    }
    // 确认删除记录
    confirmDelete = (id) => {
        Modal.confirm({
            title: '确认删除',
            content: '您确定要删除这条记录吗?',
            okText: '确定',
            cancelText: '取消',
            onOk: () => this.deleteRecord(id),
        });
    };

    // 删除文件
    deleteRecord = (id) => {
        // 发送删除请求的逻辑，例如：
        request().delete(`/api/your-delete-endpoint/${id}`)
            .then(res => {
                if (res.status === 200) {
                    message.success('删除成功');
                    // 刷新数据或更新状态
                    this.fetchData(); // 假设你有一个 fetchData 方法来重新获取数据
                } else {
                    message.error('删除失败');
                }
            })
            .catch(err => {
                message.error('请求出错');
            });
    };

    render() {
        let action = {
            //数据存证
            'dataDeposit': {
                title: '操作',
                dataIndex: "sortType",
                render: (text, record, index) =>
                    <div>
                        <div className='action'>
                            <React.Fragment>
                                <span onClick={() => this.detail(record)}>详情</span>
                                {/* <span onClick={() => this.add(record.id)}>更新</span> */}
                                <span
                                    className={record.isLoading ? 'loading' : ''}
                                    onClick={() => {
                                        if (record.isLoading) return
                                        this.record = record
                                        this.flag = 'download'
                                        this.downloadFile(index)
                                    }}>下载</span>
                                <span
                                    style={{ color: 'red', marginLeft: 8, cursor: 'pointer' }}
                                    onClick={() => this.confirmDelete(record.id)}>删除</span>
                            </React.Fragment>
                        </div>
                        {
                            //                                 <div className='action960'>
                            //                                 <div id={`popover${record.id}${index}`}>
                            //                                     <Popover
                            //                                         placement="bottom"
                            //                                         content={
                            //                                             <ul className="hover-content">
                            //                                                 <li onClick={() => this.detail(record)}>详情</li>
                            //                                                 <li onClick={() => this.add(record.id)}>更新</li>
                            //                                                 <li onClick={() => {
                            //                                                     if (record.isLoading) return
                            //                                                     this.record = record
                            //                                                     this.flag = 'download'
                            //                                                     this.downloadFile(index)
                            //                                                 }}>
                            //                                                     下载
                            //                                         </li>
                            //
                            //                                             </ul>}
                            //                                         trigger="hover"
                            //                                         className='popver'
                            //                                         getPopupContainer={() => document.getElementById(`popover${record.id}${index}`)}
                            //                                         mouseLeaveDelay={0.3}
                            //                                     >
                            //                                         <span>操作</span> <img
                            //                                             src={require('../../../../../images/dataDeposit/down.svg')}
                            //                                             style={{ marginLeft: 4, marginTop: -2, transition: 'all 0.5s' }} />
                            //                                     </Popover>
                            //                                 </div>
                            //                             </div>
                        }
                    </div>
            },
            'allData': {
                title: '操作',
                dataIndex: "sortType",
                render: (text, record, index) =>
                    <div>
                        <div className='action'>
                            <React.Fragment>
                                <span onClick={() => this.detail(record)}>详情</span>

                                {
                                    record.status === 'authorized' ?
                                        <span style={{ position: 'relative' }}>
                                            <span onClick={() => !record.isLoading && this.download(record, index)} style={{ paddingRight: 0 }} className={record.isLoading ? 'loading' : ''}>下载</span>
                                            {
                                                // record.isLoading && <div className='progressBg'>
                                                //     <Progress percent={record.progress} showInfo={false} />
                                                // </div>
                                            }
                                        </span>
                                        :
                                        <span onClick={() => this.apply(record)} style={{ paddingRight: 0 }}>购买</span>
                                }
                            </React.Fragment>
                        </div>
                        {
                            //      <div className='action960'>
                            //      <div id={`popover1${record.id}${index}`}>
                            //          <Popover
                            //              placement="bottom"
                            //              content={
                            //                  <ul className="hover-content">
                            //                      <li onClick={() => !record.isLoading && this.download(record, index)}>下载</li>
                            //                      <li onClick={() => this.apply(record)}>申请</li>

                            //                  </ul>}
                            //              trigger="hover"
                            //              className='popver'
                            //              getPopupContainer={() => document.getElementById(`popover1${record.id}${index}`)}
                            //              mouseLeaveDelay={0.3}
                            //          >
                            //              <span>操作</span> <img
                            //                  src={require('../../../../../images/dataDeposit/down.svg')}
                            //                  style={{ marginLeft: 4, marginTop: -2, transition: 'all 0.5s' }} />
                            //          </Popover>
                            //      </div>
                            //  </div>
                        }
                    </div>
            },
            'purchasedData': {
                title: '操作',
                dataIndex: "sortType",
                render: (text, record, index) => {
                    return (
                        <div>
                            <div className='action'>
                                <React.Fragment>
                                    <span onClick={() => this.detail(record)}>详情</span>
                                    <span className={record.status === 'applied' || record.isLoading ? 'loading' : ''} onClick={() => record.status !== 'applied' && !record.isLoading && this.download(record, index)}>下载</span>


                                </React.Fragment>
                            </div>
                        </div>
                    )
                }
            },
            'transactionHistory': {
                title: '操作',
                dataIndex: "sortType",
                render: (text, record, index) =>
                    <div className='action action960'>
                        <React.Fragment>
                            <span onClick={() => this.detail(record)}>详情</span>

                        </React.Fragment>
                    </div>
            },
            'dataApproval': {
                title: '操作',
                dataIndex: "sortType",
                render: (text, record, index) =>
                    <div>
                        <div className='action action960'>
                            <React.Fragment>
                                <span className={record.isLoading || record.status !== 'applied' ? 'loading' : ''} onClick={() => record.status === 'applied' && !record.isLoading && this.approve('approve', record, index)} >通过</span>
                                <span className={record.isLoading || record.status !== 'applied' ? 'loading' : ''} onClick={() => record.status === 'applied' && !record.isLoading && this.approve('reject', record, index)} >拒绝</span>
                            </React.Fragment>
                        </div>

                    </div>
            },
        }
        let column = [
            {
                title: '名称',
                dataIndex: 'name',
                key: 'name',
                render: (text, record) => <div className='title'>{record.name}</div>
            },
            //审批无版本
            this.state.name !== 'dataApproval' &&
            {
                title: '版本',
                dataIndex: 'version',
                key: 'version',
            },
            // {
            //     title: '类型',
            //     dataIndex: 'type',
            //     key: 'type',
            //     filterIcon: filtered => <span />,
            //     filterDropdown: ({
            //         setSelectedKeys, selectedKeys, confirm, clearFilters,
            //     }) => {
            //         this.hahahha = selectedKeys
            //         return (
            //             this.dropDown(setSelectedKeys, clearFilters, confirm, 'typeList')
            //         )
            //     }
            // },
            // {
            //     title: '密级',
            //     dataIndex: 'confidentialLevel',
            //     key: 'confidentialLevel',
            //     filterIcon: filtered => <span />,
            //     filterDropdown: ({
            //         setSelectedKeys, selectedKeys, confirm, clearFilters,
            //     }) => {
            //         return (this.dropDown(setSelectedKeys, clearFilters, confirm, 'levelList'))
            //     },
            //     render: (text) => <span>{text}</span>
            // },
            this.state.name === 'purchasedData' || this.state.name === 'allData' ? {
                title: "存证用户",
                dataIndex: 'owner',
                key: 'owner',
            } : this.state.name === 'transactionHistory' ? {
                title: "购买用户",
                dataIndex: 'buyer',
                key: 'buyer',
                className: 'buyer',
                // filterIcon: filtered => <span />,
                // filterDropdown: ({
                //     setSelectedKeys, selectedKeys, confirm, clearFilters,
                // }) => {
                //     this.selectedKeys = setSelectedKeys
                //     return (this.dropDown(setSelectedKeys, clearFilters, confirm, 'buyerList'))
                // },
            } : this.state.name === 'dataApproval' ? {
                title: "申请用户",
                dataIndex: 'applicant',
                className: 'buyer',
                key: 'applicant',
                render: (text, record) => <div>{record.applicant}</div>,
                // filterIcon: filtered => <span />,
                // filterDropdown: ({
                //     setSelectedKeys, selectedKeys, confirm, clearFilters,
                // }) => {
                //     this.selectedKeys = setSelectedKeys
                //     return (this.dropDown(setSelectedKeys, clearFilters, confirm, 'ownerList'))
                // },
            } : null,
            // this.state.name === 'purchasedData' || this.state.name === 'allData' ? {
            //     title: "存证组织",
            //     dataIndex: 'organization',
            //     key: 'organization',
            //     render: (text, record) => <div className='organization'>{text}</div>
            // } : this.state.name === 'transactionHistory' || this.state.name === 'dataApproval' ? {
            //     title: "所属组织",
            //     dataIndex: 'organization',
            //     key: 'organization',
            //     render: (text, record) => <div className='organization'>{text}</div>
            // } : null,
            // {
            //     title: this.state.name === 'transactionHistory' ? '购买时间' : this.state.name === 'dataApproval' ? '申请时间' : '生成时间',
            //     dataIndex: this.state.name === 'dataDeposit' ? 'timestamp' :
            //         ['transactionHistory', 'dataApproval'].includes(this.state.name) ? "tradeTime" : "addTime", // 或者 price
            //     key: this.state.name === 'dataDeposit' ? 'timestamp' :
            //         ['transactionHistory', 'dataApproval'].includes(this.state.name) ? "tradeTime" : "addTime", // 或者 price
            //     sorter: true,
            //     render: (text, record) => (
            //         moment(record.timestamp).format('YYYY-MM-DD HH:mm:ss')
            //     )
            // },
            this.state.name === 'dataDeposit' ?
                null
                :
                // {
                //     title: '状态',
                //     dataIndex: 'status',
                //     key: 'status',

                //     filterIcon: filtered => <span />,
                //     filterDropdown: ({
                //         setSelectedKeys, selectedKeys, confirm, clearFilters,
                //     }) => {
                //         return (this.dropDown(setSelectedKeys, clearFilters, confirm, 'statusList'))
                //     },
                //     render: (text) => <span>{_.get(status, text, '已存证')}</span>
                // },
                this.state.name === 'purchasedData' || this.state.name === 'dataApproval' ?
                    null
                    :
                    {
                        title: '价格',
                        sorter: true,
                        dataIndex: this.state.name === 'dataDeposit' ? 'price' : 'dataPrice',
                        key: this.state.name === 'dataDeposit' ? 'price' : 'dataPrice',
                        render: (text, record) => <span>{record.price || ''}</span>
                    },
            _.get(action, this.state.name, null)
        ]
        return (
            <div className='tableList'>
                {/*弹框*/}
                <Modal
                    wrapClassName='modal'
                    visible={this.state.visible}
                    title={this.flag === 'apply' ? '申请下载' : '下载数据'}
                    closable={false}
                    width={484}
                    footer={[
                        this.flag === 'download' ?
                            <div key="download" className='tip'>您将被扣除{_.get(this.record, 'price', 0)}积分，请再次确认！</div> : null,
                        <Button className='cancel-btn' key="back" onClick={() => this.handleCancel()}>取消</Button>,
                        <Button className='confirm-btn' key="submit" onClick={() => this.submit()} loading={this.state.requestLoading}>确认</Button>
                    ]}
                >
                    <div className='close'>
                        <img src={require('../../../../../images/dataTran/all/close.svg')} alt='' onClick={() => this.handleCancel()} />
                    </div>
                    <div className='row'>
                        <div className='title'>名称:</div>
                        <div className='value'>{_.get(this.record, 'name')}</div>
                    </div>
                    {/* <div className='row'>
                        <div className='title'>密级:</div>
                        <div className='value'>{_.get(this.record, 'confidentialLevel', '')}</div>
                    </div>
                    <div className='row'>
                        <div className='title'>类型:</div>
                        <div className='value'>{_.get(this.record, 'type', '')}</div>
                    </div> */}
                    <div className='row'>
                        <div className='title'>价格:</div>
                        <div className='value'>{_.get(this.record, 'price', 0)}积分</div>
                    </div>
                    {/* <div className='row'>
                        <div className='title'>描述:</div>
                        <div className='value'>{(this.record && this.record.description) || '暂无描述'}</div>
                    </div> */}
                    <div className='seeDetail'>
                        <Link className='detail' to={{ pathname: '/dashboard/dataTransaction/allData/detail', state: this.record }}>查看详情 <img src={require('../../../../../images/dataTran/all/seeDetail.svg')} style={{ marginLeft: 4 }} /></Link>
                    </div>
                </Modal>
                <Modal
                    visible={this.state.confirmDeleteVisible}
                    title="确认删除"
                    onOk={this.handleDelete}
                    onCancel={() => this.setState({ confirmDeleteVisible: false })}
                >
                    <p>您确定要删除此记录吗？</p>
                </Modal>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    {
                        this.state.name === 'dataDeposit' ?
                            <Button className="create-plus" onClick={() => this.add()}>
                                <img src={require('../../../../../images/dataDeposit/plus.svg')} alt='' style={{ marginRight: 11 }} />
                                新增数据
                            </Button>
                            :
                            null
                    }
                    <div style={{ flex: 1 }} />
                    <div className="search-box">
                        <input
                            className='search-input'
                            onKeyDown={(event) =>
                                event.keyCode === 13 && throttle(this.sarchButton(), 500)
                            }
                            value={this.state.searchValue}
                            onChange={this.changeValueFn}
                            placeholder='请输入数据名/数据哈希'
                            type="text" />
                        <div className='search-btn'>
                            <img src={require('../../../../../images/dataDeposit/search.svg')} alt='' onClick={() => this.sarchButton()} />
                        </div>
                    </div>
                </div>
                {/*列表*/}
                <div className='list-wrap'>
                    <Spin spinning={this.state.loading}>
                        <Table
                            columns={column.filter(element => { return element !== null && element !== false })}

                            dataSource={this.state.list}
                            rowKey={(record, index) => `${record.id}${index}`}
                            locale={{
                                emptyText: <div className="data-deposit-empty"><img
                                    src={require('../../../../../images/dashboard/empty.svg')} alt="" /><span>未找到搜索结果</span>
                                </div>
                            }}
                            pagination={false}
                            onChange={this.handleTableChange}

                        />

                        <div className="pagination-box">
                            {/*总数*/}
                            {
                                this.state.totalSize && this.state.totalSize > 0 ? <div className='ant-pagination-total-text'>共{this.state.totalSize}条数据</div> : null
                            }
                            {   //左翻页
                                this.state.totalPage && this.state.totalPage > 10 && this.state.settingInfo.pageNo - 10 > 0 ?
                                    < div id='firstPage' title='向前 10 页'>
                                        <span className="firstPage" onClick={() => {
                                            this.changePaginationFn(this.state.settingInfo.pageNo - 10)
                                        }}>
                                            <div className='firstPageBg' />
                                        </span>
                                    </div>
                                    : null
                            }
                            {
                                this.state.totalSize && this.state.totalSize > 20 ?
                                    <Pagination
                                        current={this.state.settingInfo.pageNo}
                                        pageSize={this.state.settingInfo.pageSize}
                                        total={this.state.totalSize}
                                        onChange={this.changePaginationFn} />
                                    : null

                            }
                            { //后翻页
                                this.state.totalPage && this.state.settingInfo.pageNo + 10 <= this.state.totalPage ?
                                    <span className="lastPage" title='向后 10 页' style={{ marginLeft: 9.5 }} id='lastPage' onClick={() => {
                                        this.changePaginationFn(this.state.settingInfo.pageNo + 10)
                                    }}>
                                        <div className='lastPageBg' />
                                    </span>
                                    : null
                            }
                            {
                                // this.state.totalSize && this.state.totalSize > 0 ?
                                //     <Select defaultValue={this.state.settingInfo.pageSize} style={{ marginLeft: 18.6 }} dropdownClassName='pageOptions' onChange={(value) => this.onShowSizeChange(value)}>
                                //         {
                                //             [1, 5, 10, 20, 50].map(element => {
                                //                 return (
                                //                     <Option value={element} key={element}>{element} 条/页</Option>
                                //                 )
                                //             })
                                //         }
                                //     </Select>
                                //     :
                                //     null
                            }

                        </div>

                    </Spin>
                </div>
            </div>
        );
    }
}
