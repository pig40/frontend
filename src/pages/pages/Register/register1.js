import React, { Component } from 'react';
import { Form, Input, Button, message } from 'antd';
import _ from 'lodash';
import request from "../../Utils/fecth";
import config from '../../Utils/apiConfig';
import { injectIntl } from "react-intl";

const { api: { UnicomUser } } = config;
const FormItem = Form.Item;

class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      registerLoading: false,
    };
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err) {
        console.log('Validation Errors:', err); // 调试输出错误信息
        return; // 如果有错误，直接返回，不进行后续操作
      }

      console.log('提交的注册信息:', values); // 调试输出
      this.setState({ registerLoading: true });

      // 发送请求
      request().post(UnicomUser.register, {
        name: values.userName,
        email: values.email,
        password: values.password,
      }).then(response => {
        this.setState({ registerLoading: false });

        if (response.status === 200) {
          message.success('注册成功！');
          this.props.history.push('/login'); // 注册成功后跳转到登录页
        } else {
          message.error('注册失败，请重试！');
        }
      }).catch(error => {
        this.setState({ registerLoading: false });
        message.error('请求失败，请重试！');
      });
    });
  };

  render() {
    const intlData = this.props.intl.messages;
    const { getFieldDecorator } = this.props.form;
    const { registerLoading } = this.state;

    return (
      <div className="userOpreate_login">
        <div className="loginPage_image">
          <img className='floating_image' src={require('../../images/user/loginImg.svg')} alt="" />
        </div>
        <div className="login-form">
          <div className="login-form-part">
            <h1>征信数据共享智能交易平台</h1>
            <p className="login-welcome">注册</p>
            <Form onSubmit={this.handleSubmit}>
              <FormItem style={{ marginBottom: "24px" }} className="loginFormItem">
                {getFieldDecorator('userName', {
                  rules: [
                    { required: true, message: '用户名不能为空' },
                    { whitespace: true, message: '用户名不能为空' }, // 新增提示
                  ],
                })(<Input placeholder="请输入用户名" size="large" />)}
              </FormItem>
              <FormItem style={{ marginBottom: "24px" }} className="loginFormItem">
                {getFieldDecorator('email', {
                  rules: [
                    { required: true, message: '邮箱不能为空' }, // 直接设置提示信息
                    { type: 'email', message: '请输入有效的邮箱地址' }, // 邮箱格式检测提示
                    { whitespace: true, message: '邮箱不能为空' }, // 新增提示
                  ],
                })(<Input placeholder="请输入邮箱" size="large" />)}
              </FormItem>
              <FormItem className="loginFormItem loginFormItemPass" style={{ marginBottom: "27px" }}>
                {getFieldDecorator('password', {
                  rules: [
                    { required: true, message: '密码不能为空' }, // 直接设置提示信息
                    { whitespace: true, message: '密码不能为空' }, // 新增提示
                  ],
                })(<Input placeholder="请输入密码" type="password" size="large" />)}
              </FormItem>
              <FormItem className="loginFormItem loginFormItemPass" style={{ marginBottom: "27px" }}>
                {getFieldDecorator('confirmPassword', {
                  rules: [
                    { required: true, message: '确认密码不能为空' }, // 直接设置提示信息
                    {
                      validator: (rule, value, callback) => {
                        const { getFieldValue } = this.props.form;
                        if (value && value !== getFieldValue('password')) {
                          callback('两次输入的密码不一致！');
                        } else {
                          callback();
                        }
                      },
                    },
                    { whitespace: true, message: '确认密码不能为空' }, // 新增提示
                  ],
                })(<Input placeholder="确认密码" type="password" size="large" />)}
              </FormItem>
              <FormItem style={{ marginBottom: "30px" }}>
                <Button loading={registerLoading} style={{ height: "44px", width: "100%", background: "#1890ff" }} type="primary" htmlType="submit" size="large">
                  {intlData.Register}
                </Button>
              </FormItem>
            </Form>
            <p className="registerjump">
              已有账号？<a href="/login">登录</a>
            </p>
          </div>
        </div>
      </div>
    );
  }
}

Register = Form.create()(Register);
export default injectIntl(Register);
