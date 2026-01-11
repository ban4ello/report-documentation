// import jsonBig from "json-bigint";

export default {
  // baseURL должен включать /api/ в конце
  baseURL: `${import.meta.env.VITE_API_HOST || 'https://report-documentation-api-production.up.railway.app'}/api/`,
  timeout: 10000,
  // withCredentials: false,
  // responseType: 'text',
  maxContentLength: 2000,
  validateStatus: function (status) {
    return status >= 200 && status < 300;
  },
  maxRedirects: 5
};
