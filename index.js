module.exports = process.env.CONFIDENCIAL_COV
    ? require('./lib-cov/confidencial')
    : require('./lib/confidencial');