const jwt = require("jsonwebtoken");



function authJWT() {
    const secret = process.env.secret;
    const api_url = process.env.API_URL;

    
    return {
        isRevoked: isRevoked,
    };
}


async function isRevoked(req, token) {
    try {
        const decodedToken = jwt.decode(token);
        if (decodedToken && decodedToken.isAdmin === false) {
            return true;
        }
        return false;
    } catch (err) {
        console.error('Error decoding token:', err);
        return true; // or false, depending on your error-handling strategy
    }
}


const validateToken = async (req, res, next) => {
    try {
        const token = req.cookies && req.cookies.token;

        if (!token) {
            console.error("Unauthorized: No token provided");
            return res.redirect("/");
        }

        const user = jwt.verify(token, process.env.secret);
        req.user = user;
        next();
    } catch (err) {
        console.error("Unauthorized: Invalid token");
        res.clearCookie("token");
        return res.redirect("/");
    }
};





// const validateToken = async (req, res, next) => {
//     let token;
//     console.log("BBBBBBBBBBBBBBB");
//     let authHeader = req.headers.Authorization || req.headers.authorization;
//     if (authHeader && authHeader.startsWith("Bearer")) {
//         token = authHeader.split(" ")[1];
//         jwt.verify(token, process.env.secret, (err, decoded) => {
//         if (err) {
//             res.status(401);
//             throw new Error("User is not authorized");
//         }
//         req.user = decoded.user;
//         next();
//         });

//         if (!token) {
//         res.status(401);
//         throw new Error("User is not authorized or token is missing");
//         }
//     }
// }

module.exports = {authJWT, validateToken};
