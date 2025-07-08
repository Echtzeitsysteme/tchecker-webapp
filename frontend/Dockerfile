# Stage 1: Build the React app
FROM node:22 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . ./
RUN npm run build

# Stage 2: Serve the build with Nginx
FROM nginx:stable-alpine

# Copy the built app to Nginx's default public directory
COPY --from=build /app/dist/timed-automata-analysis /usr/share/nginx/html

# Optional: Copy a custom Nginx config (uncomment if needed)
# COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]