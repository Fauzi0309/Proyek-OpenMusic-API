const mapDBToModelAlbumDetail = ({ id, name, year, cover, songs = [] }) => ({
  id,
  name,
  year,
  songs: songs.map((song) => ({
    id: song.id,
    title: song.title,
    performer: song.performer,
  })),
  coverUrl: cover
});

const mapDBToModelAllSong = ({ id, title, performer }) => ({
  id,
  title,
  performer,
});

const mapDBToModelDetailSong = ({ id, title, year, performer, genre, duration, albumId }) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId,
});

module.exports = { mapDBToModelAlbumDetail, mapDBToModelAllSong, mapDBToModelDetailSong };
