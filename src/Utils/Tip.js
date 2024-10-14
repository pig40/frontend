import React, { Component } from 'react';
import {Spin} from 'antd'

class Tip extends Component {
    constructor(props) {
        super(props);
        this.state = {  }
    }
    componentDidMount(){
        window.location.reload()
    }
    render() { 
        return (  
            <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}><Spin size="large" /></div>
        );
    }
}
 
export default Tip;