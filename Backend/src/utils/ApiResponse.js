class ApiResponse {
  constructor({ data = null, message = 'Success', meta = null, statusCode = 200 }) {
    this.success = true;
    this.message = message;
    this.data = data;
    this.meta = meta;
    this.statusCode = statusCode;
  }

  send(res) {
    const payload = { success: this.success, message: this.message, data: this.data };
    if (this.meta) payload.meta = this.meta;
    return res.status(this.statusCode).json(payload);
  }

  static ok(res, data, message = 'Success', meta = null) {
    return new ApiResponse({ data, message, meta, statusCode: 200 }).send(res);
  }

  static created(res, data, message = 'Created') {
    return new ApiResponse({ data, message, statusCode: 201 }).send(res);
  }

  static accepted(res, data, message = 'Accepted') {
    return new ApiResponse({ data, message, statusCode: 202 }).send(res);
  }

  static noContent(res) {
    return res.status(204).send();
  }
}

module.exports = ApiResponse;
