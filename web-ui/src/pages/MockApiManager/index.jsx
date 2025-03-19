/**
 * MockApiList Component provides a UI for managing mock APIs, including creating, editing,
 * and deleting APIs and their associated response scenes.
 *
 * @file MockApiList.jsx
 * @author Boyuan Zhang, <249454830>, <bzhang@algomau.ca>
 * @author Xicheng Yin, <249508610>, <xyin@algomau.ca>
 */
import React, { useState, useEffect } from 'react';
import { Button, Space, message, Form, Input, Select, Typography, Drawer, Tooltip } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import Editor from '@monaco-editor/react';

import ApiCard from '../../components/ApiCard';

const { Title, Text } = Typography;
const { Option } = Select;

/** Default values for a new API */
const defaultApiValues = {
  method: 'ALL',
};

/** Default response structure for a new scene */
const defaultSceneResponse = {
  success: '',
  data: [
    {
      name: '',
      age: '',
      studentId: '',
      message: '',
    },
  ],
};

/**
 * MockApiList Component - Handles CRUD operations for mock APIs
 * @returns {JSX.Element} The Mock API management interface
 */
const MockApiList = () => {
  const [mockApis, setMockApis] = useState([]);

  const [isApiDrawerVisible, setIsApiDrawerVisible] = useState(false);
  const [isSceneDrawerVisible, setIsSceneDrawerVisible] = useState(false);
  const [form] = Form.useForm();
  const [sceneForm] = Form.useForm();
  const [sceneEditorContent, setSceneEditorContent] = useState(
    JSON.stringify(defaultSceneResponse, null, 2)
  );
  const [selectedApiId, setSelectedApiId] = useState(null);
  const [selectedScene, setSelectedScene] = useState(null);
  const [isAiFillingLoading, setIsAiFillingLoading] = useState(false);

  const sceneEditorRef = React.useRef(null);

  /**
   * Fetches all mock APIs
   */
  const fetchMockApis = async () => {
    try {
      const response = await axios.get('/v1/mock-apis');
      setMockApis(response.data);
    } catch (error) {
      console.error('Failed to fetch Mock APIs:', error);
      message.error('Failed to fetch Mock APIs');
    }
  };

  useEffect(() => {
    fetchMockApis();
  }, []);

  /**
   * Deletes a mock API
   * @param {string} apiId - The ID of the API to delete
   */
  const handleDelete = async (apiId) => {
    try {
      await axios.delete(`/v1/mock-apis/${apiId}`);
      message.success('API deleted successfully');
      fetchMockApis();
    } catch (error) {
      console.error('Failed to delete API:', error);
      message.error('Failed to delete API');
    }
  };

  /** Opens the drawer to create a new API */
  const handleCreateApi = () => {
    form.resetFields();
    setIsApiDrawerVisible(true);
  };

  /**
   * Edit an existing API
   * @param {string} apiId - The ID of the API to edit
   */
  const handleEdit = async (apiId) => {
    try {
      const apiData = mockApis.find((api) => api.id === apiId);

      setSelectedApiId(apiId);

      // Reset form and fill existing data
      form.resetFields();
      form.setFieldsValue({
        path: apiData.path,
        method: apiData.method || 'ALL',
        description: apiData.description || '',
      });

      setIsApiDrawerVisible(true);
    } catch (error) {
      console.error('Failed to get API details:', error);
      message.error('Failed to load API details');
    }
  };

  /**
   * Saves an API
   */
  const handleSaveApi = async () => {
    try {
      const values = await form.validateFields();
      const { path, description, method } = values;

      if (selectedApiId) {
        // update selected API
        await axios.put(`/v1/mock-apis/${selectedApiId}`, {
          path,
          description,
          method,
        });
        message.success('API updated successfully');
      } else {
        // create new API
        await axios.post('/v1/mock-apis', {
          path,
          description,
          method,
        });
        message.success('API created successfully');
      }

      setIsApiDrawerVisible(false);
      setSelectedApiId(null); // Reset selectedApiId
      fetchMockApis();
    } catch (error) {
      console.error('Failed to save API:', error);
      message.error('Failed to save API');
    }
  };

  /**
   * Opens the scene drawer for editing or creating
   * @param {string} apiId - The ID of the API
   * @param {string} [scene] - The scene name to edit
   */
  const openSceneDrawer = async (apiId, scene) => {
    setSelectedApiId(apiId);

    if (scene) {
      setSelectedScene(scene);
      sceneForm.setFieldsValue({
        sceneName: scene,
      });
      const response = await axios.get(`/v1/scenes/${apiId}/${scene}`);
      setSceneEditorContent(response.data);
      setIsSceneDrawerVisible(true);
    } else {
      setSelectedScene(null);
      sceneForm.resetFields();
      setSceneEditorContent(JSON.stringify(defaultSceneResponse, null, 2));
      setIsSceneDrawerVisible(true);
    }
  };
  /**
   * Closes the scene drawer
   */
  const handleSceneDrawerClose = () => {
    setIsSceneDrawerVisible(false);
    setSelectedApiId(null);
  };

  /**
   * Handles the creation of a new scene
   */
  const handleCreateScene = async () => {
    try {
      const values = await sceneForm.validateFields();
      const { sceneName } = values;

      // Parse JSON from editor content
      let jsonResponse;
      try {
        jsonResponse = JSON.parse(sceneEditorContent);
      } catch (e) {
        message.error('Invalid JSON format in response');
        return;
      }

      await axios.post(`/v1/scenes/${selectedApiId}`, {
        scene: sceneName,
        response: JSON.stringify(jsonResponse),
      });

      message.success('Scene created successfully');
      handleSceneDrawerClose();
      fetchMockApis();
    } catch (error) {
      console.error('Failed to create scene:', error);
      message.error('Failed to create scene');
    }
  };

  /**
   * Activate a scene by updating the API's active scene field
   * @param {string} apiId - The ID of the API to update
   * @param {string} scene - The scene name to activate
   */
  const handleSceneClick = async (apiId, scene) => {
    const api = mockApis.find((api) => api.id === apiId);
    if (api.scene === scene) {
      return;
    }

    try {
      // Call the API to update the scene configuration
      await axios.put(`/v1/mock-apis/${apiId}`, {
        path: api.path,
        description: api.description,
        method: api.method,
        scene,
      });

      await fetchMockApis();

      message.success(`Switched to scene: ${scene}`);
    } catch (error) {
      console.error('Failed to switch scene:', error);
      message.error('Failed to switch scene');
    }
  };
  /**
   * Deletes a scene from an API
   * @param {string} apiId - The ID of the API to delete a scene from
   * @param {string} scene - The name of the scene to delete
   */
  const handleDeleteScene = async (apiId, scene) => {
    try {
      await axios.delete(`/v1/scenes/${apiId}/${scene}`);
      message.success('Scene deleted successfully');
      fetchMockApis();
    } catch (error) {
      console.error('Failed to delete scene:', error);
      message.error('Failed to delete scene');
    }
  };

  /**
   * Handles scene editor mount
   * @param {object} editor - The editor instance
   * @param {object} monaco - Monaco editor instance
   */
  const handleSceneEditorDidMount = (editor, monaco) => {
    sceneEditorRef.current = editor;

    // Add formatting action
    editor.addAction({
      id: 'format-json',
      label: 'Format JSON',
      keybindings: [monaco.KeyMod.Alt | monaco.KeyCode.KeyF],
      run: (ed) => {
        try {
          const value = ed.getValue();
          const formatted = JSON.stringify(JSON.parse(value), null, 2);
          ed.setValue(formatted);
        } catch (e) {
          console.error('Failed to format JSON:', e);
        }
      },
    });
  };

  /**
   * Handles scene editor content change
   * @param {string} value - New value of the editor content
   */
  const handleSceneEditorChange = (value) => {
    setSceneEditorContent(value);
  };

  /**
   * Handles AI Filling
   */
  const handleAiFilling = async () => {
    try {
      setIsAiFillingLoading(true);
      const response = await axios.post(`/v1/open-ai/ai-filling`, {
        response: sceneEditorContent,
      });
      setSceneEditorContent(response.data);
      message.success('AI Filling successfully');
    } catch (error) {
      console.error('Failed to AI Filling:', error);
      message.error('Failed to AI Filling');
    } finally {
      setIsAiFillingLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Title level={2}>Mock API List</Title>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateApi}>
            New
          </Button>
        </Space>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <Text>{mockApis.length} APIs in total</Text>
      </div>

      {mockApis.map((api) => (
        <ApiCard
          key={api.id}
          api={api}
          handleSceneClick={handleSceneClick}
          handleDeleteScene={handleDeleteScene}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          openSceneDrawer={openSceneDrawer}
        />
      ))}

      {/* Create API Drawer */}
      <Drawer
        title={selectedApiId ? 'Edit API' : 'Create New API'}
        placement="right"
        width={800}
        onClose={() => {
          setIsApiDrawerVisible(false);
          setSelectedApiId(null); // 关闭时重置selectedApiId
        }}
        open={isApiDrawerVisible}
        extra={
          <Button type="primary" onClick={handleSaveApi}>
            {selectedApiId ? 'Update' : 'Create'}
          </Button>
        }
      >
        <Form form={form} layout="vertical" initialValues={defaultApiValues}>
          <Form.Item
            name="path"
            label="Path"
            rules={[{ required: true, message: 'Please enter API path' }]}
          >
            <Input placeholder="/api/example" />
          </Form.Item>

          <Form.Item name="method" label="Method" initialValue="ALL">
            <Select>
              <Option value="ALL">ALL</Option>
              <Option value="GET">GET</Option>
              <Option value="POST">POST</Option>
              <Option value="PUT">PUT</Option>
              <Option value="DELETE">DELETE</Option>
            </Select>
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={4} placeholder="API description" />
          </Form.Item>
        </Form>
      </Drawer>

      {/* Create Scene Drawer */}
      <Drawer
        title={selectedScene ? 'Edit Scene' : 'Create New Scene'}
        placement="right"
        width={800}
        onClose={() => handleSceneDrawerClose()}
        open={isSceneDrawerVisible}
        extra={
          <Button type="primary" onClick={handleCreateScene}>
            {selectedScene ? 'Update' : 'Create'}
          </Button>
        }
      >
        <Form form={sceneForm} layout="vertical">
          <Form.Item
            name="sceneName"
            label="Scene Name"
            rules={[{ required: true, message: 'Please enter scene name' }]}
            required={!selectedScene}
          >
            {selectedScene ? (
              <div>{sceneForm.getFieldValue('sceneName')}</div>
            ) : (
              <Input placeholder="default" />
            )}
          </Form.Item>

          <Form.Item
            label={
              <Space size="large">
                <Text>Response Data (JSON)</Text>
                <Tooltip title="AI Filling is a feature that uses AI to generate synthetic data for the API response data. You can leave the value empty, or write comments (with //) in the JSON data to guide the AI to generate the data.">
                  <Button type="primary" onClick={handleAiFilling} loading={isAiFillingLoading}>
                    AI Filling
                  </Button>
                </Tooltip>
              </Space>
            }
          >
            <div style={{ border: '1px solid #d9d9d9', borderRadius: '2px' }}>
              <Editor
                height="400px"
                defaultLanguage="json"
                value={sceneEditorContent}
                onChange={handleSceneEditorChange}
                onMount={handleSceneEditorDidMount}
                options={{
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  formatOnPaste: true,
                  formatOnType: true,
                  tabSize: 2,
                  folding: true,
                }}
                theme="vs-dark"
              />
            </div>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default MockApiList;
