import React, { Component } from 'react';
import axios from "axios";
import { Form, Input, Select, Upload, message, Spin, Button } from 'antd'
import _ from 'lodash'

import FirstButton from '../../../../../../component/button/CustomeButtonSecond'
import apiConfig from '../../../../../../Utils/apiConfig'
import './AddData.less'
import request from "../../../../../../Utils/fecth";
import { get } from '../../../../../../Utils/request'
import Cookies from "js-cookie";

const { api: { allDataPage } } = apiConfig
const Option = Select.Option
let CancelToken = axios.CancelToken;
let cancel = null;

//新增数据
class AddData extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isEdit: false,
            loading: false,
            fileName: "",
            fileSize: "",
            fileUrl: '',
            requestLoading: false,
            dataTypeArr: [],
            dataLevelArr: [],
            detail: null,
            data: {},
        }
    }

    componentDidMount() {
        //判断为编辑
        this.props.match.params.id && this.getDetail(this.props.match.params.id)
        // 获取数据类型
        this.getDataTypeFn()
        // 获取数据密级
        this.getDataLevel()
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
                    default:
                        message.error("数据类型获取失败")
                        break;

                }
            }
        })
    }

    // 获取数据密级
    getDataLevel = () => {
        request().get(allDataPage.level.format({ type: 'confidential-level' })).then(res => {
            if (res) {
                switch (res.status) {
                    case 200:
                        this.setState({
                            dataLevelArr: res.data
                        })
                        break;
                    default:
                        message.error("数据密级获取失败")
                        break;

                }
            }
        })
    }

    // 获取当前编辑数据存证的info
    getDetail = async (id) => {
        this.setState({
            loading: true
        })
        let res = await get(allDataPage.detail.format({ id: id }))

        if (res.status === 401 || _.get(res, 'data.message', '').includes('jwt')) {
            return this.props.history.push({
                pathname: '/login'
            })
        }
        if (res.status === 200) {
            const { fileName, fileSize, fileUrl, ...rest } = res.data
            this.version = res.data.version
            this.setState({
                isEdit: true,
                fileName,
                loading: false,
                fileSize,
                fileUrl,
                data: rest
            })

            // console.log('rest',rest)
            // Object.keys(rest).map(element => {
            //     this.props.form.setFieldsValue({
            //         [element]: _.get(rest, `${element}`)
            //     })
            // })
        } else {
            this.setState({
                isEdit: false,
                loading: false,
            })
        }
    }

    //取消
    handleCancel = () => {
        this.props.form.resetFields()
        cancel && cancel();
        this.props.handleCancel && this.props.handleCancel()
    }

    //提交
    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                if (this.state.isEdit && values.version === this.version) {
                    return message.error('两次版本号相同，请重新输入！')
                }

                this.setState({
                    requestLoading: true
                })

                let obj = Object.assign({
                    ...values,
                    price: Number(values.price),
                    description: values.description || ""
                }, {
                    fileName: this.state.fileName,
                    fileSize: this.state.fileSize,
                    fileUrl: this.state.fileUrl
                })
                this.state.isEdit ?
                    // 从列表进入更新数据
                    request().put(allDataPage.updateData, Object.assign(obj, { id: this.props.match.params.id }), {
                        cancelToken: new CancelToken(function executor(c) {
                            cancel = c;
                        })
                    }).then(res => {
                        this.setState({
                            requestLoading: false
                        })
                        if (res.status === 200) {
                            message.success('更新成功！')
                            this.props.history.goBack()
                        } else if (res.status === 500) {

                            if (_.get(res, 'data.message', '').includes('No permission to add')) {
                                let confidentialLevel = this.state.dataLevelArr.filter(element => {
                                    return element.id === values.confidentialLevel
                                })
                                let name = confidentialLevel && confidentialLevel.length ? confidentialLevel[0].name : ''
                                message.error(`抱歉，您没有将该条数据的数据密级更新为${name}的权限！`)
                            } else if (_.get(res, 'data.message', '').includes('Unable to update others')) {
                                message.error(`抱歉，您不能更新其他人的数据！`)
                            } else {
                                message.error('服务器错误，请稍后再试！')
                            }

                        }
                        else if (res.status === 401) {
                            let confidentialLevel = this.state.dataLevelArr.filter(element => {
                                return element.id === values.confidentialLevel
                            })
                            let name = confidentialLevel && confidentialLevel.length ? confidentialLevel[0].name : ''
                            message.error(`抱歉，您没有将该条数据的数据密级更新为${name}的权限！`)
                        }
                        else {
                            message.error('更新失败！')

                        }
                    })
                    :
                    // 添加数据
                    request().post(allDataPage.addData, obj, {
                        cancelToken: new CancelToken(function executor(c) {
                            cancel = c;
                        })
                    }).then(res => {
                        if (res.status === 200) {
                            this.props.history.goBack()
                        } else if (res.status === 401) {
                            let confidentialLevel = this.state.dataLevelArr.filter(element => {
                                return element.id === values.confidentialLevel
                            })
                            let name = confidentialLevel && confidentialLevel.length ? confidentialLevel[0].name : ''
                            message.error(`抱歉，您没有新建数据密级为${name}的权限！`)
                        }
                        if (res.status === 500) {

                            if (_.get(res, 'data.message', '').includes('No permission to add')) {
                                let confidentialLevel = this.state.dataLevelArr.filter(element => {
                                    return element.id === values.confidentialLevel
                                })
                                let name = confidentialLevel && confidentialLevel.length ? confidentialLevel[0].name : ''
                                message.error(`抱歉，您没有新建数据密级为${name}的权限！`)
                            } else {
                                message.error('服务器错误，请稍后再试！')
                            }

                        }
                        this.setState({
                            requestLoading: false
                        })
                    })

            }
        });
    }

    onChangeUpload = (info) => {
        if (info.file.status !== 'uploading') {

        }
        if (info.file.status === 'done') {
            message.success(`${info.file.name} 文件上传成功`);
            this.props.form.setFieldsValue({
                fileHash: info.file.response.filehash,
            })
            this.setState({
                fileName: info.file.response.filename,
                fileSize: info.file.response.filesize,
                fileUrl: info.file.response.fileurl,
                fileHash: info.file.response.fileHash
            })
        } else if (info.file.status === 'error') {
            message.error(`${info.file.name} 文件上传失败`);
        }

    }

    componentWillUnmount() {
        cancel && cancel()
        this.setState = () => {
            return;
        }
    }

    validatorDataPriceFn = (rule, value, callback) => {
        if (value) {
            if (isNaN(value)) {
                callback("请输入数字")
            } else {
                callback()
            }
        } else {
            callback("请输入价格")
        }
    }
    //before upload image
    beforeUpload = file => {
        const isLt10M = file.size / 1024 / 1024 < 10;
        if (!isLt10M) {
            return message.error("上传文件已超过10MB，请重新上传！");
        }
        return true;
    };
    renderOption = (flag) => {
        return (
            this.state[flag].map((item) => {
                return (
                    <Option key={item.id}>{item.name}</Option>
                )
            })

        )
    }
    render() {
        const { getFieldDecorator } = this.props.form;
        const { requestLoading, } = this.state
        const params = {
            name: 'file',
            headers: { 'authorization': `Bearer ${Cookies.get('token')}`, },
            showUploadList: false,
            beforeUpload: this.beforeUpload,
            action: allDataPage.uploadFile,
            onChange: this.onChangeUpload,
        };



        return (

            <div className="addData-page" id='area'>
                <Spin spinning={this.state.loading}>
                    <Form hideRequiredMark className="addData-form" onSubmit={this.handleSubmit}>
                        <Form.Item
                            label={'数据名称'}
                            colon={false}
                            className="FormItemLayout"
                        >
                            {getFieldDecorator('name', {
                                rules: [{ required: true, message: '请输入数据名!' }],
                                initialValue: _.get(this.state.data, 'name', undefined)
                            })(
                                <Input className="input" autoComplete='off' placeholder="请输入数据名" />
                            )}
                        </Form.Item>
                        <Form.Item
                            label={'版本'}
                            colon={false}
                            className="FormItemLayout"
                        >
                            {getFieldDecorator('version', {
                                rules: [{ required: true, message: '请输入版本!' }],
                                initialValue: _.get(this.state.data, 'version', undefined)
                            })(
                                <Input className="input" autoComplete='off' placeholder="请输入版本，例如 V 0.1" />
                            )}
                        </Form.Item>
                        {/* <div id='datatype'>
                            <Form.Item
                                label={'数据类型'}
                                colon={false}
                            >
                                {getFieldDecorator('type', {
                                    rules: [{ required: true, message: '请选择数据类型' }],
                                    initialValue: _.get(this.state.data, 'type', undefined)
                                })(

                                    <Select
                                        className="select"
                                        placeholder="请选择数据类型"
                                        getPopupContainer={() => document.getElementById(`datatype`)}
                                        suffixIcon={
                                            <div className='triangle'></div>
                                        }
                                    >
                                        {this.renderOption('dataTypeArr')}
                                    </Select>
                                )}
                            </Form.Item>
                        </div> */}
                        {/* <div id='secret'>
                            <Form.Item
                                label="数据密级"
                                colon={false}
                            >
                                {getFieldDecorator('confidentialLevel', {
                                    rules: [{ required: true, message: '请选择密级' }],
                                    initialValue: _.get(this.state.data, 'confidentialLevel', undefined)
                                })(

                                    <Select
                                        className="select"
                                        placeholder="请选择密级"
                                        suffixIcon={
                                            <div className='triangle'></div>
                                        }
                                        getPopupContainer={() => document.getElementById('secret')}
                                    >
                                        {this.renderOption('dataLevelArr')}
                                    </Select>

                                )}
                            </Form.Item>
                        </div> */}

                        <Form.Item
                            label={'上传文件'}
                            colon={false}
                            className='upload-form-item'
                        >
                            {getFieldDecorator('fileHash', {
                                rules: [{ required: true, message: '请上传文件!' }],
                                initialValue: _.get(this.state.data, 'fileHash', undefined)
                            })(
                                <Input readOnly placeholder="上传文件后显示数据哈希" className="input file"
                                    style={{ backgroundColor: '#f6f7fb', overflow: 'scroll' }} autoComplete='off' />
                            )}
                            <Upload
                                {...params}
                            >
                                <FirstButton style={{
                                    marginLeft: 10,
                                    width: 60,
                                    padding: 0,
                                    height: 36,
                                    borderRadius: 4,
                                    lineHeight: '36px'
                                }}
                                    text={'上传'} />
                            </Upload>
                        </Form.Item>
                        <Form.Item
                            label="数据价格"
                            colon={false}
                        >
                            {getFieldDecorator('price', {
                                rules: [
                                    {
                                        validator: this.validatorDataPriceFn
                                    }
                                ],
                                initialValue: _.get(this.state.data, 'price', undefined)
                            })(
                                <Input
                                    className="input dataPriceInput"
                                    autoComplete='off'
                                    style={{ padding: 0 }}
                                    placeholder='请输入数据价格'
                                    suffix="积分" />
                            )}
                        </Form.Item>
                        {/* <Form.Item
                            label={'是否需申请'}
                            colon={false}
                        >
                            {getFieldDecorator('needApply', {
                                rules: [{ required: true, message: '请选择!' }],
                                initialValue: _.get(this.state.data, 'needApply', true)
                            })(
                                <RadioGroup>
                                    <Radio value={true}>是</Radio>
                                    <Radio value={false}>否</Radio>
                                </RadioGroup>
                            )}
                        </Form.Item> */}
                        {/* <Form.Item
                            label={'描述'}
                            colon={false}
                            style={{ alignItems: 'flex-start  ' }}
                        >
                            {getFieldDecorator('description', { initialValue: _.get(this.state.data, 'description', undefined) })(
                                <TextArea rows={6} autoComplete='off' placeholder="数据描述（选填）"

                                    style={{ width: '100%', border: 'solid 1px #e2e8f3' }}
                                    className='description' />
                            )}
                        </Form.Item> */}
                        <Form.Item style={{ marginTop: '48px' }}>
                            <Button
                                className='submit'
                                loading={requestLoading}
                                type="primary"
                                htmlType="submit">确认并提交</Button>
                            <Button
                                className='cancel'
                                disabled={requestLoading}
                                onClick={() => {
                                    this.props.history.push('/dashboard/data_deposit/all_data')
                                }}>取消</Button>
                        </Form.Item>
                    </Form>
                </Spin>

            </div>
        );
    }
}

export default Form.create()(AddData)
