import sessionRoute from "./session.router.js";
import chatRoute from "./chat.router.js";

const routes = [
  { path: "session", route: sessionRoute },
  { path: "chat", route: chatRoute },
];

export default (app) => {
  routes.forEach(({ path, route }) => app.use(`/api/${path}`, route));
};
