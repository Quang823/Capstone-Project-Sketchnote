import { privateApi, publicApi } from "./axiosInstance";

export const resourceController = {
  getAllResource: async (page, size) => {
    return await publicApi.get(
      `/api/orders/template?page=${page}&size=${size}`
    );
  },

  getAllResourcePopular: async (limit) => {
    return await publicApi.get(`/api/orders/template/popular?limit=${limit}`);
  },

  getAllResourceLatest: async (limit) => {
    return await publicApi.get(`/api/orders/template/latest?limit=${limit}`);
  },

  getResourceById: async (id) => {
    return await publicApi.get(`/api/orders/template/${id}`);
  },

  uploadResource: async (data) => {
    return await privateApi.post(`/api/orders/template`, data);
  },

  getResourceByUserId: async (page, size) => {
    return await privateApi.get(
      `/api/orders/template/my-template?page=${page}&size=${size}`
    );
  },

  getProjectByUserId: async () => {
    return await privateApi.get(`/api/projects/me`);
  },

  uploadTemplate: async (projectId, data) => {
    return await privateApi.post(
      `/api/orders/template/sell/${projectId}`,
      data
    );
  },

  getResourceProjectByUserId: async (page, size) => {
    return await privateApi.get(
      `/api/orders/user_resources/user/me?page=${page}&size=${size}`
    );
  },
  getResourceProjectByUserIdV2: async () => {
    return await privateApi.get(
      `/api/orders/user_resources/user/me/templates/v2`
    );
  },


  ///////////////////////////////////////////////////

  createResourceVersion: async (resourceId, data) => {
    return await privateApi.post(
      `/api/orders//designer/products/${resourceId}/versions`,
      data
    );
  },

  getAllProductBuyDesigner: async (page, size, sortBy, sortDir, search, isArchived) => {
    // Build query params conditionally to avoid sending "null" as string
    let url = `/api/orders/designer/products?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}&search=${encodeURIComponent(search || "")}`;

    // Only add isArchived parameter if it's not null
    if (isArchived !== null && isArchived !== undefined) {
      url += `&isArchived=${isArchived}`;
    }

    return await privateApi.get(url);
  },
  republishResourceVersionWhenStaffNotConfirm: async (versionId) => {
    return await privateApi.post(
      `/api/orders/designer/products/versions/${versionId}/republish`
    );
  },
  archiveResourceTemplate: async (resourceTemplateId) => {
    return await privateApi.post(
      `/api/orders/designer/products/${resourceTemplateId}/archive`
    );
  },
  unarchiveResourceTemplate: async (resourceTemplateId) => {
    return await privateApi.post(
      `/api/orders/designer/products/${resourceTemplateId}/unarchive`
    );
  },
  deleteResourceVersion: async (versionId) => {
    return await privateApi.delete(
      `/api/orders/designer/products/versions/${versionId}`
    );
  },
  pubicResourceVersion: async (versionId) => {
    return await privateApi.post(
      `/api/orders/designer/products/versions/${versionId}/publish`
    );
  },
  updateResourceVersion: async (versionId, data) => {
    return await privateApi.put(
      `/api/orders/designer/products/versions/${versionId}`,
      data
    );
  },
};
