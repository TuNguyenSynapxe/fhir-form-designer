import { spawn } from 'child_process';

const port = process.env.PORT || 8080;
console.log(`Starting server on port ${port}`);

const serveProcess = spawn('npx', ['serve', '-s', 'dist', '-p', port.toString()], {
  stdio: 'inherit',
  shell: true
});

serveProcess.on('error', (error) => {
  console.error('Error starting server:', error);
  process.exit(1);
});

serveProcess.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
  process.exit(code);
});