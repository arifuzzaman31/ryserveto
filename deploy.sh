#!/bin/bash

echo "Starting deployment..."

git pull origin main

npm install
cp .env.local .env
pm2 restart 0

echo "Deployment completed!"
