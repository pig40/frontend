import React from 'react';
import ReactDOM from 'react-dom';
import 'intl';
import Intl from './pages/Intl/Intl';
import { Provider } from 'mobx-react';
import store from './mobx/store';
// import {unregister} from './registerServiceWorker';
import registerServiceWorker from './registerServiceWorker';
import 'antd/dist/antd.css'
import './index.less';
import './styles/reset.less'
import 'quill/dist/quill.snow.css';


ReactDOM.render(<Provider {...store}><Intl /></Provider>, document.getElementById('root'));
// unregister()  
registerServiceWorker()  
