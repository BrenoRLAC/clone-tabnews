import retry from "async-retry";

async function fetchStatusPage() {
  const response = await fetch("http://localhost:3000/api/v1/status");

  if (!response.ok) {
    throw new Error(`Http error ${response.status}`);
  }

  return await response.json();
}

async function waitForWebServer() {
  return retry(fetchStatusPage, {
    retries: 100,
    maxTimeout: 1000,
  });
}

async function waitForAllServices() {
  await waitForWebServer();
}

export default {
  waitForAllServices,
};
