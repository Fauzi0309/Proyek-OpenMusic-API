const routes = (handler) => [
  {
    method: "POST",
    path: "/songs",
    handler: handler.postSongHandler,
  },
  {
    method: "GET",
    path: "/songs",
    handler: handler.getAllSongHandler,
  },
];

module.exports = routes;
