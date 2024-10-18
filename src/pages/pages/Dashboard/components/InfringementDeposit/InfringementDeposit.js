import React, { Component } from 'react';
import './InfringementDeposit.less'
import { Button, Icon, Input, Table, Pagination, Tooltip, Checkbox } from 'antd';
import request from '../../../../Utils/fecth'
import _ from 'lodash'
import { eq } from '../../../../Utils/common'
import Cookies from 'js-cookie'
import apiConfig from "../../../../Utils/apiConfig";
import moment from "moment/moment";
import { message } from "antd/lib/index";
import axios from "axios/index";

const CancelToken = axios.CancelToken;
const { api: { infringement, allDataPage } } = apiConfig
let cancel;

export default class InfringementDeposit extends Component {
    constructor(props) {
        super(props)
        this.state = {
            searchValue: "",
            tableArr: null,
            totalPage: null,
            totalSize: null,
            typeFilter: [
                { text: '全部', value: 'all', checked: true },
            ],

            settingInfo: {
                pageNo: 1,
                pageSize: 20,
                filter: {
                    "types": [],
                    "search": '',
                },
                sort: {
                    "item": "timestamp", // 或者 price
                    "type": "desc" // 或者 asc
                },
            },
        }
    }

    componentWillReceiveProps(props) {
        let data = this.state.settingInfo
        this.state.typeFilter.map(element => {
            element.checked = true
        })
        this.setState({
            searchValue: "",
            tableArr: [],
            totalPage: 0,
            totalSize: 0,
            typeFilter: this.state.typeFilter,
            settingInfo: {
                pageNo: 1,
                pageSize: 20,
                filter: {
                    "types": [],
                    "search": '',
                },
                sort: {
                    "item": "timestamp", // 或者 price
                    "type": "desc" // 或者 asc
                },
            },
        }, () => {
            if (!eq(data, this.state.settingInfo)) {
                this.getList()
            }
        })
        // const { settingInfo } = this.state
        // settingInfo.filter.search = ""
        // this.setState({
        //     settingInfo,
        //     searchValue: ""
        // }, () => {
        //     this.getList()
        // })
    }

    componentDidMount() {
        this.getList()
        this.getType()
    }
    getType = () => {
        request().get(allDataPage.level.format({ type: 'type' })).then(res => {
            if (res && res.status === 200) {
                let typeList = []
                res.data.map(element => {
                    typeList.push({
                        text: element.name,
                        value: element.id,
                        checked: true
                    })
                })
                this.setState({
                    typeFilter: [{ text: '全部', value: 'all', checked: true }].concat(typeList)
                })
            } else if (res && res.status === 401) {
                Cookies.remove('token', { path: '' });
                Cookies.remove('userInfo', { path: '' });
                Cookies.remove('userName', { path: '' });
                this.props.history.push("/login")
            }
        })
    }
    getList = () => {
        const { settingInfo } = this.state
        this.setState({
            loading: true
        })
        request().post(infringement.list, settingInfo, {
            cancelToken: new CancelToken(function executor(c) {
                // An executor function receives a cancel function as a parameter
                cancel = c;
            })
        }).then(res => {
            if (res) {
                switch (res.status) {
                    case 200:
                        this.setState({
                            tableArr: res.data.infringements,
                            loading: false,
                            totalPage: 0,
                            totalSize: res.data.totalSize
                        })
                        break;
                    case 401:
                        sessionStorage.removeItem('userInfo')
                        this.props.history.push('/login')
                        break;
                    default:
                        message.error("侵权存证列表查询失败")
                        this.setState({
                            loading: false,
                            totalPage: 0,
                            totalSize: 0
                        })
                }
            }
        })
    }

    componentWillUnmount() {
        if (cancel) {
            cancel()
        }
        this.setState = () => {
        }
    }

    // 前往详情页
    toDetail = (text) => {
        this.props.history.push({
            pathname: '/dashboard/infringementDeposit/infringementDetail',
            state: text
        })
    }

    changeValueFn = (e) => {
        this.setState({
            searchValue: e.target.value
        })
    }

    sarchButton = (e) => {
        const value = this.state.searchValue
        const { settingInfo } = this.state
        if (value) {
            settingInfo.pageNo = 1
            settingInfo.filter.search = value
        } else {
            settingInfo.pageNo = 1
            settingInfo.filter.search = ''
        }
        this.setState({
            settingInfo
        }, () => {
            this.getList()
        })
    }

