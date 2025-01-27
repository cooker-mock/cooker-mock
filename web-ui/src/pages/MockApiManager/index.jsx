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
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;

const MockApiManager = () => {
  const [apiList, setApiList] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingApi, setEditingApi] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchApiList();
  }, []);

  const fetchApiList = async () => {
    try {
      const response = await axios.get('/api/mock');
      setApiList(response.data);
    } catch (error) {
      message.error('Failed to fetch mock APIs.');
    }
  };

  const handleCreate = async (values) => {
    try {
      if (editingApi) {
        await axios.put(`/api/mock/${editingApi.id}`, values);
        message.success('Mock API updated successfully!');
      } else {
        await axios.post('/api/mock', values);
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
      await axios.delete(`/api/mock/${id}`);
      message.success('Mock API deleted successfully!');
      fetchApiList();
    } catch (error) {
      message.error('Failed to delete mock API.');
    }
  };

  const openModal = (api) => {
    setEditingApi(api);
    setIsModalVisible(true);
    if (api) {
      form.setFieldsValue(api);
    }
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
          <Button
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
          >
            Edit
          </Button>
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between' }}>
        <h2>Mock API Manager</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openModal(null)}
        >
          New
        </Button>
      </div>

      <Table columns={columns} dataSource={apiList} rowKey="id" />

      <Modal
        title={editingApi ? 'Edit API Mock' : 'Create API Mock'}
        open={isModalVisible}
        onCancel={closeModal}
        onOk={() => form.submit()}
        okText={editingApi ? 'Save' : 'Create'}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
          initialValues={{ method: 'ALL', path: '/api/getUserName', scene: 'default', description: 'Get user name', response: '{"message": "1111Default mock data"}' }}
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
          >
            <Input placeholder="e.g., default" />
          </Form.Item>

          <Form.Item
            name="response"
            label="Response"
            rules={[{ required: true, message: 'Please enter a valid JSON response!' }]}
          >
            <Input.TextArea rows={10} placeholder='e.g., {"message": "Default mock data"}' />
          </Form.Item>
        </Form>
      </Modal>
    </div >
  );
};

export default MockApiManager;
