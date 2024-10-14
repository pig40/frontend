import React, { Component } from 'react';
import './error.less'
export default class Forbidden extends Component {
    render() {
        return (
            <div className='forbidden'>
                <div>
                    <img src={require('../../../../images/dashboard/auth.svg')} alt='' />
                </div>
                <div className='text'>
                    抱歉，您没有权限访问该页面！
                </div>
            </div>
        );
    }
}