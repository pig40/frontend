import React, { Component } from 'react';
import { IntlProvider, addLocaleData } from 'react-intl';
import Cookies from 'js-cookie'
import App from '../../Router/App';
import en from 'react-intl/locale-data/en';
import zh from 'react-intl/locale-data/zh';
// import zh_CN from './zh-CN';
// import en_US from './en-US';


import zhCN from 'antd/lib/locale-provider/zh_CN';
import { LocaleProvider } from 'antd';
addLocaleData([...en, ...zh]);
const zh_CN = require('./zh-CN.json')


export default class Intl extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }
    componentWillMount() {
        if (!Cookies.get('lang')) {
            let lang = window.navigator.language;
            if (lang === 'zh') lang = 'zh-CN';
            Cookies.set('lang', lang, { expires: 7 });
        }
    }
    render() {
        let locale = 'zh';
        let messages = zh_CN;
        let localeAntd = zhCN;
        if (Cookies.get('lang') === 'zh-CN') {
            locale = 'zh';
            messages = zh_CN;
            localeAntd = zhCN;
        } else {
            // locale = 'en';
            // messages = en_US;
            // localeAntd = enUS;
            locale = 'zh';
            messages = zh_CN;
            localeAntd = zhCN;
        }


        return (
            <LocaleProvider
                locale={localeAntd}
            >
                <IntlProvider
                    locale={locale}
                    messages={messages}
                >
                    <App />
                </IntlProvider>
            </LocaleProvider>
        )
    }
}