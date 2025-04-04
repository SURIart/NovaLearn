const bcrypt = require('bcrypt');

async function HashPassword(password) {
    const saltRounds = 10;
    const HashedPassword = await bcrypt.hash(password,saltRounds);
    return HashedPassword;
}

async function DeHashPassword(password,hashedPassword) {
    const comparedResult = await bcrypt.compare(password,hashedPassword);
    return comparedResult;
}

module.exports  = {HashPassword,DeHashPassword};