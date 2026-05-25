module.exports = {
  apps: [
    {
      name: 'stark-client',
      script: 'node_modules/.bin/next',
      args: 'dev -p 3000',
      cwd: './client',
      env: {
        NODE_ENV: 'development',
      },
    },
    {
      name: 'stark-server',
      script: 'server/dist/index.js',
      cwd: './server',
      env: {
        NODE_ENV: 'development',
        PORT: 3001,
      },
    },
  ],
};
