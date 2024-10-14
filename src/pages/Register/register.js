import React, { Component } from 'react';
import { NavLink } from 'react-router-dom'
// import './register.less';
// import '../../styles/reset.less'
import { Form, Input, Button, Row, Col, Checkbox } from 'antd';
import { request } from "../../Utils/axios";
import config from '../../Utils/apiConfig'
import axios from 'axios';
import emailImage from '../../images/user/emailImg.jpg';
import logo from '../../images/logo.svg'
import logoEn from '../../images/logo_en.svg'
import { findRenderedDOMComponentWithClass } from 'react-dom/test-utils';
const { api: { user } } = config
const FormItem = Form.Item;
import { injectIntl } from 'react-intl';

class Register extends Component {
    constructor(props) {
        super(props);
        this.state = {
            confirmDirty: false,
            captchaCode: '',
            passVisible: "none",
            imgSrc: "",
            captchaRes: false,
            passTip: '',
            passConfirmTip: "",
            emailTip: "",
            captchaTip: "",
            choiceAgreement: true,
            agreementTip: ""

        }
    }
    componentDidMount() {
        this.changeCaptcha()
        if (window._hmt) {
            window._hmt.push(['_trackPageview', "/register"]);
        }
    }

    changeCaptcha = () => {
        const _this = this

        const url = `${user.getCaptchaCode}`
        axios(url, { withCredentials: true }).then(res => {
            _this.setState({
                imgSrc: res.data
            })

        }).catch(err => {
            console.log(err)
        })
    }

