const jwt = require("jsonwebtoken")
//When frontend sends:TOKEN the middleware:checks token & verifies it &extracts user info &allows access
// OR: blocks access if invalid/not logged in.
module.exports = (req, res, next) => {

    try {

        const token = req.header("Authorization")

        if (!token) {

            return res.status(401).json({
                error: "Access denied"
            })

        }

        const verified = jwt.verify(
            token.replace("Bearer ", ""),
            process.env.JWT_SECRET
        )

        req.user = verified

        next()

    } catch (err) {

        res.status(401).json({
            error: "Invalid token"
        })

    }

}