function errorHandler(err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({message: "User is not authorized or not an admin"});
    }

    if (err.name === 'ValidationError') {
        res.status(401).json({message: err.message});
    }


    return res.status(500).json({err: err.message});
}

module.exports = errorHandler