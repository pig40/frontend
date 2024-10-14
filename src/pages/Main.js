import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import { Pagination } from 'antd';
import Cookies from 'js-cookie'
import IntlLanguage from '../mobx/variables/IntlLanguage';
import AceEditor from 'react-ace';


class Main extends Component {
    constructor(props) {
        super(props);
        this.state = {  }
    }
    changeLanguage = (lang)=>{
        Cookies.set('lang', lang)
        window.location.reload()
    }
    componentDidMount(){
    }
    render() {
        const intlData = this.props.intl.messages;
        return <div>
            <div>
                <span style={{display: 'block',color: 'red'}} onClick = {() => {this.changeLanguage('zh-CN')}}>中文</span>
                <span style={{display: 'block',color: 'green'}} onClick = {() => {this.changeLanguage('en-US')}}>en</span>
            </div>
            <br />
            <div>
                <span>{intlData["edit.a.b"]}</span>
                <br/>
                <span>{intlData.view}</span>
                <Pagination showSizeChanger defaultCurrent={3} total={500}/>
            </div>
        </div>
            
    }
}

export default injectIntl(Main);