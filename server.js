const fs = require('fs');
const path = require('path');
const https = require('https');
const selfsigned = require('selfsigned');
const app = require('./app');

const port = process.env.PORT || 3443;
const certDir = path.join(__dirname, 'certificates');
const keyPath = path.join(certDir, 'key.pem');
const certPath = path.join(certDir, 'cert.pem');

if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir, { recursive: true });
}

if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
  const certificates = selfsigned.generate(
    [{ name: 'commonName', value: 'localhost' }],
    { days: 365, keySize: 2048 }
  );
  fs.writeFileSync(keyPath, certificates.private);
  fs.writeFileSync(certPath, certificates.cert);
  console.log('Generated self-signed HTTPS certificate.');
}

https.createServer({
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath)
}, app).listen(port, function () {
  console.log(`Exercise24 HTTPS server running at https://localhost:${port}`);
});
