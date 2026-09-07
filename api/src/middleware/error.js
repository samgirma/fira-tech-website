export function errorHandler(err, req, res, next) {
  console.error(`[${req.method}] ${req.path} → ${err.message}`)

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON' })
  }

  if (err.code === '23505') {
    return res.status(409).json({ error: 'Resource already exists' })
  }

  if (err.code === '23503') {
    return res.status(400).json({ error: 'Referenced resource not found' })
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  })
}

export function notFound(req, res) {
  res.status(404).json({ error: 'Endpoint not found' })
}
