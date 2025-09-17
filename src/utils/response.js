export const sendResponse = (data, statusCode, res, message) => {
  res.status(statusCode).json({ success: true, data, message });
};
