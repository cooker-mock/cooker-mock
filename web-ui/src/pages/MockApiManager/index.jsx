import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Input,
  Form,
  Tag,
  Space,
  message,
  Select,
  Drawer,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import SceneManager from '../../components/SceneManager.jsx';
import { useNavigate } from 'react-router-dom';


const { Option } = Select;

const MockApiManager = () => {
  const [apiList, setApiList] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingApi, setEditingApi] = useState(null);
  const [form] = Form.useForm();
  const [scenes, setScenes] = useState([]);
  const [isSceneDrawerVisible, setIsSceneDrawerVisible] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    fetchApiList();
  }, []);

  const fetchApiList = async () => {
    try {
      const response = await axios.get('/v1/mock-apis/with-scene');
      setApiList(response.data);
    } catch (error) {
      message.error('Failed to fetch mock APIs.');
    }
  };
  const handleSaveScenes = async () => {
    if (!editingApi) return;

    try {
      await axios.put(`/api/mock/${editingApi.id}/scenes`, { scenes });
      message.success('Scenes update success');
          
    } catch (error) {
      
      message.error('Failed to update scenes');
    }
    setIsSceneDrawerVisible(false);
  };
  const handleCreate = async (values) => {
    try {
      if (editingApi) {
        await axios.put(`/v1/mock-apis/with-scene/${editingApi.id}`, values);
        message.success('Mock API updated successfully!');
      } else {
        await axios.post('/v1/mock-apis', values);
        message.success('Mock API created successfully!');
      }
      fetchApiList();
      setIsModalVisible(false);
      form.resetFields();
      setEditingApi(null);
    } catch (error) {
      message.error('Failed to save mock API.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/v1/mock-apis/${id}`);
      message.success('Mock API deleted successfully!');
      fetchApiList();
    } catch (error) {
      message.error('Failed to delete mock API.');
    }
  };

  const fetchMockApiById = async (id) => {
    try {
      const response = await axios.get(`/api/mock/${id}`);
      console.log('Fetched API:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching API:', error);
      message.error('Failed to fetch API details.');
      return null;
    }
  };

  const openModal = async(api) => {
    setEditingApi(api);
    setIsModalVisible(true);
    if (api) {
    const latestApi = await fetchMockApiById(api.id); 
    if (latestApi) {
      form.setFieldsValue(latestApi); 
    }
  } else {
    form.resetFields(); 
  }
  };

  const openCreateScene = (api) => {
    if (!api) return;
    setEditingApi(api);
    setScenes(api.scenes || []); 
    setIsSceneDrawerVisible(true);
  };

  useEffect(() => {
    if (editingApi) {
      setApiList(prevApiList =>
        prevApiList.map(api =>
          api.id === editingApi.id ? { ...api, scenes } : api
        )
      );
    }
  }, [scenes, editingApi]);

  const closeCreateScene = () => {
    setIsSceneDrawerVisible(false);
    setEditingApi(null);  
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setEditingApi(null);
    form.resetFields();
  };

  const columns = [
    {
      title: 'Path',
      dataIndex: 'path',
      key: 'path',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Method',
      dataIndex: 'method',
      key: 'method',
    },
    {
      title: 'Scene',
      dataIndex: 'scene',
      key: 'scene',
      render: (scene) => <Tag color="blue">{scene}</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => openModal(record)}>
            Edit
          </Button>
          <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)}>
            Delete
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openCreateScene(record)}
          >
            Manage scenes
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between' }}>
        <h2>Mock API Manager</h2>
        <div><Button
          type="default"
          onClick={() => navigate('/user-simulation')}
        >
          User Simulation
        </Button>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openModal(null)}
        >
          New
        </Button></div>

      </div>

      <Table columns={columns} dataSource={apiList} rowKey="id" />

      <Drawer
        title={editingApi ? 'Edit API Mock' : 'Create API Mock'}
        open={isModalVisible}
        onClose={closeModal}
        onOk={() => form.submit()}
        okText={editingApi ? 'Save' : 'Create'}
        extra={
          <Space>
            <Button onClick={closeModal}>Cancel</Button>
            <Button onClick={() => form.submit()} type="primary">
            {editingApi ? 'Save' : 'Create'}
            </Button>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
          initialValues={{
            method: 'ALL',
            path: '/api/getUserName',
            scene: 'default',
            description: 'Get user name',
            response: '{"message": "1111Default mock data"}',
          }}
        >
          <Form.Item
            name="path"
            label="Path"
            rules={[{ required: true, message: 'Please enter the API path!' }]}
          >
            <Input placeholder="e.g., /api/getUserName" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter a description!' }]}
          >
            <Input placeholder="e.g., Get user name" />
          </Form.Item>

          <Form.Item
            name="method"
            label="Method"
            rules={[{ required: true, message: 'Please select an HTTP method!' }]}
          >
            <Select>
              <Option value="ALL">ALL</Option>
              <Option value="GET">GET</Option>
              <Option value="POST">POST</Option>
              <Option value="PUT">PUT</Option>
              <Option value="DELETE">DELETE</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="scene"
            label="Scene"
            rules={[{ required: true, message: 'Please select a default scene!' }]}
            style={{ display: 'none' }}
          >
            <Input placeholder="e.g., default" />
          </Form.Item>

          <Form.Item
            name="response"
            label="Response"
            rules={[{ required: true, message: 'Please enter a valid JSON response!' }]}
            style={{ display: 'none' }}
          >
            <Input.TextArea rows={10} placeholder='e.g., {"message": "Default mock data"}' />
          </Form.Item>
        </Form>
      </Drawer>
      <Drawer
        title="Manage Scenes"
        open={isSceneDrawerVisible}
        onClose={closeCreateScene}
        width={999}
        extra={
          <Button type="primary" onClick={handleSaveScenes}>
            Save Scenes
          </Button>
        }
      >
        <SceneManager scenes={scenes} setScenes={setScenes} />
      </Drawer>
    </div >
  );
};

export default MockApiManager;
