import React, {Component} from "react"
import {Divider, Form, Input, Upload, Button, Icon, Steps} from 'antd'
import "./index.less"
import request from '../../../../../../Utils/fecth'
import apiConfig from "../../../../../../Utils/apiConfig";
import Cookies from "js-cookie";
import {message} from "antd/lib/index";

const Step = Steps.Step;

const {api: {infringement}} = apiConfig

class InfringementValidation extends Component {
    constructor(props) {
        super(props)
        this.state = {
            validationLoading: false,
            credential: "",
            validateResultData: null,
            validateResult: [
                {
                    id: "Valid Auditor Signature",
                    tit: "有效的审核签名",
                    status: null
                },
                {
                    id: "Valid Proof File Format",
                    tit: "有效的证明文件格式",
                    status: null
                },
                {
                    id: "Valid decrypted response content",
                    tit: "有效的解密响应内容",
                    status: null
                },
                {
                    id: "Valid encrypted server response",
                    tit: "有效的加密服务器响应",
                    status: null
                },
                {
                    id: "Valid server certificate chain",
                    tit: "有效的解密响应内容",
                    status: null
                },
                {
                    id: "Valid server pub key",
                    tit: "有效的服务器公钥",
                    status: null
                }
            ],
            IconType: {
                "success": {
                    type: "finish",
                    color: "#52c41a",
                    tit: "验证成功",
                    icon: "check-circle"
                },
                "error": {
                    type: "error",
                    color: "#f5222a",
                    tit: "验证失败",
                    icon: "close-circle"
                },
                "loading": {
                    type: "wait",
                    color: "rgba(17, 46, 84, 0.05)",
                    tit: "正在验证",
                    icon: "loading"
                }
            },
            validateResultList: [],
            lastStatus: true,
            uploadLoading:false
        }
    }

    //before upload image
    beforeUpload = file => {
        this.setState({
            uploadLoading:true
        })
        const isLt10M = file.size / 1024 / 1024 < 10;
        if (!isLt10M) {
            return message.error("上传文件已超过10MB，请重新上传！");
        }
        return true;
    };

    // 上传文件
    onChangeUpload = (info) => {
        if (info.file.status !== 'uploading') {

        }
        if (info.file.status === 'done') {
            message.success(`${info.file.name} 文件上传成功`);
            this.props.form.setFieldsValue({
                credential: info.file.response.credential,
            })
            this.setState({
                lastStatus:true,
                validateResultList: [],
                uploadLoading:false,
                credential: info.file.response.credential
            })
        } else if (info.file.status === 'error') {
            message.error(`${info.file.name} 文件上传失败`);
            this.setState({
                uploadLoading:false
            })
        }

    }

    // 验证文件
    validateFileFn = () => {
        const {credential, validateResult, IconType} = this.state
        if (credential) {
            this.setState({
                lastStatus:true,
                validateResultList: [],
                validationLoading: true,
            })
            request().get(infringement.validate.format({name: credential})).then((res) => {
                const data = res.data || null
                if(data){
                    validateResult.map((item) => {
                        if (data[item.id]) {
                            item.status = IconType["success"]
                        } else {
                            item.status = IconType["error"]
                            this.setState({
                                lastStatus: false
                            })
                        }
                    })
                }
                this.setState({
                    validateResult,
                    validateResultData: data
                }, function () {
                    this.getValidateResultData()
                })
            })
        } else {
            message.warn("请先上传文件")
        }
    }

    //
    getValidateResultData = () => {
        const {validateResultData, validateResult, IconType, lastStatus} = this.state
        let timer;
        let count = 0
        const _this = this
        if (validateResultData) {
            timer = setInterval(function () {
                const {validateResultList} = _this.state
                if (count > validateResult.length) {
                    _this.setState({
                        validationLoading: false
                    })
                    clearInterval(timer)
                } else {
                    if (count === validateResult.length) {
                        validateResultList[count - 1].status = validateResultData[validateResult[count - 1].id] ? IconType["success"] : IconType["error"]
                        validateResultList.push({
                            // tit: lastStatus ? "验证成功" : "验证失败",
                            status: IconType["loading"]
                        })
                    } else {
                        if (count === 0) {
                            validateResultList.push(Object.assign({}, {...validateResult[count]}, {status: IconType["loading"]}))
                        } else {
                            validateResultList[count - 1].status = validateResultData[validateResult[count - 1].id] ? IconType["success"] : IconType["error"]
                            validateResultList.push(Object.assign({}, {...validateResult[count]}, {status: IconType["loading"]}))
                        }
                    }
                    _this.setState({
                        validateResultList
                    }, function () {
                        count++
                        if (count === validateResult.length + 1) {
                            validateResultList[count - 1].status = lastStatus ? IconType["success"] : IconType["error"]
                        }
                    })
                }
            }, 1000)

        }

    }

    render() {

        const {getFieldDecorator} = this.props.form
        const {validationLoading, credential, validateResultList, validateResultData, uploadLoading} = this.state
        const token = Cookies.get('token')
        const params = {
            name: 'evidence',
            headers: {'authorization': `Bearer ${token}`,},
            showUploadList: false,
            beforeUpload: this.beforeUpload,
            action: infringement.upload,
            onChange: this.onChangeUpload,
        };
        const validateResultRender = validateResultData && validateResultList.map((item, i) => {
            return (
                <Step className={i === 6 && item.status.type === "finish" ? "step-success" : item.status.type === "error" ? "step-error" : ""} status={item.status ? item.status.type : ""}
                      icon={item.status.icon === "loading" ?
                          <img className="loading" src={require("../../../../../../images/dashboard/validate.svg")}/> :
                          <Icon theme="filled"
                                className={item.status ? item.status.type : ""}
                                type={item.status ? item.status.icon : ""}/>} key={i + "validateResultData"}
                      title={(item.status.tit === "正在验证" ? "" : item.tit) || "" + (item.status ? item.status.tit : "") || ""}>

                </Step>
            )
        })

        return (
            <div className="validation-page">
                <div className="validation-children">
                    <h1>验证文件</h1>
                    <Divider/>
                    <Form hideRequiredMark={true} style={{marginTop: "40.5px"}}>
                        <Form.Item
                            label={'上传文件'}
                            colon={false}
                            className='upload-form-item'
                        >
                            {getFieldDecorator('credential', {
                                rules: [{required: true, message: '请上传文件!'}],
                            })(
                                <Input readOnly placeholder="上传文件后显示数据哈希" className="input"
                                       autoComplete='off'/>
                            )}
                            <Upload
                                {...params}
                            >
                                <Button loading={uploadLoading} disabled={validationLoading} className="upload-btn">上传</Button>
                            </Upload>
                        </Form.Item>
                    </Form>
                </div>
                <div className="validation-children">
                    <h1>验证文件</h1>
                    <Divider/>
                    <div className="validation-result">
                        <Button type="primary" disabled={!credential} className="validation-btn" onClick={() => {
                            this.validateFileFn()
                        }} loading={validationLoading}>{validationLoading ? "正在验证" : "开始验证"}</Button>
                        <Steps direction="vertical" size="small" className="validation-progress">
                            {
                                validateResultRender
                            }
                        </Steps>
                    </div>
                </div>
            </div>
        )
    }
}

InfringementValidation = Form.create()(InfringementValidation)
export default InfringementValidation