    handleSubmit = (e) => {
        e.preventDefault();
        const _this = this
        const intlData = this.props.intl.messages;
        const { choiceAgreement } = this.state
        const { form: { getFieldValue } } = this.props
        if (choiceAgreement) {
            _this.setState({
                agreementTip: ""
            })
            if (getFieldValue('password') !== getFieldValue('confirmPassword')) {
                this.setState({
                    passConfirmTip: intlData.service_resetPass_passtip_noSame
                })
            } else {
                this.setState({
                    passConfirmTip: ""
                })

                _this.props.form.validateFieldsAndScroll((err, values) => {
                    const url = `${user.captchaCode.format({ captchaText: this.state.captchaCode })}`
                    if (!err) {
                        axios(url, { withCredentials: true }).then(res => {
                            if (res.data.success) {
                                _this.setState({
                                    captchaRes: true
                                })
                                const option = {
                                    userName: values.userName,
                                    password: values.password
                                }
                                request(`${user.register}`, {
                                    method: 'POST',
                                    body: option
                                }).then((response) => {
                                    if (response.activationCode) {
                                        if (window._hmt) {
                                            window._hmt.push(["_trackEvent", "用户行为", "注册"])
                                        }
                                        const lang = this.props.intl.locale;
                                        let SendEmailOption = null
                                        if (lang === "en") {
                                            SendEmailOption = {
                                                "to": values.userName,
                                                "subject": "Active Zig-BaaS account",
                                                "content": `
                                        <div style="font-weight: normal;width: 100%;height: 100%;margin: 0 auto;border: 1px solid #dbdbdb;">
                                            <div style="background: #4285f4;margin-bottom: 50px;padding: 16px 0 16px 26px;">
                                                <img src=${window.location.protocol}//${window.location.host}${logoEn} style="margin-top: 0px" ></div>
                                            <h1 style="font-size: 16px;color: #031b4c;margin: 10px 0 10px 0;padding-left:26px ">Welcome to Zig-BaaS:</h1>
                                            <h2 style="font-size: 14px;color: #4f5f82;margin: 20px 0 5px 0;padding-left:26px ">Please click the link below to complete verification：</h2>
                                            <a href=${window.location.protocol}//${window.location.host}/activation/${values.userName}?auth_code=${response.activationCode} style="width: 144px;height: 40px;background: #4285f4;display: inline-block;color: #ffffff;font-size: 16px;line-height: 40px;text-decoration: none;border-radius:2px;text-align: center;margin: 20px 0 30px 26px;padding: 0 10px;">VERIFY MY EMAIL ADDRESS</a>
                                            <h3 style="font-size: 16px;color: #4f5f82;margin: 0;padding-left:26px">Or copy the following link to the browser to complete the verification:</h3>
                                            <p style="color: #4285f4;font-size: 14px;word-wrap:break-word;margin: 15px 0 ;padding-left:26px">
                                            <a style="color: #4285f4;font-size: 14px;" href=${window.location.protocol}//${window.location.host}/activation/${values.userName}?auth_code=${response.activationCode}>
                                                    ${window.location.protocol}//${window.location.host}/activation/${values.userName}?auth_code=${response.activationCode}
                                                    </a>
                                            </p>
                                            <h4 style="font-size: 16px;color: #4f5f82;margin: 0 0 5px 0;padding-left:26px">The above link is valid for 48 hours. If it fails, Any question please contact: baas@ziggurat.cn</h4>
                                            <div style="margin-top: 60px;border-top: 1px solid #dbdbdb;width: 100%;height:269px;text-align: center">
                                                <h6 style="text-align: center;color: #4f5f82;font-size: 12px;margin: 10px 0 0 0;width: 100%;">This is a system mail please do not reply © 2018  | Xi’an Ziggurat Internet Technology Ltd. </h6>
                                                <img src=${window.location.protocol}//${window.location.host}${emailImage} style="display:inline-block;margin: 20px auto;width:146px ;height: 146px;border: 1px solid #ccc"/>
                                                <h1 style="text-align: center;color: #b3bac9;font-size: 14px;margin: 0;width: 100%;">Technical support</h1>
                                            </div>
                                        </div>
                                    `
                                            }
                                        } else if (lang === 'zh') {
                                            SendEmailOption = {
                                                "to": values.userName,
                                                "subject": "Zig-BaaS账户激活",
                                                "content": `
                                        <div style="font-weight: normal;width: 100%;height: 100%;margin: 0 auto;border: 1px solid #dbdbdb;">
                                            <div style="background: #4285f4;margin-bottom: 50px;padding: 16px 0 16px 26px;">
                                                <img src=${window.location.protocol}//${window.location.host}${logo} style="margin-top: 0px" ></div>
                                            <h1 style="font-size: 16px;color: #031b4c;margin: 10px 0 10px 0;padding-left:26px ">尊敬的Zig-BaaS用户:</h1>
                                            <h2 style="font-size: 14px;color: #4f5f82;margin: 20px 0 5px 0;padding-left:26px ">请点击以下按钮，完成用户激活。</h2>
                                            <a href=${window.location.protocol}//${window.location.host}/activation/${values.userName}?auth_code=${response.activationCode} style="width: 144px;height: 40px;background: #4285f4;display: inline-block;color: #ffffff;font-size: 16px;line-height: 40px;text-decoration: none;border-radius:2px;text-align: center;margin: 20px 0 30px 26px">用户激活</a>
                                            <h3 style="font-size: 16px;color: #4f5f82;margin: 0;padding-left:26px">或复制以下链接到浏览器中完成验证：</h3>
                                            <p style="color: #4285f4;font-size: 14px;word-wrap:break-word;margin: 15px 0 ;padding-left:26px">
                                            <a style="color: #4285f4;font-size: 14px;" href=${window.location.protocol}//${window.location.host}/activation/${values.userName}?auth_code=${response.activationCode}>
                                                    ${window.location.protocol}//${window.location.host}/activation/${values.userName}?auth_code=${response.activationCode}
                                                    </a>
                                            </p>
                                            <h4 style="font-size: 16px;color: #4f5f82;margin: 0 0 5px 0;padding-left:26px">上述链接48小时内有效，如果失效，请登录Zig-BaaS官网重新注册账号。</h4>
                                            <div style="margin-top: 60px;border-top: 1px solid #dbdbdb;width: 100%;height:269px;text-align: center">
                                                <h6 style="text-align: center;color: #4f5f82;font-size: 12px;margin: 10px 0 0 0;width: 100%;">此为系统邮件请勿回复 © 2018  | 西安纸贵互联网科技有限公司 </h6>
                                                <img src=${window.location.protocol}//${window.location.host}${emailImage} style="display:inline-block;margin: 20px auto;width:146px ;height: 146px;border: 1px solid #ccc"/>
                                                <h1 style="text-align: center;color: #b3bac9;font-size: 14px;margin: 0;width: 100%;">Zig-BaaS技术支持</h1>
                                            </div>
                                        </div>
                                    `
                                            }
                                        }

                                        _this.setState({
                                            emailTip: "",
                                            captchaTip: ""
                                        })
                                        _this.props.history.push({
                                            pathname: '/activation/enter_page',
                                            query: {
                                                userName: values.userName
                                            },
                                        });
                                        request(`${user.sendEmail}`, {
                                            method: 'POST',
                                            body: SendEmailOption
                                        }).then((response) => {
                                            if (response.success) {
                                            } else if (typeof response === 'number' && response === 500) {
                                            }

                                        })
                                    } else if (typeof response === 'number' && response === 409) {
                                        _this.changeCaptcha()
                                        _this.setState({
                                            emailTip: intlData.Register_email_409
                                        })
                                    }
                                })
                            } else {
                                _this.setState({
                                    captchaRes: false,
                                    captchaTip: intlData.Register_code_err
                                })
                            }
                        }).catch(err => {
                            console.log(err)
                        })
                    } else {
                        console.log("err")
                    }


                });
            }

        } else {
            _this.setState({
                agreementTip: intlData.Register_check_agreement
            })
        }
    }


