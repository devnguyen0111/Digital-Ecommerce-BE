module.exports = {
  apps: [
    {
      name: 'digital-ecommerce-api',
      script: './server.js',

      // Instances
      instances: process.env.NODE_ENV === 'production' ? 'max' : 1,
      exec_mode: 'cluster',

      // Environment
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },

      // Logs
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',

      // Advanced features
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'uploads', '.git'],
      max_memory_restart: '500M',

      // Restart behavior
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000,

      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,

      // Source maps
      source_map_support: true,

      // Monitoring
      instance_var: 'INSTANCE_ID',

      // Merge logs
      merge_logs: true,

      // Time zone
      time: true,
    },
  ],

  // Deployment configuration (optional)
  deploy: {
    production: {
      user: 'deploy',
      host: ['your-server-ip'],
      ref: 'origin/main',
      repo: 'git@github.com:devnguyen0111/Digital-Ecommerce-BE.git',
      path: '/var/www/digital-ecommerce',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-deploy-local': '',
      'post-deploy-local': '',
    },
  },
};
