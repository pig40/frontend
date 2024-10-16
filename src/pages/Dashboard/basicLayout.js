import React from 'react';
import { Layout, Menu, Breadcrumb, message, Modal, Form, Spin } from 'antd';
import Tip from '../../Utils/Tip'
import './basicLayout.less';
import '../../styles/reset.less'
import { Switch, Redirect, Route, Link, NavLink } from 'react-router-dom';
import Cookies from 'js-cookie';
import request from '../../Utils/fecth'
import _ from 'lodash'
import config from '../../Utils/apiConfig'
import { inject, observer } from "mobx-react/index";
import { injectIntl } from "react-intl";
import Loadable from 'react-loadable';
import pathToRegexp from 'path-to-regexp';

const { dataTransaction, UnicomUser } = config.api
const SubMenu = Menu.SubMenu;

function urlToList(url) {
    const urllist = url.split('/').filter(i => i);
    return urllist.map((urlItem, index) => {
        return `/${urllist.slice(0, index + 1).join('/')}`;
    });
}

function getBreadcrumb(breadcrumbNameMap, url, props) {
    let breadcrumb = breadcrumbNameMap[url];
    if (!breadcrumb) {
        Object.keys(breadcrumbNameMap).forEach(item => {
            if (pathToRegexp(item).test(url)) {
                breadcrumb = breadcrumbNameMap[item];
            }
        });
    }
    return breadcrumb || {};
}

const MyLoadingComponent = ({ isLoading, error }) => {
    // Handle the loading state
    if (isLoading) {
        return <div style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            left: "0",
            top: "0",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
        }}><Spin size="large" /></div>;
    }
    // Handle the error state
    else if (error) {
        return <Tip />;
    }
    else {
        return null;
    }
};


const Overview = Loadable({
    loader: () => import('./components/Overview/Overview'),
    loading: MyLoadingComponent
})

const DepositDetail = Loadable({
    loader: () => import('./components/DataDeposits/components/DepositDetail/index'),
    loading: MyLoadingComponent
})
const AddData = Loadable({
    loader: () => import('./components/DataDeposits/components/AddData/AddData'),
    loading: MyLoadingComponent
})
const AllData = Loadable({
    loader: () => import('./components/DataTransaction/AllData/AllData'),
    loading: MyLoadingComponent
})

const PersonalCenter = Loadable({
    loader: () => import('./components/PersonalCenter/PersonalCenter'),
    loading: MyLoadingComponent
})
const InfringementDeposit = Loadable({
    loader: () => import('./components/InfringementDeposit/InfringementDeposit'),
    loading: MyLoadingComponent
})
const DataDeposits = Loadable({
    loader: () => import('./components/DataDeposits/DataDeposits'),
    loading: MyLoadingComponent
})
const DataApproval = Loadable({
    loader: () => import('./components/DataTransaction/DataApproval/DataApproval'),
    loading: MyLoadingComponent
})
const PurchasedData = Loadable({
    loader: () => import('./components/DataTransaction/PurchasedData/PurchasedData'),
    loading: MyLoadingComponent
})
const TransactionHistory = Loadable({
    loader: () => import('./components/DataTransaction/TransactionHistory/TransactionHistory'),
    loading: MyLoadingComponent
})
const InfringementDetail = Loadable({
    loader: () => import('./components/InfringementDeposit/components/InfringementDetail'),
    loading: MyLoadingComponent
})
const AddInfringement = Loadable({
    loader: () => import('./components/InfringementDeposit/components/AddInfringement'),
    loading: MyLoadingComponent
})
const InfringementValidation = Loadable({
    loader: () => import('./components/InfringementDeposit/components/InfringementValidation'),
    loading: MyLoadingComponent
})
const Forbidden = Loadable({
    loader: () => import('./components/Error/403.js'),
    loading: MyLoadingComponent
});
const confirm = Modal.confirm;


const { api: { user } } = config;
const { Header, Content, Sider } = Layout;

