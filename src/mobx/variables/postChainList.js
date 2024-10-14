import { observable, configure } from 'mobx'
configure({ enforceActions: true });
class PostChainListData {
    @observable currentUserStatus = null;
}

export default new PostChainListData();





