module.exports = {
  apps: [
    {
      name: 'stark-client',
      script: 'npx',
      args: 'next dev -p 3000',
      cwd: './client',
      interpreter: 'none',
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
