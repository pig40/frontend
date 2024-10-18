import React, { Component } from 'react';
import './pointsRecharge.less';
import { Divider, Input, Button, message, Select } from 'antd';
import request from '../../../../Utils/fecth'; // 需确保 fecth 文件中的 request 是正确的 axios 实例或类似的 HTTP 客户端
import apiConfig from "../../../../Utils/apiConfig";

const { api: { recharge } } = apiConfig;
const { Option } = Select;

export default class RechargePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      amount: '',
      paymentMethod: 'wechat', // 默认支付方式
      isLoading: false,
      pointsPerRMB: 10, // 假设 100 积分 = 10 RMB
    };
  }

  handleAmountChange = (e) => {
    const value = e.target.value;
    if (!isNaN(value)) { // 只允许输入数字
      this.setState({ amount: value });
    } else {
      message.error('请输入有效的金额');
    }
  }

  handlePaymentMethodChange = (value) => {
    this.setState({ paymentMethod: value });
  }

  handleRecharge = () => {
    const { amount, paymentMethod } = this.state;

    if (!amount || parseFloat(amount) <= 0) {
      message.error('请输入有效的充值金额');
      return;
    }

    this.setState({ isLoading: true });

    // 发起充值请求
    request.post(recharge.submit, { amount, paymentMethod }).then((res) => {
      if (res && res.status === 200) {
        message.success('充值成功');
        // 其他成功后的操作
      } else {
        message.error('充值失败，请稍后再试');
      }
      this.setState({ isLoading: false });
    }).catch(() => {
      message.error('网络错误，请稍后再试');
      this.setState({ isLoading: false });
    });
  }

  calculatePoints = () => {
    const { amount, pointsPerRMB } = this.state;
    if (!amount || isNaN(amount)) {
      return 0;
    }
    return (parseFloat(amount) * pointsPerRMB).toFixed(2); // 保留两位小数
  }

  render() {
    const { amount, paymentMethod, isLoading } = this.state;
    const points = this.calculatePoints(); // 计算积分

    return (
      <div className="rechargePage">
        <h1>积分充值</h1>
        <Divider />

        <div className="rechargeSection">
          <span>充值金额：</span>
          <Input
            value={amount}
            onChange={this.handleAmountChange}
            placeholder="请输入充值金额"
          />
        </div>

        <div className="rechargeSection">
          <span>支付方式：</span>
          <Select
            value={paymentMethod}
            onChange={this.handlePaymentMethodChange}
          >
            <Option value="wechat">微信支付</Option>
            <Option value="alipay">支付宝支付</Option>
          </Select>
        </div>

        <div className="pointsSection">
          <h2>积分提示</h2>
          <Divider />
          <p>100积分等于10元人民币</p>
          <p>当前充值金额可获得：<strong>{points}</strong> 积分</p>
        </div>

        <Button
          className="rechargeButton"
          type="primary"
          onClick={this.handleRecharge}
          loading={isLoading}
        >
          确认充值
        </Button>
      </div>
    );
  }
}
