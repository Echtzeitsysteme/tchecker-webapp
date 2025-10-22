#! /usr/bin/bash

cd frontend
fastapi run ../backend/app.py & yarn start && fg
