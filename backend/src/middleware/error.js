export function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Route not found: ${req.originalUrl}`));
}

export function errorHandler(err, req, res, next) {
  let status = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  let message = err.message || 'Server error';

  if (err.code === 11000) {
    status = 409;
    message = 'That email or username is already in use';
  }
  if (err.name === 'MulterError') {
    status = 400;
    message = err.code === 'LIMIT_FILE_SIZE' ? 'Image must be smaller than 5 MB' : err.message;
  }
  if (message.startsWith('Only JPG')) status = 400;

  res.status(status).json({
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
}
