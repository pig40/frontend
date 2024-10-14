import React, { Component } from 'react';
import { Form, Input, Button, message, Modal } from 'antd';
import _ from 'lodash'
// import { request } from '../../Utils/axios';
import request from "../../Utils/fecth";
import config from '../../Utils/apiConfig'
import Cookies from 'js-cookie'
import { injectIntl } from "react-intl";
const { api: { UnicomUser } } = config
const FormItem = Form.Item;

class Login extends Component {

    constructor(props) {
        super(props);
        this.state = {
            emailTip: "",
            passwordTip: "",
            loginLoading: false,
            UInfo: true,
            forgetPasModalVisible: false
        }
    }

    handleClickFn = (val) => {
        this.setState({
            forgetPasModalVisible: val
        })
    }

    // U盾测试
    getUserStatus = () => {
        request(UnicomUser.UTest).then((response) => {
            if (typeof response === 'number') {
                this.setState({
                    UInfo: false
                })
            } else {
                if (response.status === 1) {
                    this.setState({
                        UInfo: false
                    })
                } else if (response.status === 0) {
                    this.setState({
                        UInfo: true
                    })
                }
            }
        })
    }
    check = () => {
        if (sessionStorage.getItem('userInfo')) {
            this.props.history.push('/dashboard')
        }
    }
    componentDidMount() {
        if (window._hmt) {
            window._hmt.push(['_trackPageview', "/login"]);
        }
        this.check()
    }
    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({
                    loginLoading: true
                })
                request().post(UnicomUser.login, {
                    "name": values.userName,
                    "password": values.password
                }).then(response => {
                    if (_.get(response, 'status') === 200) {
                        this.setState({
                            loginLoading: false
                        })
                        Cookies.set('token', response.data.token)
                        Cookies.set('userInfo', JSON.stringify({ name: values.userName }))
                        this.props.history.push('/dashboard')
                    } else {
                        this.setState({
                            loginLoading: false,
                        })
                        if (_.get(response, 'status') !== 403) {
                            message.error(_.get(response, 'data.message', '').includes('User does not exist') ? '用户名不存在！' : "用户名密码错误！")
                        }
                        if (_.get(response, 'status') === 403) {
                            message.error("用户名密码错误！")
                        }
                        Cookies.remove('token');
                        Cookies.remove('userInfo')
                    }

                })
            }
        });
    }
    componentWillUnmount() {
        this.setState = () => { }
    }
    render() {
        const intlData = this.props.intl.messages
        const { getFieldDecorator } = this.props.form;
        const { loginLoading, UInfo, forgetPasModalVisible } = this.state

        return (
            <div className="userOpreate_login">
                <div className="loginPage_image">
                    <img className='floating_image' src={require('../../images/user/loginImg.svg')} alt="" />
                </div>
                <div className="login-form">
                    <div className="login-form-part">
                        <h1>登录</h1>
                        <p className="login-welcome">欢迎登陆征信数据共享智能交易平台</p>
                        <Form onSubmit={this.handleSubmit}>
                            <FormItem
                                style={{ marginBottom: "24px" }}
                                className="loginFormItem"
                            >
                                {getFieldDecorator('userName', {
                                    rules: [{
                                        required: true,
                                        message: intlData.Register_email_input,
                                    },
                                    {
                                        whitespace: true,
                                        message: intlData.Register_email_input,
                                    }
                                    ],
                                })(
                                    <Input className={UInfo ? "" : "invalid"} disabled={UInfo ? false : true} prefix={<img src={UInfo ? require("../../images/user/Utrue.svg") : require("../../images/user/Ufalse.svg")} />} placeholder={UInfo ? "请输入用户名" : "未检测到U盾，请检查U盾是否插入计算机"} size="large" />
                                )}
                            </FormItem>
                            {/*<code style={{position:"relactive",top:'-10px'}}>{this.state.emailTip}</code>*/}
                            <FormItem
                                className="loginFormItem loginFormItemPass"
                                style={{ marginBottom: "27px" }}
                            >
                                {getFieldDecorator('password', {
                                    rules: [{
                                        required: true, message: intlData.Register_password_input,
                                    }, {
                                        whitespace: true,
                                        message: intlData.Register_password_input,
                                    }],
                                })(
                                    <Input prefix={<img src={require("../../images/user/passTrue.svg")} />} placeholder={intlData.Password} type="password" size="large" />
                                )}
                            </FormItem>
                            {/*<code>{this.state.passwordTip}</code>*/}
                            <FormItem
                                style={{ marginBottom: "30px" }}
                            >
                                <Button loading={loginLoading} style={{ height: "44px", width: "100%", background: "#1890ff" }} type="primary" htmlType="submit" size="large">
                                    {intlData.Login}
                                </Button>
                            </FormItem>
                        </Form>
                        <span className="registerjump">
                            如果您还没有账户，请 <a href="/register">注册</a>
                        </span>
                        <p className="login-forget"><span onClick={() => { this.handleClickFn(true) }}>忘记密码?</span></p>
                        {/*<p className="login-tip">*/}
                        {/*<span>温馨提示：</span>*/}
                        {/*<span>请在计算机中插入U盾后，输入您的密码即可登录到系统中。</span>*/}
                        {/*</p>*/}
                    </div>
                    <Modal
                        title="忘记密码"
                        visible={forgetPasModalVisible}
                        onOk={() => { this.handleClickFn(false) }}
                        onCancel={() => { this.handleClickFn(false) }}
                        className="login-forgetPas-modal"
                        width="484px"
                        footer={[<Button key="btn" type="primary" onClick={() => { this.handleClickFn(false) }}>确定</Button>,]}
                        style={{ position: "absolute", left: "50%", top: "50%", marginLeft: "-242px", marginTop: "-135px" }}
                    >
                        <p>请联系客服</p>
                        <p>2893482764@163.com</p>
                    </Modal>
                </div>
            </div>
        );
    }
}
Login = Form.create()(Login)
export default injectIntl(Login);
