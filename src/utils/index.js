const mapDBToModelAlbumDetail = ({ id, name, year, songs = [] }) => ({
  id,
  name,
  year,
  songs: songs.map((song) => ({
    id: song.id,
    title: song.title,
    performer: song.performer,
  })),
});

const mapDBToModelAllSong = ({ id, title, performer }) => ({
  id,
  title,
  performer,
});

module.exports = { mapDBToModelAlbumDetail, mapDBToModelAllSong };
