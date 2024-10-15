import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Redirect, Route } from 'react-router-dom'
import Cookies from 'js-cookie';
import { Spin } from 'antd';
import Tip from '../Utils/Tip'
import Loadable from 'react-loadable';
const MyLoadingComponent = ({ isLoading, error }) => {
    if (isLoading) {
        return <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}><Spin size="large" /></div>;
    }
    else if (error) {
        return <Tip />;
    }
    else {
        return null;
    }
};


const Login = Loadable({
    loader: () => import('../pages/Login/login'),
    loading: MyLoadingComponent
});


const Dashboard = Loadable({
    loader: () => import('../pages/Dashboard/basicLayout'),
    loading: MyLoadingComponent
});

const Register = Loadable({ // 添加注册页面的加载
    loader: () => import('../pages/Register/register1'), // 注册组件路径
    loading: MyLoadingComponent
});




class App extends Component {
    render() {
        return (
            <Router>
                <div className="App">
                    <Switch>
                        <Route path="/login" component={Login} />
                        <Route path="/register" component={Register} />
                        <PrivateRoute path="/dashboard" component={Dashboard} />
                        //个人中心修改页面跳
                        <Route path="/*" render={(props) => <Redirect to='/dashboard' />} />
                    </Switch>
                </div>
            </Router>
        )
    }
}


class PrivateRoute extends Component {
    constructor(props) {
        super(props)
        this.state = {
            show: false,
            isLogin: false
        }
    }

    componentDidMount() {
        if (Cookies.get('userInfo') && Cookies.get('token')) {
            this.setState({
                show: true,
                isLogin: true
            })
        } else {
            this.setState({
                show: true,
                isLogin: false
            })
        }
    }

    componentWillUnmount() {
        this.setState = () => {
            return;
        }
    }

    render() {
        const { component: Component, ...rest } = this.props;
        return (
            <div style={{ height: '100%' }}>
                {
                    this.state.show ? (
                        <Route
                            {...rest}
                            render={props =>
                                this.state.isLogin ? (
                                    <Component {...props} />
                                ) : (
                                    <Redirect
                                        to={{
                                            pathname: "/login",
                                            state: { from: props.location }
                                        }}
                                    />
                                )
                            }
                        />
                    ) : (
                        <div style={{ width: "100%", height: 520, display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}><Spin size="large" /></div>
                    )
                }
            </div>
        )
    }
}

export default App
