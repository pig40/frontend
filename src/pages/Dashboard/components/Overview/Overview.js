import React, { Component } from 'react';
import _ from 'lodash'
import './Overview.less'
import { Card, Spin, List } from 'antd';
import request from '../../../../Utils/fecth'
import apiConfig from "../../../../Utils/apiConfig";
import { message } from "antd/lib/index";
import Cookies from "js-cookie";

const { api: { evidence } } = apiConfig


export default class Overview extends Component {
    constructor(props) {
        super(props)
        this.state = {
            cardLoading: false,
            dataInfoLoading: false,
            userInfo: null,
            dataInfo: null,
        }
    }

    componentDidMount() {
        this.setState({
            cardLoading: true,
            dataInfoLoading: true
        })
        let userName = '';
        if (Cookies.get('userInfo')) {
            try {
                let userInfo = JSON.parse(Cookies.get("userInfo"))
                userName = userInfo.name;
            } catch (e) {
            }
        }
        // 构建请求 URL，添加 userName 参数
	const requestUrl = `${evidence.overview}?userName=${encodeURIComponent(userName)}`;

        request().get(requestUrl).then((res) => {
            if (res) {
                switch (res.status) {
                    case 200:
                        this.setState({
                            userInfo: res.data
                        })
                        break;
                    case 401:
                        Cookies.remove('token', { path: '' });
                        Cookies.remove('userInfo', { path: '' });
                        Cookies.remove('userName', { path: '' });
                        this.props.history.push("/login")
                        break;
                    default:
                        message.error("用户信息获取失败")
                        break;

                }
                this.setState({
                    cardLoading: false,
                })
            }

        })

        request().get(evidence.dataInfo).then((res) => {
            if (res) {
                switch (res.status) {
                    case 200:
                        this.setState({
                            dataInfo: res.data
                        })
                        break;
                    case 401:
                        Cookies.remove('token', { path: '' });
                        Cookies.remove('userInfo', { path: '' });
                        Cookies.remove('userName', { path: '' });
                        this.props.history.push("/login")
                        break;
                    default:
                        message.error("数据信息获取失败")
                        break;

                }
                this.setState({
                    dataInfoLoading: false,
                })
            }
        })
    }

    getRoles = (arr) => {
        let str = ''
        if (arr && arr.length) {
            arr.map((item) => {
                str += (item + " ")
                return str.slice(0, -1)
            })
        }
        return str
    }

    getUploadPermissions = (type) => {
        return this.state.userInfo && this.state.userInfo[type] ? this.state.userInfo[type].map(item => {
            return item;
        }).join('、') : null
    }

    getDataInfo = (id) => {
        const { dataInfo } = this.state
        let viewData = ""
        if (id === "review") {
            viewData = dataInfo && dataInfo["review"] && dataInfo["review"].all
        } else {
            viewData = dataInfo && dataInfo[id]
        }
        if (viewData) {
            return this.setnum(viewData)
        }

        return viewData
    }

    toPageFn = (link) => {
        this.props.history.push(link)
    }
    setnum(num) {//取整，三行逗号隔开
        num = Math.floor(num);//向下取整，
        num = num.toString();
        let len = num.length;
        if (len >= 8) {
            let r = (len - 4) % 3;
            num = num.slice(0, len - 4)
            num = r > 0 ? num.slice(0, r) + "," + num.slice(r, len).match(/\d{3}/g).join(",") : num.slice(r, len).match(/\d{3}/g).join(",");
            return <div>{num}<span className='wan'>万</span></div>
        }
        let r = len % 3;
        if (len <= 3) {
            return num;
        }
        num = r > 0 ? num.slice(0, r) + "," + num.slice(r, len).match(/\d{3}/g).join(",") : num.slice(r, len).match(/\d{3}/g).join(",");
        return num;
    };

    render() {
        const { userInfo, dataInfo, dataInfoLoading } = this.state
        let dataInfoList = [
            {
                id: 'all',
                tit: '全部数据',
                link: "/dashboard/dataTransaction/allData",
            },
            {
                id: 'bought',
                tit: '已购数据',
                link: "/dashboard/dataTransaction/purchasedData"
            },
            {
                id: 'traded',
                tit: '交易历史',
                link: "/dashboard/dataTransaction/transactionHistory"
            },
            // {
            //     id: 'review',
            //     tit: '数据审批',
            //     pending: _.get(dataInfo, 'review.pending'),
            //     link: "/dashboard/dataTransaction/dataApproval"
            // },
            // {
            //     id: 'own',
            //     tit: '数据存证',
            //     link: "/dashboard/dataDeposit"
            // },
            // {
            //     id: 'tort',
            //     tit: '侵权存证',
            //     link: "/dashboard/infringementDeposit"
            // },

        ]
        return (
            <div className="overviewPage">
                <div className="overviewChildren">
                    <h1>个人信息</h1>
                    <div className='user-info'>
                        <div className='info'>
                            <div>
                                <h3><img src={require('../../../../images/dashboard/overviewName.svg')}
                                    alt="" /><span>用户名</span></h3>
                                <h2>{_.get(userInfo, 'name', '')}</h2>
                            </div>
                        </div>
                        <div className='info'>
                            <div>
                                <h3><img src={require('../../../../images/dashboard/overviewRole.svg')}
                                    alt="" /><span>角色</span></h3>
							 <h2>     客户</h2>
                            </div>
                        </div>
                        <div className='info'>
                            <h3><img src={require('../../../../images/dashboard/overviewPointer.svg')}
                                alt="" /><span>我的积分</span></h3>
                            <h2>{_.get(userInfo, 'points', '')}</h2>
                        </div>
                        <div className='permission'>
                            <div className='upload'>
                                { <h3 ><span>上传权限</span><code>{this.getUploadPermissions("uploadPermissions")}</code></h3> }
                            </div>
                            <div className='upload' style={{ marginTop: 12 }}>
                                { <h3><span>访问权限</span><code>{this.getUploadPermissions("accessPermissions")}</code></h3> }
                            </div>
                        </div>
                    </div>
                </div>
                <div className="overviewChildren" style={{ paddingBottom: 12 }}>
                    <h1>数据信息</h1>
                    <List
                        style={{ marginTop: '36.5px' }}
                        grid={{
                            gutter: 12, xs: 1, sm: 2, md: 4, lg: 4, xl: 4, xxl: 6,
                        }}
                        dataSource={dataInfoList}
                        renderItem={item => {
                            const Tag = item.pending ? "code" : "span"
                            return (
                                <List.Item>
                                    <Card>
                                        <Spin spinning={dataInfoLoading} />
                                        <h4>
                                            <span>{item.tit}</span>

                                            <Tag>{item.pending || ''}</Tag>
                                        </h4>
                                        <h5>{dataInfo && this.getDataInfo(item.id)}</h5>
                                        <a onClick={() => { this.toPageFn(item.link) }} className='view'>查看</a>
                                    </Card>
                                </List.Item>
                            )
                        }}
                    />
                </div>
            </div>
        );
    }
}