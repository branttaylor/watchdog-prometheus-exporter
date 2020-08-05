FROM node:alpine3.12

RUN apk update && apk add --no-cache \
    git && \
    rm -rf /tmp/* /var/cache/apk/* \
    && mkdir /app

WORKDIR /app

RUN git clone https://github.com/branttaylor/watchdog-prometheus-exporter.git /app && \
    npm install

CMD npm start

EXPOSE 8000
