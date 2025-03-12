(async function () {
  let mockApis = [];
  let mode = 'mock';

  const fetchMockApis = async () => {
    try {
      const response = await fetch('http://localhost:8088/v1/mock-apis/with-scene');
      mockApis = await response.json();
      console.log('Fetched mock APIs:', mockApis);
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
    console.log('Intercepting fetch request:', url, method);

    const matchedApi = matchApi(url, method);
    if (matchedApi) {
      console.log('Mocking fetch request:', url);
      return new Response(matchedApi.response, {
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
      console.log('Mocking XHR request:', this._url);
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
