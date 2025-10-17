#!/bin/bash

# Install serve globally to serve static files
npm install -g serve

# Serve the built application on the port specified by Azure
serve -s dist -l $PORT