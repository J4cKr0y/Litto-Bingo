/** @type {import('@lingui/conf').LinguiConfig} */
module.exports = {
  locales: ['fr', 'en'],
  sourceLocale: 'fr',
  catalogs: [
    {
      path: '<rootDir>/src/locales/{locale}/messages',
      include: ['src'],
    },
  ],
};