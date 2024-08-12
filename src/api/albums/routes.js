const routes = (handler) => [
    {
        method: 'POST',
        path: '/albums',
        handler: handler.postAlbumHandler,
    },
    {
        method: 'GET',
        path: '/albums/{id}',
        handler: handler.getAlbumIdHandler,
      },
    {
        method: 'PUT',
        path: '/albums/{id}',
        handler: handler.putAlbumByIdHandler,
    }
];

module.exports = routes;