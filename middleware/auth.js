const jwt = require('jsonwebtoken')

/**
 * Protect Middleware
 * Verifies JWT token before allowing access to protected routes
 * When frontend sends token, middleware checks and verifies it
 * then extracts user info and allows access, or blocks if invalid
 */
module.exports = (req, res, next) => {
    try {
        const token = req.header('Authorization')

        if (!token) {
            return res.status(401).json({ error: 'Access denied' })
        }

        // verify token and extract user info
        const verified = jwt.verify(
            token.replace('Bearer ', ''),
            process.env.JWT_SECRET
        )

        req.user = verified // store logged-in user info in request
        next()

    } catch (err) {
        res.status(401).json({ error: 'Invalid token' })
    }
}