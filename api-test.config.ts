const proccessEnv = process.env.TEST_ENV || "test";
const env = proccessEnv || 'qa'
console.log(`Running tests in ${env} environment`);

const config = {
  apiUrl: "https://conduit-api.bondaracademy.com/api",
  userEmail: "yehorTest@gmail.com",
  userPassword: "yehortest",
};

if (env === "qa") {
  config.apiUrl = "https://conduit-api.bondaracademy.com/api",
  config.userEmail = "yehorTest@gmail.com",
  config.userPassword = "yehortest"
}

if (env === "prod") {
  config.apiUrl = "https://conduit-api.bondaracademy.com/api",
  config.userEmail = "",
  config.userPassword = ""
}

export { config };
