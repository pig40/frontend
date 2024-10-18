import React, { Component } from 'react'
import { Form, Input, Select, message, Button } from 'antd'
import request from "../../../../../../Utils/fecth";
import apiConfig from "../../../../../../Utils/apiConfig";
import "./index.less"
import Cookies from "js-cookie";

const { api: { allDataPage, infringement } } = apiConfig
const Option = Select.Option


class AddInfringement extends Component {
    constructor(props) {
        super(props)
        this.state = {
            dataTypeArr: [],
            addLoading: false
        }
    }

    // 获取数据类型
    getDataTypeFn = () => {
        request().get(allDataPage.level.format({ type: 'type' })).then(res => {
            if (res) {
                switch (res.status) {
                    case 200:
                        this.setState({
                            dataTypeArr: res.data
                        })
                        break;
                    case 401:
                        Cookies.remove('token');
                        Cookies.remove('userInfo');
                        Cookies.remove('userName');
                        this.props.history.push("/login")
                        break;
                    default:
                        message.error("数据类型获取失败")
                        break;

                }
            }
        })
    }

    componentDidMount() {
        // 获取数据类型
        this.getDataTypeFn()
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {

            if (!err) {
                this.setState({
                    addLoading: true
                })
                request().post(infringement.addData, values).then((res) => {
                    console.log(res)
                    if (res) {
                        switch (res.status) {
                            case 200:
                                message.success("新增存证成功")
                                this.props.history.push("/dashboard/infringementDeposit")
                                break;
                            case 401:
                                Cookies.remove('token');
                                Cookies.remove('userInfo');
                                Cookies.remove('userName');
                                this.props.history.push("/login")
                                break;
                            default:
                                message.error("新增存证失败")
                                break;
                        }
                        this.setState({
                            addLoading: false
                        })
                    }
                })
            }
        });
    }

    render() {
        const { dataTypeArr, addLoading } = this.state
        let userName = '';
        const { getFieldDecorator } = this.props.form;
        const dataTypeItem = dataTypeArr && dataTypeArr.length ? dataTypeArr.map((item) => {
            return (
                <Option key={item.id}>{item.name}</Option>
            )
        }) : []
        if (Cookies.get('userInfo')) {
            try {
                let userInfo = JSON.parse(Cookies.get("userInfo"))
                userName = userInfo.name;
            } catch (e) {
            }
        }
        return (
            <div className="AddInfringement-part">
                <Form hideRequiredMark className="AddInfringement-form" onSubmit={this.handleSubmit}>
                    <Form.Item
                        label={'数据名称'}
                        colon={false}
                    >
                        {getFieldDecorator('name', {
                            rules: [{ required: true, message: '请输入数据名!' }],
                        })(
                            <Input className="input" autoComplete='off' placeholder="请输入数据名" />
                        )}
                    </Form.Item>
                    <div id='datatype'>
                        <Form.Item
                            label={'数据类型'}
                            colon={false}
                        >
                            {getFieldDecorator('type', {
                                rules: [{ required: true, message: '请选择数据类型!' }],
                            })(
                                <Select
                                    className="select"
                                    placeholder="请选择数据类型"
                                    getPopupContainer={() => document.getElementById(`datatype`)}
                                    suffixIcon={
                                        <div className='triangle'></div>
                                    }
                                >
                                    {dataTypeItem}
                                </Select>
                            )}
                        </Form.Item>
                    </div>
                    <Form.Item
                        label={'侵权URL'}
                        colon={false}
                    >
                        {getFieldDecorator('url', {
                            rules: [{ required: true, message: '请输入侵权URL!' }],
                        })(
                            <Input className="input" autoComplete='off' placeholder="请输入侵权URL" />
                        )}
                    </Form.Item>
                    <Form.Item
                        label={'存证用户'}
                        colon={false}
                    >
                        <Input readOnly className="input" defaultValue={userName} />
                    </Form.Item>
                    <Form.Item style={{ marginTop: '48px' }}>
                        <Button
                            className='submit'
                            loading={addLoading}
                            type="primary"
                            htmlType="submit">确认并提交</Button>
                        <Button
                            className='cancel'
                            disabled={addLoading}
                            onClick={() => {
                                this.props.history.go(-1)
                            }}>取消</Button>
                    </Form.Item>
                </Form>
            </div>
        )
    }
}

AddInfringement = Form.create()(AddInfringement)
export default AddInfringement
