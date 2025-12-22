FROM node:22-alpine
EXPOSE 8080
EXPOSE 8888

WORKDIR /app

# Enable legacy OpenSSL provider for webpack 4
ENV NODE_OPTIONS=--openssl-legacy-provider

# Configure default user environment, re-use node user/group
RUN chown -R node /app
USER node
RUN id node

RUN yarn

CMD yarn run dev