    validateConfirmPassword = (rule, value, callback) => {
        this.setState({
            passConfirmTip: ""
        })
        const intlData = this.props.intl.messages;
        const { form: { getFieldValue } } = this.props
        if (getFieldValue('password')) {
            if (value && value !== getFieldValue('password')) {
                this.setState({
                    passConfirmTip: intlData.service_resetPass_passtip_noSame
                })
            } else {
                this.setState({
                    passConfirmTip: ""
                })
            }
        }
        callback()
    }

    validatorCode = (rule, value, callback) => {
        const intlData = this.props.intl.messages;
        this.setState({
            captchaCode: value,
            captchaTip: ""
        })
        if (value.length < 4) {
            callback(intlData.Register_code_input)
        } else if (value.length > 4) {
            callback(intlData.Register_code_err)
        } else {
            callback()
        }


    }

    //判断输入密码的类型
    CharMode = (iN) => {
        if (iN >= 48 && iN <= 57) //数字
            return 1;
        if (iN >= 65 && iN <= 90) //大写
            return 2;
        if (iN >= 97 && iN <= 122) //小写
            return 4;
        else
            return 8;
    }
    //bitTotal函数
    //计算密码模式
    bitTotal = (num) => {
        let modes = 0;
        for (let i = 0; i < 4; i++) {
            if (num & 1) modes++;
            num >>>= 1;
        }
        return modes;
    }
    //返回强度级别
    checkStrong = (sPW) => {
        if (sPW.length < 6)
            return 0; //密码太短，不检测级别
        let Modes = 0;
        for (let i = 0; i < sPW.length; i++) {
            //密码模式
            Modes |= this.CharMode(sPW.charCodeAt(i));
        }
        return this.bitTotal(Modes);
    }

    //显示颜色
    pwStrength = (rule, pwd, callback) => {
        const intlData = this.props.intl.messages
        const _this = this
        const Dfault_color = "#eef1f5";     //默认颜色
        const L_color = "#f13640";      //低强度的颜色，且只显示在最左边的单元格中
        const M_color = "#f5a623";      //中等强度的颜色，且只显示在左边两个单元格中
        const H_color = "#7ed321";      //高强度的颜色，三个单元格都显示
        let Lcolor = null
        let Mcolor = null
        let Hcolor = null
        this.setState({
            passVisible: "flex"
        })
        if (pwd == null || pwd === '') {
            callback(intlData.Register_password_input)
            _this.setState({
                passVisible: "none",
                passTip: ""
            })
        } else if (pwd.length < 6) {
            callback(intlData.service_resetPass_passtip_digits)
            _this.setState({
                passTip: ""
            })
            Lcolor = Mcolor = Hcolor = Dfault_color;
        }
        else {
            let S_level = this.checkStrong(pwd);
            switch (S_level) {
                case 0:
                    Lcolor = Mcolor = Hcolor = Dfault_color;
                    _this.setState({
                        passTip: ""
                    })
                    break;
                case 1:
                    Lcolor = L_color;
                    Mcolor = Hcolor = Dfault_color;
                    _this.setState({
                        passTip: intlData.service_resetPass_passWeak
                    })
                    break;
                case 2:
                    Lcolor = L_color
                    Mcolor = M_color;
                    Hcolor = Dfault_color;
                    _this.setState({
                        passTip: intlData.service_resetPass_passMedium
                    })
                    break;
                default:
                    Lcolor = L_color
                    Mcolor = M_color
                    Hcolor = H_color;
                    _this.setState({
                        passTip: intlData.service_resetPass_passStrong
                    })
            }
            callback()
            const { form: { getFieldValue } } = this.props
            if (getFieldValue('confirmPassword')) {
                if (pwd && pwd !== getFieldValue('confirmPassword')) {
                    this.setState({
                        passConfirmTip: intlData.service_resetPass_passtip_noSame
                    })
                } else {
                    this.setState({
                        passConfirmTip: ""
                    })
                }
            }
        }
        document.getElementById("strength_L").style.background = Lcolor;
        document.getElementById("strength_M").style.background = Mcolor;
        document.getElementById("strength_H").style.background = Hcolor;
        return;
    }

    handleChange = (e) => {
        this.setState({
            choiceAgreement: e.target.checked,
            agreementTip: ""
        })

    }

