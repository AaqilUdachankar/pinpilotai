import axios from 'axios';

console.log('Testing server health...');
setTimeout(async () => {
  try {
    const res = await axios.get('http://localhost:5000/api/health', { timeout: 3000 });
    console.log('SERVER HEALTH RESPONSE:', res.data);
    process.exit(0);
  } catch (err) {
    console.error('Failed to reach server:', err.message);
    process.exit(1);
  }
}, 3000);
