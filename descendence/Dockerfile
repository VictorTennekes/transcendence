FROM node:16-alpine3.11

# set working directory
WORKDIR /usr/src/app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# copy the list of dependencies
COPY package.json .

# install required npm packages
RUN npm install -g npm@7.19.1
RUN npm install -g @angular/cli@7.3.9

# copy app
COPY . .

#serve locally (for development)
CMD ng serve --host 0.0.0.0