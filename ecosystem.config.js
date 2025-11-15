module.exports = {
  apps: [{
    name: 'moran-app',
    script: './server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    merge_logs: true,
    // Auto restart configuration
    exp_backoff_restart_delay: 100,
    max_restarts: 10,
    min_uptime: '10s',
    // Monitoring
    listen_timeout: 10000,
    kill_timeout: 5000,
    // Cron restart (optional - restart every day at 3 AM)
    cron_restart: '0 3 * * *',
  }]
};
