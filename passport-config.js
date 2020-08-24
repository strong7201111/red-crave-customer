const localStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const database = require("./database.js");
const pool = database.pool;

function initialize(passport) {
  //
  const authenticateUser = async (email, password, done) => {
    const data = await pool.query("select * from \"USERS\" where \"EMAIL\" = $1", [email]);
    const user = data.rows[0];

    if (user == null) {
      return done(null, false, { message: "no user found by this email" });
    }

    try {
      const userPassword = user.PASSWORD;
      if (await bcrypt.compare(password, userPassword)) {
        return done(null, user);
      } else {
        return done(null, false, { message: "incorrect password" });
      }
    } catch (error) {
      return done(error);
    }
  };

  passport.use(new localStrategy({ usernameField: "email" }, authenticateUser));
  passport.serializeUser((user, done) => done(null, user.USER_ID));
  passport.deserializeUser(async (id, done) => {done(null, id);});
}

module.exports = initialize;
