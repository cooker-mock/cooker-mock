import React, { useEffect, useState } from "react";
import { Input, 
  Select, 
  Button, 
  Card, 
  Typography, 
  message,
  Table,
  Tag
} from 'antd';

import { useNavigate } from 'react-router-dom';
const { Option } = Select;
const { Title, Text } = Typography;

const UserSimulation = () => {
  const [apiUrl, setApiUrl] = useState("");
  const [method, setMethod] = useState("GET");
  const [requestBody, setRequestBody] = useState("");
  const [response, setResponse] = useState(null);
  const [logs, setLogs] = useState([]);
  const [mockScenario, setMockScenario] = useState("default");
  const navigate = useNavigate();

  const availableScenarios = [
    { key: "default", name: "Default" },
    { key: "user_admin", name: "Admin" },
    { key: "user_guest", name: "Guest" },
    { key: "error_404", name: "404 error" },
    { key: "error_500", name: "500 error" }
  ];
  const [headers, setHeaders] = useState("");

  useEffect(() => {
    const savedLogs = JSON.parse(localStorage.getItem("requestLogs")) || [];
    setLogs(savedLogs);
  }, []);
  
  useEffect(() => {
    if (logs.length > 0) {
      localStorage.setItem("requestLogs", JSON.stringify(logs));
    }
  }, [logs]);
  const sendRequest = async () => {
    setResponse(null);
    message.loading("Sending request...", 1);
    let parsedHeaders = {};
    try {
      parsedHeaders = headers ? JSON.parse(headers) : {};
    } catch (error) {
      return message.error("Invalid JSON format in headers");
    }

    try {
      const options = {
        method,
        headers: { "Content-Type": "application/json", "X-Mock-Scenario": mockScenario, ...parsedHeaders },
        ...(method !== "GET" && requestBody ? { body: requestBody } : {}),
      };

      const res = await fetch(apiUrl, options);

      const data = await res.json();
      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        body: data,
      });

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

      <Button
          type="primary"
          onClick={() => navigate('/')}
        >
          Back
        </Button>
        
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
        <Text strong>Headers:</Text>
        <Input.TextArea
          rows={2}
          value={headers}
          onChange={(e) => setHeaders(e.target.value)}
          placeholder='Enter headers in JSON format (e.g. {"Authorization": "Bearer token"})'
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