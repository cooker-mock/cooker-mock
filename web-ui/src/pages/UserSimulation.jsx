import React, { useState } from "react";
import { Input, 
  Select, 
  Button, 
  Card, 
  Typography, 
  message 
} from 'antd';

const { Option } = Select;
const { Title, Text } = Typography;

const UserSimulation = () => {
  const [apiUrl, setApiUrl] = useState("https://mock.api/endpoint");
  const [method, setMethod] = useState("GET");
  const [requestBody, setRequestBody] = useState("");
  const [response, setResponse] = useState(null);
  const [logs, setLogs] = useState([]);
  const [mockScenario, setMockScenario] = useState("default");

  const availableScenarios = [
    { key: "default", name: "default scene" },
    { key: "user_admin", name: "admin scene" },
    { key: "user_guest", name: "guest scene" },
    { key: "error_404", name: "mock 404 error scene" },
    { key: "error_500", name: "mock 500 error scene" }
  ];

  const sendRequest = async () => {
    setResponse(null);
    message.loading("Sending request...", 1);

    try {
      const options = {
        method,
        headers: { "Content-Type": "application/json", "X-Mock-Scenario": mockScenario },
        ...(method !== "GET" && requestBody ? { body: requestBody } : {}),
      };

      const res = await fetch(apiUrl, options);

      const data = await res.json();
      const responseDetails = {
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        body: data,
      };

      setResponse(responseDetails);
      setLogs((prevLogs) => [
        ...prevLogs,
        {
          method,
          apiUrl,
          status: res.status,
          statusText: res.statusText,
          scenario: mockScenario,
          time: new Date().toLocaleTimeString(),
        }
      ]);
    } catch (error) {
      message.error("request error");
      setResponse({ error: "request error" });
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "auto" }}>
      <Title level={2}>User Simulation</Title>

      <Card style={{ marginBottom: 16 }}>
        <Text strong>API URL:</Text>
        <Input
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
          placeholder="Enter your api"
          style={{ marginTop: 8 }}
        />
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <Text strong>Method:</Text>
        <Select value={method} onChange={setMethod} style={{ width: "100%", marginTop: 8 }}>
          <Option value="GET">GET</Option>
          <Option value="POST">POST</Option>
          <Option value="PUT">PUT</Option>
          <Option value="DELETE">DELETE</Option>
        </Select>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <Text strong>Mock Scenario:</Text>
        <Select value={mockScenario} onChange={setMockScenario} style={{ width: "100%", marginTop: 8 }}>
          {availableScenarios.map(scenario => (
            <Option key={scenario.key} value={scenario.key}>
              {scenario.name}
            </Option>
          ))}
        </Select>
      </Card>

      {(method === "POST" || method === "PUT") && (
        <Card style={{ marginBottom: 16 }}>
          <Text strong>Request Body:</Text>
          <Input.TextArea
            rows={4}
            value={requestBody}
            onChange={(e) => setRequestBody(e.target.value)}
            placeholder="Enter JSON body"
            style={{ marginTop: 8 }}
          />
        </Card>
      )}

      <Button type="primary" block onClick={sendRequest}>
        submit
      </Button>

      {response && (
        <Card title="Response" style={{ marginTop: 16 }}>
          {response.error ? (
            <Text type="danger">{response.error}</Text>
          ) : (
            <>
              <Text strong>Status:</Text> {response.status} ({response.statusText})
              <br />
              <Text strong>Headers:</Text>
              <pre style={{ background: "#f5f5f5", padding: 10, marginTop: 8 }}>
                {JSON.stringify(response.headers, null, 2)}
              </pre>
              <Text strong>Response Body:</Text>
              <pre style={{ background: "#f5f5f5", padding: 10, marginTop: 8 }}>
                {JSON.stringify(response.body, null, 2)}
              </pre>
            </>
          )}
        </Card>
      )}

      {logs.length > 0 && (
        <Card title="Request Logs" style={{ marginTop: 16 }}>
          <Table
            dataSource={logs.map((log, index) => ({ ...log, key: index }))}
            columns={[
              { title: "Time", dataIndex: "time", key: "time" },
              { title: "Method", dataIndex: "method", key: "method" },
              { title: "API URL", dataIndex: "apiUrl", key: "apiUrl" },
              { title: "Scenario", dataIndex: "scenario", key: "scenario" },
              {
                title: "Status",
                dataIndex: "status",
                key: "status",
                render: (status, record) =>
                  status >= 400 ? <Tag color="red">{status} ({record.statusText})</Tag> : <Tag color="green">{status} ({record.statusText})</Tag>,
              },
            ]}
            pagination={{ pageSize: 5 }}
          />
        </Card>
      )}
    </div>
  );
};

export default UserSimulation;