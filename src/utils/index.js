const mapDBToModelAlbumDetail = ({
    id,
    name,
    year,
    songs = [],
  }) => ({
      id,
      name,
      year,
      songs: songs.map((song) => ({
        id: song.id,
        title: song.title,
        performer: song.performer,
      })),
  });
  
  module.exports = { mapDBToModelAlbumDetail };