FROM node:18.2.0-alpine
WORKDIR /usr/src/client
COPY ./package.json ./
COPY ./package-lock.json ./
RUN npm icd
COPY . .
CMD ["npm", "run", "start"]
# FROM nginx:alpine

# # COPY ./default.conf /etc/nginx/conf.d/default.conf
# COPY ./build /usr/share/nginx/html
# EXPOSE 80

# CMD ["nginx", "-g", "daemon off;"]