const HOST = 'http://localhost:8088';
const WEBSOCKET_HOST = 'ws://localhost:8077';

const log = (...args) => {
  console.log(`%c👨‍🍳 ${args[0]}`, 'color: green', ...args.slice(1));
};

(async function () {
  let mockApis = [];
  let mode = 'mock';

  const ws = new WebSocket(WEBSOCKET_HOST);
  ws.onopen = () => {
    log('Cooker is running...');
  };
  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);

    if (message.type === 'FILE_CHANGE') {
      console.log('Mock file changed', message.path);
      // refresh api list
      fetchMockApis();
    }
  };

  const fetchMockApis = async () => {
    try {
      const response = await fetch(`${HOST}/v1/mock-apis`);
      mockApis = await response.json();
      log(`${mockApis.length} mock APIs found`, mockApis);
    } catch (error) {
      console.error('Error fetching mock APIs:', error);
    }
  };

  const matchApi = (url, method) => {
    const urlObj = new URL(url, window.location.origin);
    return mockApis.find((api) => {
      const mockApiUrlObj = new URL(api.path, urlObj.origin);
      const methodMatched =
        api.method.toUpperCase() === method.toUpperCase() || api.method.toUpperCase() === 'ALL';
      const pathnameMatched = urlObj.pathname === mockApiUrlObj.pathname;
      const searchParamsMatched = [...mockApiUrlObj.searchParams].every(([key, value]) => {
        const actualValue = urlObj.searchParams.get(key);
        return value === '*' || actualValue === value; // * support, any value in query param
      });
      return methodMatched && pathnameMatched && searchParamsMatched;
    });
  };

  const originalFetch = window.fetch;
  const originalXHROpen = XMLHttpRequest.prototype.open;
  const originalXHRSend = XMLHttpRequest.prototype.send;

  const interceptFetch = async function (input, init = {}) {
    const url = typeof input === 'string' ? input : input.url;
    const method = init.method || 'GET';

    const matchedApi = matchApi(url, method);
    if (matchedApi) {
      log('Intercepting request:', url, matchedApi);
      const sceneResponse = await fetch(`${HOST}/v1/scenes/${matchedApi.id}/${matchedApi.scene}`);
      const sceneData = JSON.parse(await sceneResponse.json());
      log('Returning mock response:', sceneData);

      return new Response(JSON.stringify(sceneData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return originalFetch(input, init);
  };

  const interceptXHROpen = function (method, url) {
    this._method = method;
    this._url = url;
    originalXHROpen.apply(this, arguments);
  };

  const interceptXHRSend = function (body) {
    const matchedApi = matchApi(this._url, this._method);
    if (matchedApi) {
      log('Mocking XHR request:', this._url);
      this.onload = () => {
        this.readyState = 4;
        this.status = 200;
        this.responseText = matchedApi.response;
        this.onreadystatechange && this.onreadystatechange();
      };
    }
    originalXHRSend.call(this, body);
  };

  const updateInterceptors = () => {
    if (mode === 'mock') {
      window.fetch = interceptFetch;
      XMLHttpRequest.prototype.open = interceptXHROpen;
      XMLHttpRequest.prototype.send = interceptXHRSend;
    } else {
      window.fetch = originalFetch;
      XMLHttpRequest.prototype.open = originalXHROpen;
      XMLHttpRequest.prototype.send = originalXHRSend;
    }
  };

  // Listen for messages from content.js
  window.addEventListener('message', (event) => {
    if (event.source !== window || event.data.type !== 'MODE') {
      return;
    }
    mode = event.data.mode;
    updateInterceptors();
  });

  // Request the mode from content.js, get from chrome.storage.sync, post back by message, up there⬆️
  window.postMessage({ type: 'GET_MODE' }, '*');

  await fetchMockApis();
  updateInterceptors();
})();
