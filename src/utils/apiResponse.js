/**
 * Standardized API Response formatter
 */
class apiResponse {
  /**
   * Success response
   * @param {string} message - Success message
   * @param {*} data - Response data
   * @param {number} statusCode - HTTP status code
   */
  static success(message = "Success", data = null, statusCode = 200) {
    const response = {
      success: true,
      message,
    };

    if (data !== null) {
      response.data = data;
    }

    return response;
  }

  /**
   * Error response
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {*} errors - Additional error details
   */
  static error(message = "Error", statusCode = 500, errors = null) {
    const response = {
      success: false,
      message,
    };

    if (errors) {
      response.errors = errors;
    }

    return response;
  }

  /**
   * Paginated response
   * @param {Array} data - Array of data
   * @param {number} page - Current page
   * @param {number} limit - Items per page
   * @param {number} total - Total count
   * @param {string} message - Success message
   */
  static paginated(data, page, limit, total, message = "Success") {
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      message,
      data,
      pagination: {
        currentPage: page,
        totalPages,
        pageSize: limit,
        totalItems: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }
}

module.exports = apiResponse;
