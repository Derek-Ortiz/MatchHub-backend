const env = require('../config/env');

const STYLES = [
  'adventurer', 'avataaars', 'bottts', 'croodles',
  'fun-emoji', 'lorelei', 'micah', 'miniavs',
  'notionists', 'open-peeps', 'personas', 'pixel-art',
];


const getAvatarUrl = (style, seed, options = {}) => {
  const validStyle = STYLES.includes(style) ? style : 'pixel-art';
  const params = new URLSearchParams({ seed, ...options });
  return `${env.DICEBEAR_BASE_URL}/${validStyle}/svg?${params.toString()}`;
};

const getAvailableStyles = () => STYLES;

const getAvatarOptions = (seed) =>
  STYLES.map((style) => ({
    style,
    url: getAvatarUrl(style, seed),
  }));

module.exports = { getAvatarUrl, getAvailableStyles, getAvatarOptions };
