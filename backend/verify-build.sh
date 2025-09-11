#!/bin/bash
echo "=== Build verification script ==="
echo "Current directory: $(pwd)"
echo "Contents of current directory:"
ls -la

echo -e "\n=== Checking if dist exists after build ==="
if [ -d "dist" ]; then
    echo "✅ dist directory exists"
    echo "Contents of dist directory:"
    ls -la dist/
    
    if [ -f "dist/index.js" ]; then
        echo "✅ dist/index.js exists"
        echo "File size: $(du -h dist/index.js)"
    else
        echo "❌ dist/index.js NOT found"
    fi
else
    echo "❌ dist directory NOT found"
fi

echo -e "\n=== Checking package.json scripts ==="
if [ -f "package.json" ]; then
    echo "✅ package.json exists"
    node -e "console.log('Scripts:', JSON.parse(require('fs').readFileSync('package.json')).scripts)"
else
    echo "❌ package.json NOT found"
fi

echo -e "\n=== Node and npm versions ==="
node --version
npm --version

echo -e "\n=== Environment ==="
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"
