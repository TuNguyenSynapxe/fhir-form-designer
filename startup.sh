#!/bin/bash
# Azure App Service startup script for React app

# Install serve globally
npm install -g serve

# Start the server
serve -s dist -l $PORT