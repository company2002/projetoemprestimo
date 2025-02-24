module.exports = {
  apps: [
    {
      name: 'sistema-emprestimo',
      script: 'backend/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 10000
      },
      error_file: 'logs/pm2/error.log',
      out_file: 'logs/pm2/out.log',
      log_file: 'logs/pm2/combined.log',
      time: true,
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      max_restarts: 10,
      restart_delay: 4000,
      wait_ready: true,
      kill_timeout: 5000,
      listen_timeout: 8000,
    },
    {
      name: 'sistema-emprestimo-scheduler',
      script: 'backend/src/scripts/scheduler.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env_production: {
        NODE_ENV: 'production'
      },
      error_file: 'logs/pm2/scheduler-error.log',
      out_file: 'logs/pm2/scheduler-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ],
  deploy: {
    production: {
      user: 'node',
      host: 'sistema-emprestimo.onrender.com',
      ref: 'origin/main',
      repo: 'git@github.com:company2002/projetoemprestimo.git',
      path: '/var/www/sistema-emprestimo',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production'
    }
  }
}; 