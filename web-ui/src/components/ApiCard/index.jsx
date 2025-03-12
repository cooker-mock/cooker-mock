import { Card, Button, Space, Flex, Popconfirm, Typography } from 'antd';
import { EditFilled, DeleteFilled, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';

import './index.less';

const ApiCard = ({
  api,
  handleSceneClick,
  handleDeleteScene,
  handleEdit,
  handleDelete,
  openSceneDrawer,
}) => {
  return (
    <Card key={api.id} className="api-card">
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Space direction="vertical" size={16}>
          <Flex align="center" justify="flex-start" gap={24}>
            <Typography.Text style={{ fontSize: '16px', fontWeight: 'bold' }}>
              {api.path}
            </Typography.Text>
            {api.description && (
              <Typography.Text style={{ fontSize: '14px', color: 'gray' }}>
                {api.description}
              </Typography.Text>
            )}
          </Flex>

          <Space size={32}>
            <Space size={16}>
              {api.sceneList &&
                api.sceneList.map((scene) => {
                  const isActive = api.scene === scene;
                  return (
                    <Button
                      key={scene}
                      type={isActive ? 'primary' : 'default'}
                      className="scene-button"
                      onClick={() => handleSceneClick(api.id, scene)}
                    >
                      <Flex align="center" justify="center" gap={8}>
                        <div>{scene}</div>
                        <div
                          className="edit-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openSceneDrawer(api.id, scene);
                          }}
                        >
                          <EditOutlined className="edit-button-oulined" />
                          <EditFilled className="edit-button-filled" />
                        </div>
                        <Popconfirm
                          title="Are you sure to delete this scene?"
                          onConfirm={() => handleDeleteScene(api.id, scene)}
                        >
                          <div className="delete-button">
                            <DeleteOutlined className="delete-button-oulined" />
                            <DeleteFilled className="delete-button-filled" />
                          </div>
                        </Popconfirm>
                      </Flex>
                    </Button>
                  );
                })}
            </Space>
            <Button variant="filled" color="primary" onClick={() => openSceneDrawer(api.id)}>
              + create scene
            </Button>
          </Space>
        </Space>

        <div>
          <Button type="link" onClick={() => handleEdit(api.id)}>
            <EditOutlined style={{ fontSize: '16px' }} />
          </Button>
          <Popconfirm
            title="Are you sure to delete this API?"
            onConfirm={() => handleDelete(api.id)}
          >
            <Button type="link" danger>
              <DeleteOutlined style={{ fontSize: '16px' }} />
            </Button>
          </Popconfirm>
        </div>
      </div>
    </Card>
  );
};

ApiCard.propTypes = {
  api: PropTypes.object.isRequired,
  handleSceneClick: PropTypes.func.isRequired,
  handleDeleteScene: PropTypes.func.isRequired,
  handleEdit: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  openSceneDrawer: PropTypes.func.isRequired,
};

export default ApiCard;
