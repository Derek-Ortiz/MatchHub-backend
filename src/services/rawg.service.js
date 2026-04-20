const axios = require('axios');
const env = require('../config/env');

const rawgClient = axios.create({
  baseURL: env.RAWG_BASE_URL,
  params: { key: env.RAWG_API_KEY },
  timeout: 8000,
});


const searchGames = async (query, pageSize = 10) => {
  const { data } = await rawgClient.get('/games', {
    params: { search: query, page_size: pageSize },
  });

  return (data.results || []).map((game) => ({
    rawg_id: game.id,
    nombre: game.name,
    plataformas: (game.platforms || []).map((p) => normalizePlatform(p.platform.slug)),
    imagen: game.background_image || null,
  }));
};

const getGameById = async (rawgId) => {
  const { data } = await rawgClient.get(`/games/${rawgId}`);
  return {
    rawg_id: data.id,
    nombre: data.name,
    plataformas: (data.platforms || []).map((p) => normalizePlatform(p.platform.slug)),
    imagen: data.background_image || null,
  };
};

const normalizePlatform = (slug) => {
  const map = {
    pc: 'pc',
    playstation4: 'ps',
    playstation5: 'ps',
    'xbox-one': 'xbox',
    'xbox-series-x': 'xbox',
    nintendo: 'switch',
    switch: 'switch',
    android: 'mobile',
    ios: 'mobile',
  };
  return map[slug] || slug;
};

module.exports = { searchGames, getGameById };
