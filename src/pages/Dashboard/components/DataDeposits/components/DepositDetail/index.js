import React, {Component} from 'react';
import {message, Spin, Modal, Form, Select, Button} from 'antd'
import request from '../../../../../../Utils/fecth'
import config from '../../../../../../Utils/apiConfig'
import _ from 'lodash'
import moment from 'moment'
import SecondButton from '../../../../../../component/button/CustomeButtonSecond'

import axios from 'axios'
// import './index.less'

const CancelToken = axios.CancelToken;
const {api: {evidence, allDataPage, dataTransaction}} = config;
const Option = Select.Option
let cancel;

class DepositDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataObj: {
                name: '',
                type: '',
                security: '',
                fileSize: '',
                fileHash: '',
                fileURI: '',
                fileName: '',
                blockNumber: '',
                transactionHash: '',
                timestamp: '',
                price: '',
                id: '',
                author: '',
                free: false
            },
            loading: false,
            status: _.get(props.location.state, 'status', ''),
            isBought: props.location.pathname.includes('/dashboard/dataTransaction/purchasedData/detail'),
            requestLoading: false,
            userName: '',
            flag: false,
            visible: false,
            versionlist: null
        }
    }

    // 获取详情
    getData = (version) => {
        this.setState({
            loading: true
        })
        let url = `${allDataPage.getData}?id=${this.props.location.state.id}${version ? `&version=${version}` : ''}`
        request().get(url, {
            cancelToken: new CancelToken(function executor(c) {
                cancel = c;
            })
        }).then(res => {
            this.setState({
                loading: false
            })
            if (res) {

                switch (res.status) {

                    case 200:
                        this.setState({
                            dataObj: _.get(res.data, 'data', {}),
                            versionlist: res.data.versions
                        })
                        break;
                    case 401:
                        sessionStorage.removeItem('userInfo')
                        this.props.history.push('/login')
                        break;
                    default:
                        message.error('网络错误')
                }
            }
        })
    }

    componentDidMount() {
        if (!this.props.location.state) {
            return this.props.history.replace('/dashboard/data_deposit/all_data')
        }

        this.getData();

    }

    checkDownload = () => {
        if (this.props.location.pathname.includes('/dashboard/dataDeposit/detail')) {
            return this.downloadFile()
        }
        if (this.state.dataObj.free) { //如果为免费文件直接下载
            return this.downloadFile()
        }
        this.flag = this.state.status === 'authorized' ? 'download' : 'apply'
        this.setState({
            visible: true
        })
    }
    download = () => {
        //判断是否下载 申请 还是下载弹框
        if (this.state.status === 'pending') return null;
        if (this.state.status === 'downloaded') { //下载
            this.downloadFile()//直接下载
        } else {
            this.flag = this.state.status === 'approved' ? 'download' : 'apply'
            this.setState({
                visible: true
            })
        }
    }

    handleCancel = () => {
        cancel && cancel()
        this.setState({
            visible: false,
            requestLoading: false
        })
    }
    //下载文件
    downloadFile = () => {
        this.setState({
            requestLoading: true
        })
        let url = dataTransaction.download
        request().post(url, {
                "id": this.props.location.state.id,     // 数据id
                "version": this.state.dataObj.version,
            }, {responseType: 'blob'},
        ).then(res => {
            this.setState({
                requestLoading: false,
                visible: false
            })
            if (res) {
                switch (res.status) {
                    case 200:
                        //下载完一次之后把status置为downloaded
                        this.state.isBought && this.setState({
                            status: "downloaded"
                        })
                        // let reg = new RegExp('"', "g");
                        // let fileName = res.headers["content-disposition"].split(";")[1].split("filename=")[1].replace(reg, "");
                        let header = res.headers["content-disposition"]
                        let reg = new RegExp('"', "g");
                        let fileName = header.split(";")[1].split("filename=")[1].replace(reg, "");
                        if (header.replace(`attachment; filename="${fileName}"; filename*=UTF-8''`, '') && header.includes('filename*=UTF-8')) {
                            fileName = decodeURI(header.slice(`attachment; filename="${fileName}"; filename*=UTF-8''`.length, header.length))
                        }
                        const blob = new Blob([res.data], {type: res.headers["content-type"]})

                        if ('download' in document.createElement('a')) { // 非IE下载
                            const elink = document.createElement('a')
                            elink.download = fileName
                            elink.style.display = 'none'
                            elink.href = URL.createObjectURL(blob)
                            if (typeof elink.download === 'undefined') {
                                elink.setAttribute('target', '_blank');
                            }
                            document.body.appendChild(elink)
                            elink.click()
                            URL.revokeObjectURL(elink.href) // 释放URL 对象
                            document.body.removeChild(elink)
                            message.success("下载成功")
                        } else { // IE10+下载
                            try {
                                navigator.msSaveBlob(blob, fileName)
                                message.success("下载成功")
                            } catch (error) {
                                message.error("下载失败")
                            }
                        }

                        break;
                    default:
                        message.error("下载失败")
                }
            } else {
                message.error("下载失败")
            }
        }).catch(err => {
            this.setState({
                requestLoading: false
            })
        })


    }
    submit = () => {
        this.setState({
            requestLoading: true
        }, () => {
            if (this.flag === 'apply') {
                let obj = {
                    id: _.get(this.props.location, 'state.id', ''),
                    version: _.get(this.state.dataObj, 'version', '')
                }
                request().post(dataTransaction.apply, obj, {
                    cancelToken: new CancelToken(function executor(c) {
                        cancel = c;
                    })
                }).then(res => {
                    this.setState({
                        requestLoading: false,
                        visible: false
                    })
                    if (res) {
                        if (res.status === 200) {
                            message.success('申请成功！')
                            this.props.history.goBack()
                        } else if (res.status === 409) {
                            message.error('该条数据已经申请过了！')
                        } else {
                            let messages = '申请失败！'
                            message.error(messages)

                        }
                    }
                })
            } else {
                //为下载文件
                this.downloadFile()
            }
        })
    }


    handleSubmit = (e) => {
        this.props.form.validateFields((err, values) => {
            if (!err) {
                request().put(evidence.update.format({id: this.state.dataObj.id}), values).then(res => {
                    if (res) {
                        this.handleCancel()
                        switch (res.status) {
                            case 200:
                                this.getData()
                                message.success("更改成功")
                                break;
                            default:
                                message.error("更改失败")
                        }
                    }
                })
            }
        });
    }
    update = () => {
        this.setState({
            visible: true
        })
    }

    // 文件大小
    formatSize = (fileSize) => {
        if (!fileSize) return '0KB'
        let temp = ((fileSize || 0) / 1024).toFixed()
        return temp + 'KB';
    }

    componentWillUnmount() {
        cancel && cancel()
        this.setState = () => {
        }
    }

    // 点击更新数据
    updateDataFn = () => {
        const {dataObj} = this.state
        dataObj.id = this.props.location.state.id
        this.props.history.push(`/dashboard/dataDeposit/add/${dataObj.id}`)
    }

    renderContent = (key, value = '', className = '') => {
        return (
            <div className={`content1 ${className}`}>
                <div className='key'>{key}</div>
                <div className='value'>{value}</div>
            </div>
        )
    }

    // 获取不同版本的存证详情
    changeVersionFn = (val) => {
        this.getData(val)
    }

    render() {
        const {dataObj, versionlist, loading} = this.state
        const versionListItem = versionlist && versionlist.length && versionlist.map((item, i) => {
            return (
                <Option key={'versionListItem' + i} value={item}>{item}</Option>
            )
        })

        return (

            <div className='deposit-detail-page'>
                {/*弹框*/}
                <Modal
                    wrapClassName='modal'
                    visible={this.state.visible}
                    title={this.flag === 'apply' ? '申请下载' : '下载数据'}
                    closable={false}
                    width={484}
                    footer={[
                        this.flag === 'download' ? <div key="download"
                                                        className='tip'>您将被扣除{_.get(this.state.dataObj, 'price', 0)}积分，请再次确认！</div> : null,
                        <Button className='cancel-btn' key="back" onClick={() => this.handleCancel()}>取消</Button>,
                        <Button className='confirm-btn' key="submit" onClick={() => this.submit()}
                                loading={this.state.requestLoading}>确认</Button>
                    ]}
                >
                    <div className='close'>
                        <img src={require('../../../../../../images/dataTran/all/close.svg')} alt=''
                             onClick={() => this.setState({
                                 visible: false
                             })}/>
                    </div>
                    <div className='row'>
                        <div className='title'>名称:</div>
                        <div className='value'>{_.get(this.state.dataObj, 'name')}</div>
                    </div>
                    <div className='row'>
                        <div className='title'>密级:</div>
                        <div className='value'>{_.get(this.state.dataObj, 'confidentialLevel')}</div>
                    </div>
                    <div className='row'>
                        <div className='title'>类型:</div>
                        <div className='value'>{_.get(this.state.dataObj, 'type')}</div>
                    </div>
                    <div className='row'>
                        <div className='title'>价格:</div>
                        <div className='value'>{_.get(this.state.dataObj, 'price', 0)}积分</div>
                    </div>
                    <div className='row'>
                        <div className='title'>描述:</div>
                        <div className='value'>{(this.state.dataObj && this.state.dataObj.description) || '暂无描述'}</div>
                    </div>
                </Modal>
                <Spin spinning={this.state.loading}>
                    <div className="deposit-select">
                        <div>
                            <Select
                                loading={loading}
                                style={{width: 232, height: 36,}}
                                value={dataObj.version || ""}
                                suffixIcon={
                                    <div>
                                        <span className="select-version">切换版本</span>
                                        <div className="triangle"></div>
                                    </div>

                                }
                                onChange={this.changeVersionFn}
                            >
                                {versionListItem}
                            </Select>
                        </div>
                        <div className="deposit-select-btn">

                            {
                                this.props.location.pathname.includes('/dashboard/dataDeposit/detail') ?

                                    <SecondButton text={'更新数据'} style={{
                                        width: 88,
                                        height: 36,
                                        lineHeight: '36px',
                                        padding: 0,
                                        fontWeight: 'normal',
                                        borderRadius: 4,
                                        background: '#F5F6FC'
                                    }} onClick={() => {
                                        this.updateDataFn()
                                    }}></SecondButton>
                                    : null
                            }
                            {/*购买数据详情*/}{

                            this.state.isBought ?
                                <Button
                                    className={this.state.status === 'pending' ? "downloadBtn pending" : "downloadBtn"}
                                    type="primary"
                                    loading={this.state.requestLoading}
                                    onClick={() => this.download()}><img alt=''
                                                                         src={this.state.status !== 'rejected' ? require('../../../../../../images/dataDeposit/download.svg') : require('../../../../../../images/dataDeposit/apply.svg')}/>{this.state.status !== 'rejected' ? '下载' : '申请'}
                                </Button>
                                :
                                this.props.location.pathname.includes('/dashboard/dataTransaction/transactionHistory/detail') ?
                                    null :
                                    <Button
                                        className="downloadBtn"
                                        type="primary"
                                        loading={this.state.requestLoading}
                                        onClick={() => this.checkDownload()}><img alt=''
                                                                                  src={this.state.status === 'authorized' || this.props.location.pathname.includes('/dashboard/dataDeposit/detail') ? require('../../../../../../images/dataDeposit/download.svg') : require('../../../../../../images/dataDeposit/apply.svg')}/>{this.state.status === 'authorized' || this.props.location.pathname.includes('/dashboard/dataDeposit/detail') ? '下载' : '申请'}
                                    </Button>

                        }

                        </div>
                    </div>
                    <div className="data-info-box info-box">
                        <div className="title-box clearfix">
                            <div className="title">数据信息</div>
                        </div>
                        <div className='data-info-content'>
                            {this.renderContent('数据名', dataObj.name)}
                            {this.renderContent('组织', dataObj.organization)}
                            {this.renderContent('存证用户', dataObj.owner)}
                            {this.renderContent('数据类型', dataObj.type)}
                            {this.renderContent('密级', dataObj.confidentialLevel)}
                            {this.renderContent('文件大小', this.formatSize(dataObj.fileSize))}
                            {this.renderContent('价格', dataObj.price || 0)}
                            {this.renderContent('版本', dataObj.version)}
                            {this.renderContent('文件哈希', dataObj.fileHash, 'hash')}
                            {this.renderContent('文件描述', dataObj.description || "暂无描述", 'hash')}

                        </div>
                    </div>
                    <div className="data-info-box info-box" style={{marginTop: 12, marginBottom: 24}}>
                        <div className="title-box clearfix">
                            <div className="title">存证信息</div>
                        </div>
                        <div className='data-info-content'>
                            {this.renderContent('区块链类型', 'FABRIC')}
                            {this.renderContent('文件名', dataObj.originalFileName)}
                            {this.renderContent('存证时间', moment(dataObj.timestamp).format('YYYY-MM-DD HH:mm:ss'))}
                            {this.renderContent('区块高度', dataObj.blockHeight)}
                            {this.renderContent('交易哈希', dataObj.txId, 'hash')}
                        </div>
                    </div>
                </Spin>
            </div>
        );
    }
}

DepositDetail = Form.create()(DepositDetail)
export default DepositDetail;
