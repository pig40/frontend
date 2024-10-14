import React, { Component } from 'react';
import './PersonalCenter.less'
import { Divider, Spin } from 'antd';
import request from '../../../../Utils/fecth'
import apiConfig from "../../../../Utils/apiConfig";
import { message } from "antd/lib/index";
import Cookies from "js-cookie";

const { api: { evidence } } = apiConfig

export default class PersonalCenter extends Component {
    constructor(props) {
        super(props)
        this.state = {
            dataInfoLoading: false,
            basicInfoList: [
                {
                    tit: '昵称',
                    dataId: 'nickName'
                },
                {
                    tit: '登录名',
                    dataId: 'name'
                },
                {
                    tit: '性别',
                    dataId: 'sex'
                }
            ],
            workInfoList: [
                {
                    tit: '职务',
                    dataId: 'staffingLevel'
                },
                {
                    tit: '所在部门',
                    dataId: 'department'
                },
                {
                    tit: '本级领导',
                    dataId: 'director'
                },
                {
                    tit: '上级领导',
                    dataId: 'manager'
                },
                {
                    tit: '父机构',
                    dataId: 'organization'
                },
            ],
            numberInfoList: [
                {
                    tit: '手机号码',
                    dataId: 'mobileNo'
                },
                {
                    tit: '办公电话',
                    dataId: 'workPhone'
                },
                {
                    tit: '邮件地址',
                    dataId: 'email'
                },
                {
                    tit: '微信号',
                    dataId: 'wechatNo'
                },
            ],
            dataInfo: null
        }
    }

    componentDidMount() {
        this.setState({
            dataInfoLoading: true
        })
        request().get(evidence.overview).then((res) => {
            if (res) {
                switch (res.status) {
                    case 200:
                        this.setState({
                            dataInfo: res.data,
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
                    dataInfoLoading: false
                })
            }
        })
    }

    render() {
        const { basicInfoList, workInfoList, numberInfoList, dataInfo, dataInfoLoading } = this.state
        const sex = {
            'male': '男',
            'female': '女'
        }
        const basicInfoListRender = dataInfo && basicInfoList.map((item, i) => {
            if (item.dataId === "sex") {
                return (
                    <li key={"basicInfoList" + i}><span>{item.tit}:</span><code>{sex[dataInfo[item.dataId]] || '暂无'}</code></li>
                )
            } else {
                return (
                    <li key={"basicInfoList" + i}><span>{item.tit}:</span><code>{dataInfo[item.dataId] || '暂无'}</code></li>
                )
            }
        })
        const workInfoListRender = dataInfo && workInfoList.map((item, i) => {
            return (
                <li key={"workInfoList" + i}><span>{item.tit}:</span><code>{dataInfo[item.dataId] || '暂无'}</code></li>
            )
        })
        const numberInfoListRender = dataInfo && numberInfoList.map((item, i) => {
            return (
                <li key={"numberInfoList" + i}><span>{item.tit}:</span><code>{dataInfo[item.dataId] || '暂无'}</code></li>
            )
        })
        return (
            <div className="personalPage">
                <div className="personalChildren">
                    <h1>基本信息</h1>
                    <Divider />
                    <ul>
                        <Spin spinning={dataInfoLoading} />
                        {basicInfoListRender}
                    </ul>
                </div>
                <div className="personalChildren">
                    <h1>工作信息</h1>
                    <Divider />
                    <ul>
                        <Spin spinning={dataInfoLoading} />
                        {workInfoListRender}
                    </ul>
                </div>
                <div className="personalChildren">
                    <h1>通讯信息</h1>
                    <Divider />
                    <ul>
                        <Spin spinning={dataInfoLoading} />
                        {numberInfoListRender}
                    </ul>
                </div>
            </div>
        );
    }
}