    handleTableChange = (pagination, filters, sorter) => {
        const { settingInfo } = this.state
        this.data = []
        this.state.typeFilter.map(element => {
            element.checked && this.data.push(element.value)

        })
        settingInfo.filter.types = this.state.typeFilter[0].checked ? [] : this.data
        // 排序
        const { order, columnKey } = sorter;
        if (columnKey) {
            settingInfo.sort.item = columnKey;
        }
        if (order === 'ascend') {
            settingInfo.sort.type = 'asc';
        } else if (order === 'descend') {
            settingInfo.sort.type = 'desc';
        }

        this.setState({
            settingInfo
        }, () => {
            this.getList()
        });
    }

    certificateValidationFn = () => {
        this.props.history.push("/dashboard/infringementDeposit/certificateValidation")
    }

    //重置 重置为初始状态
    clear = (clear) => {
        clear()
        let { typeFilter } = this.state
        typeFilter.map(element => {
            element.checked = true
        })
        this.setState({
            typeFilter
        })
    }
    //确定
    confirm = (confirm) => {
        confirm && confirm()
    }

    chengeFilterType = (level, index, setSelectedKeys) => {
        this.level = _.cloneDeep(level)
        let { typeFilter } = this.state
        if (level.value === 'all') { //选择全部
            typeFilter.map(element => {
                element.checked = !this.level.checked
            })
            this.setState({
                typeFilter
            })
        } else {
            //不是全部
            typeFilter[index].checked = !level.checked
            typeFilter[0].checked = typeFilter.filter(element => {
                return element.value !== 'all' && element.checked === true
            }).length === typeFilter.length - 1 ? true : false
            this.setState({
                typeFilter
            })
        }
        setSelectedKeys(typeFilter.filter(element => {
            return element.checked === true
        }))
        this.confirm()
    }

    // 筛选下拉菜单
    filterListRender = (setSelectedKeys, selectedKeys, confirm, clearFilters) => {
        return (
            <div>
                <ul className="ant-dropdown-menu">
                    {
                        this.state.typeFilter.map((item, idx) => {
                            return (
                                <li className='ant-dropdown-menu-item' key={item.text}>
                                    <Checkbox checked={item.checked}
                                        onChange={() => this.chengeFilterType(item, idx, setSelectedKeys)}>{item.text}</Checkbox>
                                </li>
                            )
                        })
                    }
                </ul>
                <div className='ant-table-filter-dropdown-btns'>
                    <span className='clear ant-table-filter-dropdown-link'
                        onClick={() => this.clear(clearFilters)}>重置</span>
                    <span className='confirm ant-table-filter-dropdown-link'
                        onClick={() => this.confirm(confirm)}>确定</span>
                </div>
            </div>
        )
    }

    changePaginationFn = (pageNumber) => {
        const { settingInfo, totalPage } = this.state
        if (pageNumber > totalPage || pageNumber < 0) {
            return false
        } else {
            settingInfo.pageNo = pageNumber
            this.setState({
                settingInfo
            }, () => {
                this.getList()
            })
        }
    }

    // 改变每页数据数量
    onShowSizeChange = (current, pageSize) => {
        const { settingInfo } = this.state
        settingInfo.pageNo = 1
        settingInfo.pageSize = pageSize
        this.setState({
            settingInfo
        }, () => {
            this.getList()
        })
    }

    // 下载
    downloadFileFn = (record) => {
        let option = {
            "action": "download",   // 查看：view
            "url": record.evidenceUrl
        }
        request().post(infringement.viewORdown, option, { responseType: 'blob' }).then((res) => {
            console.log(res)
            if (res) {
                switch (res.status) {
                    case 200:
                        let reg = new RegExp('"', "g");

                        let fileName = res.headers["content-disposition"].split(";")[1].split("filename=")[1].replace(reg, "");
                        //The actual download
                        console.log(res)
                        const blob = new Blob([res.data], { type: res.headers["content-type"] });
                        let link = document.createElement('a');
                        link.href = window.URL.createObjectURL(blob);

                        // Try to find out the filename from the content disposition `filename` value
                        link.download = fileName;

                        document.body.appendChild(link);

                        try {
                            link.click();
                        } catch (e) {
                            navigator.msSaveBlob(blob, fileName);
                        }

                        document.body.removeChild(link);
                        break;
                    default:
                        message.error("获取失败")
                        break;
                }
            }
        })
    }

