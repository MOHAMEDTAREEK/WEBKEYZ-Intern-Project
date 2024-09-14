export enum ErrorMessage {
  EMAIL_REQUIRED = "Email query parameter is required",
  USER_CREATION_FAILED = "Failed to create user",
  INVALID_CREDENTIALS = "Invalid credentials",
  INVALID_SEARCH_TERM = "Invalid search term",
  NO_USERS_FOUND = "No users found",
  USER_NOT_FOUND = "User not found",
  USER_ALREADY_EXISTS = "User already exists",
  FAILED_TO_GENERATE_ACCESS_TOKEN = "Failed to generate new access token",
  FAILED_TO_GENERATE_RESET_TOKEN = "Failed to generate reset token",
  TOKEN_REQUIRED = "Token is required",
  INVALID_OR_EXPIRED_TOKEN = "Invalid or expired token",
  AUTHENTICATION_FAILED = "Authentication failed",
  FAILED_TO_GENERATE_TOKENS = "Error generating tokens",
  ACCESS_TOKEN_REQUIRED = "Access token is required",
  REFRESH_TOKEN_REQUIRED = "Refresh token is required",
  ERROR_CREATING_USER = "Error creating user",
  ERROR_GENERATING_TOKENS = "Error generating tokens",
  INVALID_REFRESH_TOKEN = "Invalid refresh token",
  INVALID_RESET_TOKEN = "Invalid reset token",
  INVALID_TOKEN = "Invalid token",
  NO_POSTS_FOUND = "No posts found",
  POST_NOT_FOUND = "Post not found",
  INTERNAL_SERVER_ERROR = "Internal server error",
  NO_FILE_UPLOADED = "No file uploaded",
  MENTION_NOT_FOUND = "No mentions found",
  FAILED_TO_CREATE_POST = "Failed to create post",
  FAILED_TO_UPDATE_POST = "Failed to update post",
  FAILED_TO_PARTIALLY_UPDATE_POST = "Failed to partially update post",
  FAILED_TO_DELETE_POST = "Failed to delete post",
  FAILED_TO_UPLOAD_PHOTO = "Failed to upload photo",
  FAILED_TO_CREATE_POST_WITH_MENTION = "Failed to create post with mention",
  FAILED_TO_CREATE_MENTION = "Failed to create mention",
  FAILED_TO_GET_MENTIONS = "Failed to get mentions",
  COMMENT_NOT_FOUND = "Comment not found",
  COMMENT_CREATION_FAILED = "Failed to create comment",
  INVALID_IMAGE_FORMAT = "Invalid file type. Only JPEG, PNG, and GIF are allowed",
  INVALID_ACCESS_TOKEN = "Invalid access token",
  ACCESS_TOKEN_EXPIRED = "Access token expired",
  FORBIDDEN_ACTION = "Forbidden: You do not have access to this resource",
  SOMETHING_WENT_WRONG = "Something went wrong",
  DATABASE_ERROR_OCCURRED = "Database error occurred",
  IMAGE_URL_NOT_FOUND = "Image URL not found",
  USER_ALREADY_VOTED = "User has already voted for this nomination",
  NOMINATION_POST_NOT_FOUND = "Nomination post not found",
  POST_NOT_PINNED = "Post not pinned",
}
