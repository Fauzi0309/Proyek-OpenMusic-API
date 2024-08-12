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
  {
    method: "GET",
    path: "/songs/{id}",
    handler: handler.getSongByIdHandler,
  },
];

module.exports = routes;
