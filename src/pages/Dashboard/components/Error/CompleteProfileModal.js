import React from 'react';
import { Modal, Button } from 'antd';

const CompleteProfileModal = ({ visible, onCancel, onConfirm }) => {
  return (
    <Modal
      title="补全个人信息"
      visible={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          不修补
        </Button>,
        <Button key="submit" type="primary" onClick={onConfirm}>
          去修补
        </Button>
      ]}
    >
      <p>您的个人信息不完整，请补全后再继续使用本系统。否则将限制您的访问权限。</p>
    </Modal>
  );
};

export default CompleteProfileModal;