    email_RegisterValidator = (rule, value, callback) => {
        this.setState({
            emailTip: ""
        })
        callback()
    }
    render() {
        const intlData = this.props.intl.messages
        const { getFieldDecorator } = this.props.form;

        const formItemLayout = {
            labelCol: {
                xs: { span: 6 },
                sm: { span: 6 },
                lg: { span: 6 }
            },
            wrapperCol: {
                xs: {
                    span: 16,
                    offset: 4
                },
                lg: {
                    span: 16,
                    offset: 4
                },
                xl: {
                    span: 16,
                    offset: 4
                },
            },
        };

        return (
            <div className="userOpreate">
                <div className="opreateImg">
                    <div className="opreateLogo"><img onClick={() => { this.props.history.push({ pathname: "/index" }) }} style={{ cursor: "pointer" }} src={this.props.intl.locale === 'en' ? require('../../images/logo_en.svg') : require('../../images/user/logo.svg')} alt="" /></div>
                    <div className="opreateLetter">
                        <h2>{intlData.Welcome}</h2>
                        <p>{intlData.Home_Banner_Dese}</p>
                    </div>
                    <img className="userOpreateImg" src={require('../../images/user/userOpreate.svg')} alt="" />
                </div>
                <div className="opreateForm" >
                    <h3 className="registerjump"><span>{intlData.Already_Have}</span><NavLink to="/login">{intlData.Login}</NavLink></h3>
                    <Form onSubmit={this.handleSubmit}>
                        <h5>{intlData.Register}</h5>
                        <FormItem
                            {...formItemLayout}
                            style={{ marginBottom: "0px" }}
                            className="loginFormItem"
                        >
                            {getFieldDecorator('userName', {
                                rules: [{
                                    type: 'email', message: intlData.formal_verification_email_tip,
                                }, {
                                    required: true, message: intlData.Register_email_input_valid,
                                }, {
                                    validator: this.email_RegisterValidator,
                                }],
                            })(
                                <Input placeholder={intlData.Email_Address} size="large" />
                            )}
                        </FormItem>
                        <code>{this.state.emailTip}</code>
                        <FormItem
                            {...formItemLayout}
                            style={{ marginBottom: "20px" }}
                            className="passConfirm"
                        >
                            {getFieldDecorator('password', {
                                rules: [
                                    {
                                        validator: this.pwStrength,
                                    }],
                            })(
                                <Input placeholder={intlData.Password} type="password" size="large" />
                            )}
                            <div className="passCaptchaBox" style={{ display: this.state.passVisible }}>
                                <span style={{ flex: "1" }} id="strength_L"> </span>
                                <span style={{ flex: "1", margin: "0 5px" }} id="strength_M"> </span>
                                <span style={{ flex: "1" }} id="strength_H"> </span>
                                <b className="passTip">{this.state.passTip}</b>
                            </div>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            style={{ marginBottom: "2px" }}
                            className="loginFormItem"
                        >
                            {getFieldDecorator('confirmPassword', {
                                rules: [{
                                    required: true, message: intlData.service_resetPass_confirm_new,
                                }, {
                                    validator: this.validateConfirmPassword,
                                }],
                            })(
                                <Input placeholder={intlData.Password_Confirmation} type="password" size="large" />
                            )}
                        </FormItem>
                        <code style={{ top: "-3px" }}>{this.state.passConfirmTip}</code>
                        <FormItem
                            {...formItemLayout}
                            className="loginFormItem registerCaptcha"
                            style={{ marginBottom: "10px" }}
                        >
                            <Row gutter={24}>
                                {getFieldDecorator('captcha', {
                                    initialValue: '',
                                    rules: [
                                        {
                                            validator: this.validatorCode
                                        }
                                    ],
                                })(
                                    <Col span={16}>
                                        <Input placeholder={intlData.Verification_Code} type='text' size="large" />
                                    </Col>
                                )}
                                <Col span={8} className="captchaImgZindex">

                                    <div className="captchaImg" onClick={this.changeCaptcha} dangerouslySetInnerHTML={{ __html: this.state.imgSrc }}>
                                    </div>
                                    <span></span>
                                </Col>
                            </Row>
                        </FormItem>
                        <code>{this.state.captchaTip}</code>
                        <FormItem
                            {...formItemLayout}
                            className="captchaTip"
                            style={{ marginBottom: "0" }}
                        >
                            <Checkbox defaultChecked={true} checked={this.state.choiceAgreement} size="large" onChange={this.handleChange}>{intlData.Accept} </Checkbox><NavLink to="/agreement" target="_blank">《{intlData.Protocol}》</NavLink>
                            {
                                this.state.choiceAgreement ? ("") : (
                                    <span style={{ fontSize: '14px', display: 'block', color: '#f5222d' }}> </span>
                                )
                            }
                        </FormItem>
                        <code style={{ top: "-12px" }}>{this.state.agreementTip}</code>
                        <FormItem
                            {...formItemLayout}
                        >
                            <Button type="primary" htmlType="submit" size="large">
                                {intlData.Register}
                            </Button>
                        </FormItem>
                    </Form>

                    <h4>Copyright © 2018  | {intlData.Footer_Company_Name} | {intlData.Footer_Beian}</h4>
                </div>
            </div>
        );
    }
}
Register = Form.create()(Register)
export default injectIntl(Form.create()(Register));