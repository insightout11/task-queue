/**
 * PM2 process config — run this on the MiniPC to host the canonical board.
 *
 * Setup:
 *   npm install && npm run build
 *   pm2 start ecosystem.config.cjs
 *   pm2 save && pm2 startup   # survive reboots
 *
 * Access from laptop:
 *   http://<minipc-lan-ip>:3456
 */
module.exports = {
  apps: [
    {
      name: 'task-queue',
      script: 'node_modules/.bin/next',
      args: 'start',
      env: {
        PORT: 3456,
        NODE_ENV: 'production',
        // BOARD_LABEL shown in the board UI so you know which host you're on.
        BOARD_LABEL: 'minipc',
        // TASK_QUEUE_FILE defaults to ~/clawd/ops/task-queue.json via os.homedir().
        // On MiniPC as user 'matt' this resolves to /home/matt/clawd/ops/task-queue.json.
        // Override here only if you need a different path.
        // TASK_QUEUE_FILE: '/home/matt/clawd/ops/task-queue.json',
      },
    },
  ],
};