@inject("DataApprovalModel")
@observer
class Dashboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            collapsed: false,
            data: '',
            loading: true,
            resetPasswordVisible: false,
            passErrorTip: "",
            passVisible: "none",
            passTip: '',
            passConfirmTip: "",
            chainType: "zigledger",
            visible: false,
            menuList: this.getMenu(props),
            openKeys: props.location.pathname.includes('/dashboard/dataTransaction') ? ['dataTransaction'] : []
        };
    }

    componentDidMount() {
        request().get(dataTransaction.reviewCountPending).then(res => {
            if (res) {
                switch (res.status) {
                    case 200:
                        this.props.DataApprovalModel.getDataApprovalCount(res.data.review.pending)
                        break;
                    case 401:
                        Cookies.remove('token', { path: '' });
                        Cookies.remove('userInfo', { path: '' });
                        Cookies.remove('userName', { path: '' });
                        this.props.history.push("/login")
                        break;
                    default:
                        break;
                }

            }
        })
        //获取用户详情
        request().get(UnicomUser.role).then(res => {
            const LIST = [
                { key: 'dataMonitoring', name: '数据流转监控' },
                { key: 'accountManagement', name: '账户管理' },
                { key: 'roleManagement', name: '角色管理' },
                { key: 'organizationManagement', name: '组织管理' },
                { key: 'dataManagement', name: '数据管理' },
                { key: 'overview', name: '首页' },
                { key: 'dataDeposit', name: '数据存证' },
                { key: 'dataTransaction', name: '数据交易' },
                { key: 'tort', name: '侵权存证' },
                { key: 'personalCenter', name: '个人中心' },
            ]
            if (res && res.status === 200) {
                this.props.DataApprovalModel.setAuth(_.get(res.data, 'functionPermissions', LIST.map(element => { return element.key })))
                this.setState({
                    loading: false,
                    menuList: this.getMenu(this.props),
                })
            } else if (res && res.status === 401) {
                Cookies.remove('token', { path: '' });
                Cookies.remove('userInfo', { path: '' });
                Cookies.remove('userName', { path: '' });
                this.props.history.push("/login")
            } else {
                message.error('获取用户权限失败')
                this.setState({
                    loading: false,
                    menuList: this.getMenu(this.props),
                })
            }
        })
    }
    routerList = (isFilter) => {
        let routerList = [
            { pathname: "/dashboard/overview", component: Overview, key: 'overview' },
            { pathname: "/dashboard/dataDeposit", component: DataDeposits, key: "dataDeposit" },
            { pathname: "/dashboard/dataTransaction/allData", component: AllData, key: 'dataTransaction' },
            { pathname: "/dashboard/dataTransaction/allData/detail", component: DepositDetail, key: 'dataTransaction' },
            { pathname: "/dashboard/dataTransaction/purchasedData/detail", component: DepositDetail, key: 'dataTransaction' },
            { pathname: "/dashboard/dataTransaction/transactionHistory/detail", component: DepositDetail, key: 'dataTransaction' },

            { pathname: "/dashboard/dataDeposit/detail", component: DepositDetail, key: 'dataDeposit' },
            { pathname: "/dashboard/dataTransaction/allData/add/:id?", component: AddData, key: 'dataTransaction' },
            { pathname: "/dashboard/dataTransaction/purchasedData", component: PurchasedData, key: 'dataTransaction' },
            { pathname: "/dashboard/dataTransaction/transactionHistory", component: TransactionHistory, key: 'dataTransaction' },
            { pathname: "/dashboard/dataTransaction/dataApproval", component: DataApproval, key: 'dataTransaction' },

            { pathname: "/dashboard/dataDeposit/add/:id?", component: AddData, key: 'dataDeposit' },
            { pathname: "/dashboard/infringementDeposit", component: InfringementDeposit, key: 'tort' },
            { pathname: "/dashboard/infringementDeposit/addInfringement", component: AddInfringement, key: 'tort' },
            { pathname: "/dashboard/infringementDeposit/certificateValidation", component: InfringementValidation, key: 'tort' },

            { pathname: "/dashboard/infringementDeposit/infringementDetail", component: InfringementDetail, key: 'tort' },

            { pathname: "/dashboard/personalCenter", component: PersonalCenter, key: 'personalCenter' },

        ]
        return isFilter ? routerList.filter(element => { return this.props.DataApprovalModel.getAuth().includes(element.key) }) : routerList
    }
    componentWillReceiveProps(props) {
        this.setState({
            menuList: this.getMenu(props),
            openKeys: props.location.pathname.includes('/dashboard/dataTransaction') ? ['dataTransaction'] : []
        })
    }

    getMenu = (props) => {
        let menu = [
            {
                name: "首页",
                path: '/dashboard/overview',
                key: 'overview',
                src: props.location.pathname.includes('/dashboard/overview') ? require('../../images/slider/overview.svg') : require('../../images/slider/unoverview.svg'),
            },
            {
                name: "征信数据存证",
                path: '/dashboard/dataDeposit',
                key: 'dataDeposit',
                src: props.location.pathname.includes('/dashboard/dataDeposit') ? require('../../images/slider/dataDeposit.svg') : require('../../images/slider/undataDeposit.svg'),
            },
            {
                path: 'dataTransaction',
                key: 'dataTransaction',
                src: props.location.pathname.includes('/dashboard/dataTransaction') ? require('../../images/slider/dataTran.svg') : require('../../images/slider/unDataTran.svg'),
                name: '征信数据交易', children: [
                    { name: '全部数据', path: '/dashboard/dataTransaction/allData' },
                    { name: '已购数据', path: '/dashboard/dataTransaction/purchasedData' },
                    { name: '交易历史', path: '/dashboard/dataTransaction/transactionHistory' },
                    // { name: '数据审批', path: '/dashboard/dataTransaction/dataApproval' },
                ]
            },
            {
                name: "侵权存证",
                key: 'tort',
                path: '/dashboard/infringementDeposit',
                src: props.location.pathname.includes('/dashboard/infringementDeposit') ? require('../../images/slider/infringementDeposit.svg') : require('../../images/slider/unInfringementDeposit.svg'),
            },
            {
                name: "个人中心",
                key: 'personalCenter',
                path: '/dashboard/personalCenter',
                src: props.location.pathname.includes('/dashboard/personalCenter') ? require('../../images/slider/person.svg') : require('../../images/slider/unperson.svg'),
            },
            
        ]
        return menu.filter(element => { return this.props.DataApprovalModel.getAuth().includes(element.key) })
    }
    onCollapse = (collapsed) => {
        this.setState({ collapsed });
    };

    okloginOut = () => {
        Cookies.remove('token', { path: '' }); // removed!
        Cookies.remove('userInfo', { path: '' }); // removed!
        Cookies.remove('userName', { path: '' }); // removed!
        this.props.history.push({
            pathname: "/login"
        })
    }

    CancelloginOut = () => {
        this.setState({
            loginOutVisible: false
        })
    }

    loginOutVisible = () => {
        this.setState({
            loginOutVisible: true
        })
    }

    consortiumChainList = ({ item, key, keyPath }) => {
        switch (key) {
            case "chain_code":
                this.props.history.push({
                    pathname: "/dashboard/chain_code"
                })
                break;
            case "token":
                this.props.history.push({
                    pathname: "/dashboard/token"
                })
                break;
            case "account":
                this.props.history.push({
                    pathname: "/dashboard/account"
                })
                break;
            case "log":
                this.props.history.push({
                    pathname: "/dashboard/log"
                })
                break;
            case "browser":
                this.props.history.push('/dashboard/browser')
                break;
            case "api":
                this.props.history.push("/dashboard/api")
                break;
            case "data_monitoring":
                this.props.history.push("/dashboard/data_monitoring")
                break;
            default:
                this.props.history.push({
                    pathname: "/dashboard/token"
                })
        }
    }

    unicomeList = ({ item, key, keyPath }) => {
        this.props.DataApprovalModel.resetPage()
        this.props.history.push({
            pathname: key,
            state: key === "/dashboard/infringementDeposit" ? 'all' : null
        })

    }

    getCurrentMenuSelectedKeys(props) {
        const { location: { pathname } } = props || this.props;
        let list = [
            '/dashboard/dataTransaction/allData',
            '/dashboard/dataTransaction/purchasedData',
            '/dashboard/dataTransaction/transactionHistory',
            '/dashboard/dataTransaction/dataApproval',
            '/dashboard/dataDeposit',
            '/dashboard/infringementDeposit',
            '/dashboard/personalCenter'

        ]
        let index = null
        list.map((element, count) => {
            if (pathname.includes(element)) {
                index = count
            }
        })

        let keys = list[index] ? list[index] : pathname
        return [keys];
    }

    validateConfirmPassword = (rule, value, callback) => {
        const { form: { getFieldValue } } = this.props
        const intlData = this.props.intl.messages;
        this.setState({
            passConfirmTip: ""
        })
        if (getFieldValue('newPassword')) {
            if (value && value !== getFieldValue('newPassword')) {
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

    pwStrength = (rule, pwd, callback) => {
        const intlData = this.props.intl.messages;
        const _this = this
        const Dfault_color = "#eef1f5";
        const L_color = "#f13640";
        const M_color = "#f5a623";
        const H_color = "#7ed321";
        let Lcolor = null;
        let Mcolor = null;
        let Hcolor = null;
        this.setState({
            passVisible: "flex",
        })
        if (pwd == null || pwd === '') {
            callback()
            _this.setState({
                passVisible: "none",
                passTip: ""
            })
        } else if (pwd.length < 6) {
            callback(intlData.service_resetPass_passtip_digits);
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
                    });
                    break;
                case 2:
                    Lcolor = L_color;
                    Mcolor = M_color;
                    Hcolor = Dfault_color;
                    _this.setState({
                        passTip: intlData.service_resetPass_passMedium
                    })
                    break;
                default:
                    Lcolor = L_color;
                    Mcolor = M_color;
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

    okResetPassword = (e) => {
        const { form: { getFieldValue } } = this.props;
        const userName = Cookies.get('userName');
        const _this = this
        const intlData = this.props.intl.messages;
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {

                if (getFieldValue('newPassword') !== getFieldValue('confirmPassword')) {
                    this.setState({
                        passConfirmTip: intlData.service_resetPass_passtip_noSame
                    })
                } else {
                    request(user.resetPassword, {
                        method: 'PUT',
                        body: {
                            "userName": userName,
                            "password": values.password,
                            "newPassword": values.newPassword
                        }
                    }).then((response) => {
                        if (typeof response === 'number') {
                            switch (response) {
                                case 404:
                                    message.error(intlData.service_resetPass_userNoExit)
                                    _this.setState({ resetPasswordVisible: false })
                                    break;
                                case 406:
                                    _this.setState({
                                        passErrorTip: intlData.service_resetPass_oldPassErr
                                    })
                                    break;
                                case 500:
                                    message.error(intlData.service_model_update_500)
                                    _this.setState({ resetPasswordVisible: false })
                                    break;
                                case 401:
                                    Cookies.remove('token');
                                    Cookies.remove('userName');
                                    sessionStorage.removeItem('projectData');
                                    sessionStorage.removeItem('consortiumType');
                                    this.props.history.push({
                                        pathname: "/login"
                                    })
                                    break;
                                default:
                                    message.error(intlData.service_resetPass_resetPassFail)
                                    _this.setState({ resetPasswordVisible: false })
                            }
                        } else {
                            _this.setState({
                                passErrorTip: '',
                                resetPasswordVisible: false
                            })
                            message.success(intlData.service_resetPass_resetPassSuccess, 1)
                            setTimeout(() => {
                                _this.okloginOut()
                            }, 1000)
                        }
                    })
                }

            } else {
                console.log("err")
            }
        })
    }

    CancelResetPassword = () => {
        this.setState({ resetPasswordVisible: false })
    }

    inputPassword = (rule, value, callback) => {
        this.setState({
            passErrorTip: ""
        })
        callback()
    }

    toggle = () => {
        this.setState({
            collapsed: !this.state.collapsed,
        });
    }

    renderDropdown = () => {
        return (
            <ul style={{ minWidth: 60 }}>
                <li key='dash' className='drop-item'><a
                    onClick={this.resetPasswordVisible}>{this.props.intl.messages.service_nav_resetPass}</a></li>
                <li key='loginout' className='drop-item'><a
                    onClick={this.logoutTip}>{this.props.intl.messages.service_nav_exit}</a></li>
            </ul>
        )
    }

    changeVisible = (a) => {
        this.setState({
            visible: a
        })
    }

    logoutTip = () => {
        let _this = this;
        this.setState({
            visible: false
        })
        confirm({
            title: this.props.intl.messages.service_logout_title,
            okText: this.props.intl.messages.service_logout_confirm,
            cancelText: this.props.intl.messages.service_logout_cancel,
            className: "creatModalConfirm",
            width: '380px',
            onOk() {
                _this.okloginOut()
            },
            onCancel() {

            },
        });
    }
    conversionFromLocation = (routerLocation, breadcrumbNameMap) => {
        let pathSnippets = urlToList(routerLocation.pathname);
        pathSnippets = pathSnippets.filter(url => {
            return typeof (getBreadcrumb(breadcrumbNameMap, url, this.props.location)) !== 'object';
        })
        // if(this.props.location.)
        let extraBreadcrumbItems = pathSnippets.map((url, index) => {
            const currentBreadcrumb = getBreadcrumb(breadcrumbNameMap, url, this.props.location);

            const isLinkable = index !== pathSnippets.length - 1 && currentBreadcrumb
            return currentBreadcrumb && typeof (currentBreadcrumb) !== 'object' && url !== '/dashboard' && (

                <Breadcrumb.Item key={url}>

                    {
                        isLinkable ?
                            <Link to={url}>
                                {currentBreadcrumb}
                            </Link>
                            :
                            <span style={{
                                color: '#112e54',
                                fontFamily: 'PingFang-SC',
                                fontSize: 16,
                                fontWeight: 500
                            }}>{currentBreadcrumb}</span>
                    }

                </Breadcrumb.Item>
            )
        });
        return extraBreadcrumbItems
    };
    resetPasswordVisible = () => {
        this.setState({
            resetPasswordVisible: true,
            visible: false
        })
    }

    goBack = () => {
        this.props.history.goBack()
    }

    render() {
        let userName = '';
        if (Cookies.get('userInfo')) {
            try {
                let userInfo = JSON.parse(Cookies.get("userInfo"))
                userName = userInfo.name;
            } catch (e) {
            }
        }
        const { form: { getFieldDecorator } } = this.props;
        const breadcrumbNameMap = {
            '/dashboard': '',
            '/dashboard/dataDeposit/add/': this.props.location.pathname && this.props.location.pathname.split('/') && this.props.location.pathname.split('/').length >= 5 && this.props.location.pathname.includes('/dashboard/dataDeposit/add/') ? "更新数据" : '新增数据',
            '/dashboard/data_monitoring': '数据流转监控',
            '/dashboard/dataDeposit/detail': '存证详情',
            '/dashboard/data_deposit/add_deposit': '新增数据存证',
            '/dashboard/tort_deposit': '侵权存证',
            '/dashboard/tort_deposit/detail': '侵权存证详情',
            '/dashboard/tort_deposit/add_tort': '新增侵权存证',
            '/dashboard/oracle_verification': '预言机证书验证',
            '/dashboard/price': '账户积分',
            '/dashboard/overview': '首页',
            '/dashboard/dataTransaction/allData': "全部数据",
            '/dashboard/dataTransaction/purchasedData': '已购数据',
            '/dashboard/dataTransaction/transactionHistory': '交易历史',
            '/dashboard/dataTransaction/dataApproval': '数据审批',
            '/dashboard/dataDeposit': "数据存证",
            '/dashboard/infringementDeposit/certificateValidation': "证书验证",
            '/dashboard/infringementDeposit/addInfringement': '新增存证',
            '/dashboard/infringementDeposit/infringementDetail': '存证详情',
            '/dashboard/infringementDeposit': "侵权存证",
            '/dashboard/personalCenter': '个人中心',
            '/dashboard/dataTransaction/allData/detail': '数据详情',
            "/dashboard/dataTransaction/purchasedData/detail": '数据详情',
            "/dashboard/dataTransaction/transactionHistory/detail": '数据详情',
        };
        return (
            this.state.loading ?
                null
                :
                <Layout className="dashboard_layout">
                    <Sider
                        style={{ minHeight: document.body.clientHeight }}
                        className="slider"
                    >
                        <NavLink className="logo" to={{ pathname: this.routerList(true).length ? this.routerList(true)[0].pathname : '/dashboard' }}>
                            <img src={require('../../images/logo.svg')} alt="" />          
                        </NavLink>
                        <h3 className="dashboard_title">征信数据共享交易平台</h3>
                        <Menu
                            className="List"
                            theme="dark"
                            defaultSelectedKeys={this.routerList(true).length ? [this.routerList(true)[0].pathname] : ['']}
                            mode="inline"
                            onClick={this.unicomeList}
                            onOpenChange={(openKeys) => {
                                this.setState({
                                    openKeys
                                })
                            }}
                            openKeys={this.state.openKeys}
                            selectedKeys={this.getCurrentMenuSelectedKeys()}
                        >
                            {
                                this.state.menuList.map(element => {
                                    return (
                                        element.children ?
                                            <SubMenu key={element.path}
                                                title={<span> <img style={{ marginRight: "20px", width: 18, height: 18 }}
                                                    src={element.src} /><span>{element.name}</span></span>}>
                                                {
                                                    element.children.map(item => {
                                                        return (
                                                            <Menu.Item key={item.path}>
                                                                <p className="fill-in"
                                                                    style={{ visibility: this.props.location.pathname.includes(item.path) ? "" : "hidden" }}></p>
                                                                {item.name}{item.path === '/dashboard/dataTransaction/dataApproval' && this.props.DataApprovalModel.count ?
                                                                    <div
                                                                        className='count'>{this.props.DataApprovalModel.count}</div> : null}
                                                            </Menu.Item>
                                                        )
                                                    })
                                                }
                                            </SubMenu>
                                            :
                                            <Menu.Item key={element.path}>

                                                <p className="fill-in"
                                                    style={{ visibility: this.props.location.pathname.includes(element.path) ? "" : "hidden" }}></p>
                                                <img style={{ marginRight: "20px" }} src={element.src} />
                                                <span>{element.name}</span>
                                            </Menu.Item>
                                    )

                                })
                            }


                        </Menu>
                    </Sider>
                    <Layout className="layout-header">

                        <Header style={{ background: '#fff', padding: '0 30px', borderBottom: '1px solid #e6eaee' }}>

                            <div className="breadcrumb">
                                {
                                    this.conversionFromLocation(this.props.location, breadcrumbNameMap).filter(element => {
                                        return element !== false
                                    }).length <= 1 ? null :
                                        <img src={require('../../images/dashboard/back.svg')}
                                            style={{ marginRight: 8, cursor: 'pointer', marginTop: -3 }}
                                            onClick={() => this.goBack()} />
                                }
                                <Breadcrumb style={{ padding: 0, height: 60, lineHeight: '60px', display: 'inline-block' }}>
                                    {this.conversionFromLocation(this.props.location, breadcrumbNameMap)}

                                </Breadcrumb>
                            </div>
                            <div className="header-list">
                                <div style={{ marginRight: 8, height: 60 }}>
                                    <img src={require('../../images/dashboard/me.svg')} />
                                </div>
                                <div style={{ marginRight: 12, opacity: 0.6, height: 60 }}>
                                    {userName}
                                </div>
                                <div style={{ height: 60 }}><a onClick={this.logoutTip} className='logout'>{'退出'}</a></div>
                            </div>
                        </Header>
                        <Content className="content"
                            style={{ position: "relative" }}>
                            {
                                this.routerList(true).length ?
                                    <Switch>
                                        {this.routerList().map(element => {
                                            return (
                                                <Route
                                                    path={element.pathname}
                                                    exact
                                                    key={element.pathname}
                                                    render={(props) => (
                                                        this.props.DataApprovalModel.getAuth().includes(element.key) ? (
                                                            React.createElement(element.component, Object.assign(props, { openKeys: this.state.openKeys }))
                                                        ) : (<Redirect to={`/dashboard/${element.key}/forbidden`} />)
                                                    )}
                                                />
                                            )
                                        })}
                                        {this.routerList().map(element => {
                                            return (
                                                <Route path={`/dashboard/${element.key}/forbidden`} component={Forbidden} exact key={element.pathname} />
                                            )
                                        })}
                                        <Route path='/dashboard/forbidden' component={Forbidden} exact />
                                        {
                                            this.props.DataApprovalModel.getAuth().includes('dataTransaction') ?
                                                <Redirect exact from="/dashboard/dataTransaction" to="/dashboard/dataTransaction/allData" />
                                                :
                                                null
                                        }

                                        <Redirect from="/dashboard" to={this.routerList(true)[0].pathname} />



                                    </Switch>
                                    :
                                    <Switch>
                                        <Route path='/dashboard/forbidden' component={Forbidden} exact />
                                        <Route path="/dashboard" render={() => <Redirect to={'/dashboard/forbidden'} />} />
                                        <Route path="/dashboard/*" render={() => <Redirect to={'/dashboard/forbidden'} />} />
                                    </Switch>
                            }
                        </Content>
                    </Layout>
                </Layout>
        );
    }
}

Dashboard = Form.create()(Dashboard)
export default injectIntl(Dashboard)
