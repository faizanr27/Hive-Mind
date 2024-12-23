const jwt = require('jsonwebtoken');

const verifyToken = (req:any, res:any, next:any) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ message: 'Token is required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_key);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token is invalid' });
  }
};

export default verifyToken;