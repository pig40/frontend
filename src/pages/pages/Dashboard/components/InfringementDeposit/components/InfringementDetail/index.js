import React, { Component } from 'react'
import request from '../../../../../../Utils/fecth'
import apiConfig from "../../../../../../Utils/apiConfig";
import { Divider, Button, Row, Col, Spin, message, Modal } from 'antd';
import "./index.less"
import moment from 'moment'

const { api: { infringement } } = apiConfig


class InfringementDetail extends Component {
    constructor(props) {
        super(props)
        this.state = {
            fileModalVisible: false,
            detailData: null,
            fileContent: "",
        }
    }

    componentDidMount() {
        if (this.props.location.state) {
            const id = this.props.location.state.id
            this.getDetail(id)
        } else {
            this.props.history.push('/dashboard/infringementDeposit')
        }

    }

    getDetail = (id) => {
        request().get(infringement.getDetail.format({ id: id })).then((res) => {
            console.log(res)
            if (res) {
                switch (res.status) {
                    case 200:
                        this.setState({
                            detailData: res.data
                        })
                        break;
                    default:
                        message.error("详情获取失败")
                        break;
                }
            }
        })
    }

    viewFileFn = () => {
        const { detailData } = this.state
        let option = {
            "action": "view",   // 下载：download
            "url": detailData.evidenceUrl
        }
        request().post(infringement.viewORdown, option).then((res) => {
            if (res) {
                switch (res.status) {
                    case 200:
                        this.setState({
                            fileContent: res.data
                        })
                        break;
                    default:
                        message.error("获取失败")
                        break;
                }
            }
        })
        this.setState({
            fileModalVisible: true,
        })
    }

    handleCancel = () => {
        this.setState({
            fileModalVisible: false
        })
    }

    downloadFileFn = () => {
        const { detailData } = this.state
        let option = {
            "action": "download",   // 查看：view
            "url": detailData.evidenceUrl
        }
        request().post(infringement.viewORdown, option, { responseType: 'blob' }).then((res) => {
            if (res) {
                switch (res.status) {
                    case 200:
                        const fileName = res.headers["content-disposition"].split("=")[1].slice(1).slice(0, -1)
                        //The actual download
                        var blob = new Blob([request.response], { type: 'application/octet-stream' });
                        var link = document.createElement('a');
                        link.href = window.URL.createObjectURL(blob);

                        // Try to find out the filename from the content disposition `filename` value
                        link.download = fileName;

                        document.body.appendChild(link);

                        try {
                            link.click();
                        } catch (e) {
                            navigator.msSaveBlob(blob, fileName);
                        }

                        document.body.removeChild(link);
                        break;
                    default:
                        message.error("获取失败")
                        break;
                }
            }
        })
    }

    render() {
        const { fileModalVisible, detailData, fileContent } = this.state
        return (
            <div id="InfringementDetail-page" className="InfringementDetail-page" style={{ background: '#F5F6FC' }}>
                <div className="InfringementDetail-btn">
                    <Button onClick={() => {
                        this.viewFileFn()
                    }}>查看证明文件</Button>
                    <Button type="primary" onClick={() => {
                        this.downloadFileFn()
                    }}>
                        <img src={require("../../../../../../images/dashboard/download.svg")}
                            alt="" />下载证明文件</Button>
                </div>
                <div className="InfringementDetail-children">
                    <h1>数据信息</h1>
                    <Divider />
                    <Row>
                        <Col span={8}>
                            <span>名称</span>
                            <p>{(detailData && detailData.name) || ""}</p>
                        </Col>
                        <Col span={8}>
                            <span>类型</span>
                            <p>{(detailData && detailData.type) || ""}</p>
                        </Col>
                        <Col span={8}>
                            <span>是否预言机固话</span>
                            <p>是</p>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            <span>侵权URL</span>
                            <p>{(detailData && detailData.url) || ""}</p>
                        </Col>
                    </Row>
                </div>
                <div className="InfringementDetail-children">
                    <h1>存证信息</h1>
                    <Divider />
                    <Row>
                        <Col span={8}>
                            <span>区块链类型</span>
                            <p>FABRIC</p>
                        </Col>
                        <Col span={8}>
                            <span>存证时间</span>
                            <p>{(detailData && moment(detailData.timestamp).format("YYYY-MM-DD hh:mm:ss")) || ""}</p>
                        </Col>
                        <Col span={8}>
                            <span>区块高度</span>
                            <p>{(detailData && detailData.blockHeight) || ""}</p>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            <span>交易哈希</span>
                            <p>{(detailData && detailData.txId) || ""}</p>
                        </Col>
                    </Row>
                </div>
                <Modal
                    getContainer={() => document.getElementById("InfringementDetail-page")}
                    title="查看证明文件"
                    visible={fileModalVisible}
                    onOk={this.handleOk}
                    footer={null}
                    onCancel={this.handleCancel}
                    width="640px"
                    bodyStyle={{ height: "582px" }}
                >
                    <div className={!fileContent ? "file-modal-body emptyContent" : "file-modal-body"}>
                        <Spin spinning={!fileContent ? true : false} />
                        <p>{fileContent || ""}</p>
                    </div>

                </Modal>
            </div>
        )
    }
}

export default InfringementDetail
