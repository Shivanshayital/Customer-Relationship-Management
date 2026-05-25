# Setup Guide

## Prerequisites
- Node.js 18+
- npm 9+

## Install dependencies
1. Backend
   - `Push-Location 'C:\Users\shiva\Documents\Customer Relationship Management\backend'`
   - `npm install`
2. Frontend
   - `Push-Location 'C:\Users\shiva\Documents\Customer Relationship Management\frontend'`
   - `npm install`

## Run locally
1. Start backend
   - `Push-Location 'C:\Users\shiva\Documents\Customer Relationship Management\backend'`
   - `npm run dev`
2. Start frontend
   - `Push-Location 'C:\Users\shiva\Documents\Customer Relationship Management\frontend'`
   - `npm run dev`

## Verify
- Backend health endpoint: `http://localhost:4000/api/health`
- Frontend homepage: `http://localhost:3000`

## Build
- Backend: `Push-Location 'C:\Users\shiva\Documents\Customer Relationship Management\backend'; npm run build`
- Frontend: `Push-Location 'C:\Users\shiva\Documents\Customer Relationship Management\frontend'; npm run build`

## Tests
- Backend: `Push-Location 'C:\Users\shiva\Documents\Customer Relationship Management\backend'; npm test`
