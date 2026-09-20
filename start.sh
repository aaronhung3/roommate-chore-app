#!/bin/bash

ngrok http 3000 &

sleep 2

(cd backend && npm run dev) &

sleep 2

(cd mobile && npx expo start --tunnel)

wait