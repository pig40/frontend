import React, { Component } from 'react';
import './PersonalCenter.less';
import { Divider, Spin, Button, Input, message, Radio } from 'antd';
import request from '../../../../Utils/fecth';
import apiConfig from "../../../../Utils/apiConfig";
import Cookies from "js-cookie";

const { api: { evidence } } = apiConfig;

export default class PersonalCenter extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataInfoLoading: false,
            isEditing: false,
            basicInfoList: [
                { tit: '昵称', dataId: 'nickName' },
                { tit: '登录名', dataId: 'name' },
                { tit: '性别', dataId: 'sex' },
                { tit: '账户地址', dataId: 'accountAddress' }, // 新增账户地址字段
                { tit: '积分', dataId: 'points', editable: false } // 新增积分字段，设置为不可编辑
            ],
            workInfoList: [
                { tit: '职务', dataId: 'staffingLevel' },
                { tit: '所在部门', dataId: 'department' },
                { tit: '本级领导', dataId: 'director' },
                { tit: '上级领导', dataId: 'manager' },
                { tit: '父机构', dataId: 'organization' }
            ],
            numberInfoList: [
                { tit: '手机号码', dataId: 'mobileNo' },
                { tit: '办公电话', dataId: 'workPhone' },
                { tit: '邮件地址', dataId: 'email' },
                { tit: '微信号', dataId: 'wechatNo' }
            ],
            dataInfo: null,
            emailError: false,
            phoneError: false,
            debounceTimer: null // 用于防抖
        };
    }

    componentDidMount() {
        this.setState({ dataInfoLoading: true });
        let userName = '';
        if (Cookies.get('userInfo')) {
            try {
                let userInfo = JSON.parse(Cookies.get("userInfo"))
                userName = userInfo.name;
            } catch (e) { }
        }
        const requestUrl = `${evidence.overview}?userName=${encodeURIComponent(userName)}`;
        request().get(requestUrl).then((res) => {
            if (res) {
                switch (res.status) {
                    case 200:
                        this.setState({ dataInfo: res.data });
                        break;
                    case 401:
                        Cookies.remove('token', { path: '' });
                        Cookies.remove('userInfo', { path: '' });
                        Cookies.remove('userName', { path: '' });
                        this.props.history.push("/login");
                        break;
                    default:
                        message.error("获取用户信息失败");
                        break;
                }
                this.setState({ dataInfoLoading: false });
            }
        });
    }

    handleEdit = () => {
        this.setState({ isEditing: true });
    }

    handleSave = () => {
        const { dataInfo, emailError, phoneError } = this.state;

        // 验证所有字段不能为空（排除 points 字段）
        for (const key in dataInfo) {
            if (!dataInfo[key] && key !== 'points') {
                message.error(`${this.getFieldTitle(key)} 不能为空`);
                return;
            }
        }

        // 特殊检查 accountAddress 是否为空
        if (!dataInfo.accountAddress) {
            message.error("账户地址不能为空");
            return;
        }

        // 不检查 points，因为它是不可编辑的
        if (emailError) {
            message.error('请输入有效的邮箱地址');
            return;
        }

        if (phoneError) {
            message.error('请输入有效的手机号码');
            return;
        }

        request().post(evidence.updata, dataInfo).then((res) => {
            if (res && res.status === 200) {
                message.success("信息已保存");
                this.setState({ isEditing: false });
            } else {
                message.error("保存信息失败");
            }
        });
    }

    handleChange = (key, value) => {
        this.setState((prevState) => ({
            dataInfo: {
                ...prevState.dataInfo,
                [key]: value
            }
        }));

        clearTimeout(this.state.debounceTimer); // 清除上一次的延迟验证

        this.setState({
            debounceTimer: setTimeout(() => {
                if (key === 'email') {
                    this.validateEmail(value);
                }
                if (key === 'mobileNo') {
                    this.validatePhoneNumber(value);
                }
            }, 800) // 延迟800ms后再执行验证
        });
    }

    validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.setState({ emailError: true });
            message.error('请输入有效的邮箱地址');
        } else {
            this.setState({ emailError: false });
        }
    }

    validatePhoneNumber = (phoneNumber) => {
        const phoneRegex = /^1[3-9]\d{9}$/;
        if (!phoneRegex.test(phoneNumber)) {
            this.setState({ phoneError: true });
            message.error('请输入有效的手机号码');
        } else {
            this.setState({ phoneError: false });
        }
    }

    getFieldTitle = (key) => {
        const allFields = {
            nickName: '昵称',
            name: '登录名',
            sex: '性别',
            staffingLevel: '职务',
            department: '所在部门',
            director: '本级领导',
            manager: '上级领导',
            organization: '父机构',
            mobileNo: '手机号码',
            workPhone: '办公电话',
            email: '邮件地址',
            wechatNo: '微信号',
            accountAddress: '账户地址', // 新增账户地址标题
            points: '积分' // 新增积分标题
        };
        return allFields[key] || key;
    }

    render() {
        const { isEditing, dataInfo, dataInfoLoading } = this.state;

        if (dataInfoLoading) {
            return <Spin spinning={dataInfoLoading} />;
        }

        return (
            <div className="personalPage">
                <div className="personalChildren">
                    <h1>基本信息</h1>
                    <Divider />
                    <ul>
                        {dataInfo && this.state.basicInfoList.map((item, i) => (
                            <li key={"basicInfoList" + i}>
                                <span>{item.tit}:</span>
                                {isEditing ? (
                                    item.dataId === 'sex' ? (
                                        <Radio.Group
                                            value={dataInfo[item.dataId]}
                                            onChange={(e) => this.handleChange(item.dataId, e.target.value)}
                                        >
                                            <Radio value="male" className="gender-button">男</Radio>
                                            <Radio value="female" className="gender-button">女</Radio>
                                        </Radio.Group>
                                    ) : item.editable === false ? (
                                        <code>{dataInfo[item.dataId] || '暂无'}</code> // 不可编辑的积分
                                    ) : (
                                        <Input
                                            value={dataInfo[item.dataId]}
                                            onChange={(e) => this.handleChange(item.dataId, e.target.value)}
                                            placeholder={`请输入${item.tit}`}
                                        />
                                    )
                                ) : (
                                    <code>{dataInfo[item.dataId] || '暂无'}</code>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="personalChildren">
                    <h1>工作信息</h1>
                    <Divider />
                    <ul>
                        {dataInfo && this.state.workInfoList.map((item, i) => (
                            <li key={"workInfoList" + i}>
                                <span>{item.tit}:</span>
                                {isEditing ? (
                                    <Input
                                        value={dataInfo[item.dataId]}
                                        onChange={(e) => this.handleChange(item.dataId, e.target.value)}
                                        placeholder={`请输入${item.tit}`}
                                    />
                                ) : (
                                    <code>{dataInfo[item.dataId] || '暂无'}</code>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="personalChildren">
                    <h1>通讯信息</h1>
                    <Divider />
                    <ul>
                        {dataInfo && this.state.numberInfoList.map((item, i) => (
                            <li key={"numberInfoList" + i}>
                                <span>{item.tit}:</span>
                                {isEditing ? (
                                    <Input
                                        value={dataInfo[item.dataId]}
                                        onChange={(e) => this.handleChange(item.dataId, e.target.value)}
                                        placeholder={`请输入${item.tit}`}
                                    />
                                ) : (
                                    <code>{dataInfo[item.dataId] || '暂无'}</code>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
                <Button className="button" type="primary" onClick={isEditing ? this.handleSave : this.handleEdit}>
                    {isEditing ? "保存信息" : "修改信息"}
                </Button>
            </div>
        );
    }
}