    render() {
        const { totalPage, totalSize, settingInfo} = this.state

        let columns = [
            {
                title: '名称',
                dataIndex: 'name',
                key: 'name',
                render: (text, record) => <div className='address name'>{record.name}</div>
            },
            {
                title: '类型',
                dataIndex: 'type',
                key: 'type',
                filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
                    return (this.filterListRender(setSelectedKeys, selectedKeys, confirm, clearFilters))
                },
                filterIcon: filtered => <span />,
                render: (text) => <div className='address name'>{text}</div>
            },
            {
                title: '侵权URL',
                dataIndex: 'url',
                key: 'url',
                render: text =>
                    <Tooltip title={text} placement="bottomLeft">
                        <div className='address name'>{text}</div>
                    </Tooltip>
            },
            {
                title: '存证用户',
                dataIndex: 'recorder',
                key: 'recorder',
                render: text => <div className='address name'>{text}</div>
            },
            {
                title: '存证时间',
                dataIndex: 'timestamp',
                key: 'timestamp',
                sorter: true,
                render: (text, record) => (
                    <div className='address name'>{moment(text).format('YYYY-MM-DD HH:mm:ss')}</div>
                )
            },
            {
                title: '操作',
                dataIndex: "sortType",
                render: (text, record, index) =>
                    <div className='action'>
                        <React.Fragment>
                            <span onClick={() => this.toDetail(record)} className='table-item-detail'>
                                详情
                            </span>
                            <span className='table-item-download' onClick={() => {
                                this.downloadFileFn(record)
                            }}>
                                下载证书
                         </span>
                        </React.Fragment>
                    </div>
            },
        ]
        return (
            <div className="infringementPart">
                <div>
                    <Button type="primary" onClick={() => {
                        this.props.history.push("/dashboard/infringementDeposit/addInfringement")
                    }}><Icon type="plus-circle" />新增存证</Button>
                    <Button className="default-btn" onClick={() => {
                        this.certificateValidationFn()
                    }}>证书验证</Button>
                    <div className="search-box">
                        <Input
                            onPressEnter={(e) => this.sarchButton(e)}
                            value={this.state.searchValue}
                            onChange={this.changeValueFn}
                            // ref={node => this.input = node}
                            placeholder='请输入数据名'
                        />
                        <span className="line"></span>
                        <span onClick={this.sarchButton} className="search-btn">
                            <Icon type="search" />
                        </span>
                    </div>
                    <div className="table-list">
                        <Table
                            columns={columns}
                            loading={this.state.loading}
                            dataSource={this.state.tableArr}
                            rowKey={record => record.id}
                            locale={{
                                emptyText: <div className="data-deposit-empty"><img
                                    src={require('../../../../images/dashboard/empty.svg')} alt="" /><span>未找到搜索结果</span>
                                </div>
                            }}
                            pagination={false}
                            onChange={this.handleTableChange}

                        />
                        <div className="pagination-box">
                            <span className="total">共{totalSize}条数据</span>
                            {
                                totalPage && totalPage > 10 ?
                                    <span
                                        className={settingInfo.pageNo <= 10 ? "disabled firstPage" : "firstPage"}
                                        onClick={() => {
                                            this.changePaginationFn(settingInfo.pageNo - 10)
                                        }}
                                        onMouseEnter={() => {
                                            if (settingInfo.pageNo > 10) {
                                                document.getElementById("leftPage").src = require('../../../../images/dashboard/pageLeftHover.svg')
                                            }
                                        }}
                                        onMouseLeave={() => {
                                            if (settingInfo.pageNo > 10) {
                                                document.getElementById("leftPage").src = require('../../../../images/dashboard/pageLeftNor.svg')
                                            }
                                        }}>
                                        <img
                                            src={require('../../../../images/dashboard/pageLeftNor.svg')}
                                            id="leftPage"
                                            alt="" />
                                    </span> : ""
                            }
                            {/* 数据量小于20条则不显示页码 */}
                            {
                                totalSize && totalSize >= 20 ?
                                    <Pagination pageSizeOptions={['1', '10', '20', '30', '40']}
                                        onShowSizeChange={this.onShowSizeChange} current={settingInfo.pageNo}
                                        pageSize={settingInfo.pageSize} total={totalSize}
                                        onChange={this.changePaginationFn} />
                                    : ""
                            }
                            {
                                totalPage && totalPage > 10 ?
                                    <span
                                        className={settingInfo.pageNo + 10 < totalSize ? "disabled lastPage" : "lastPage"}
                                        onClick={() => {
                                            this.changePaginationFn(settingInfo.pageNo + 10)
                                        }}
                                        onMouseEnter={() => {
                                            if (settingInfo.pageNo + 10 >= totalSize) {
                                                document.getElementById("rightPage").src = require('../../../../images/dashboard/pageRightHover.svg')
                                            }
                                        }}
                                        onMouseLeave={() => {
                                            if (settingInfo.pageNo + 10 >= totalSize) {
                                                document.getElementById("rightPage").src = require('../../../../images/dashboard/pageRightNor.svg')
                                            }
                                        }}>
                                        <img
                                            src={require('../../../../images/dashboard/pageRightNor.svg')}
                                            id="rightPage"

                                            alt="" />
                                    </span> : ""
                            }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
