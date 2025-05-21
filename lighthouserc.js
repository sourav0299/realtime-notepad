module.exports = {
  ci: {
    collect: {
      url: ['https://notepad0299.vercel.app'],
      startServerCommand: 'npm run start',
      numberOfRuns: 1,
    },
    assert: {
      assertions: {
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'interactive': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2000 }],           
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
