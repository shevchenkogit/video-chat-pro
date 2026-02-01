FROM nginx:alpine

COPY ./default.conf /etc/nginx/conf.d/default.conf
COPY ./video/html /usr/share/nginx/html/video
COPY ./learn/build /usr/share/nginx/html/learn
# COPY ./index.html /usr/share/nginx/html/index.html 

# COPY ./video/index.html /usr/share/nginx/html/video
# COPY ./learn/index.html /usr/share/nginx/html/learn

EXPOSE 80

# CMD ["nginx", "-g", "daemon off;"]