import React, { useState } from 'react';
import { Table, Button, Input, Modal, Space, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const SceneManager = ({ scenes, setScenes }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingScene, setEditingScene] = useState(null);
  const [sceneData, setSceneData] = useState({ name: '', response: '' });

  const openModal = (scene = null) => {
    setEditingScene(scene);
    setSceneData(scene || { name: '', response: '' });
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setEditingScene(null);
    setSceneData({ name: '', response: '' });
  };

  const handleSave = async () => {
    if (!sceneData.name.trim() || !sceneData.response.trim()) {
      message.error('Scene name and response cannot be empty.');
      return;
    }
  
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(sceneData.response); //in here, need to make sure it is json format
    } catch (error) {
      message.error('Response must be valid JSON.');
      return;
    }
  
    const newScene = {
      name: sceneData.name,
      response: parsedResponse, 
    };
  
    try {
      const newScenes = editingScene
        ? scenes.map(s => (s.name === editingScene.name ? newScene : s))
        : [...scenes, newScene];
  
      setScenes(newScenes);
  
      closeModal();
      message.success(editingScene ? 'Scene updated' : 'Scene added');
    } catch {
      message.error('Failed to save scene.');
    }
  };


  const handleDelete = (sceneName) => {
    setScenes(scenes.filter(s => s.name !== sceneName));
    message.success('Scene deleted');
  };

  const columns = [
    { title: 'Scene Name', dataIndex: 'name', key: 'name' },
    { title: 'Response', dataIndex: 'response', key: 'response' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openModal(record)}>Edit</Button>
          <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.name)}>Delete</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h3>Actions</h3>
      <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
        Create Scene
      </Button>
      <Table columns={columns} dataSource={scenes} rowKey="name" style={{ marginTop: 10 }} />

      <Modal
        title={editingScene ? 'Edit Scene' : 'Add Scene'}
        open={isModalVisible}
        onCancel={closeModal}
        onOk={handleSave}
      >
        <Input
          placeholder="Scene Name"
          value={sceneData.name}
          onChange={(e) => setSceneData({ ...sceneData, name: e.target.value })}
          style={{ marginBottom: 10 }}
        />
        <Input.TextArea
          rows={4}
          placeholder='Response JSON'
          value={sceneData.response}
          onChange={(e) => setSceneData({ ...sceneData, response: e.target.value })}
        />
      </Modal>
    </div>
  );
};

export default SceneManager;
