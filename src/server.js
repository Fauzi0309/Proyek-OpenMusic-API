require("dotenv").config();

const Hapi = require("@hapi/hapi");
const ClientError = require("./exceptions/ClientError");

const albums = require("./api/albums");
const AlbumService = require("./services/postgres/AlbumService");
const AlbumsValidator = require("./validator/albums");

const SongService = require("./services/postgres/SongService");
const songs = require("./api/songs");
const SongsValidator = require("./validator/songs");

const UsersService = require("./services/postgres/UsersService");
const users = require("./api/users");
const UsersValidator = require("./validator/users");

const init = async () => {
  const albumService = new AlbumService();
  const songsService = new SongService();
  const usersService = new UsersService();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ["*"],
      },
    },
  });

  // Registering albums plugin
  await server.register([
    {
    plugin: albums,
    options: {
      service: albumService,
      validator: AlbumsValidator,
    },
  },
  {
    plugin: songs,
    options: {
      service: songsService,
      validator: SongsValidator,
    },
  },
  {
    plugin: users,
    options: {
      service: usersService,
      validator: UsersValidator,
    },
  },
]);

  server.ext("onPreResponse", (request, h) => {
    // mendapatkan konteks response dari request
    const { response } = request;

    // penanganan client error secara internal.
    if (response instanceof ClientError) {
      const newResponse = h.response({
        status: "fail",
        message: response.message,
      });
      newResponse.code(response.statusCode);
      return newResponse;
    }

    return h.continue;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
