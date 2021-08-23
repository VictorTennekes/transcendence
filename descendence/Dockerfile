FROM node:16-alpine3.11

# set working directory
WORKDIR /usr/src/app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# copy the list of dependencies
COPY package.json .

# install required npm packages
RUN npm install -g npm@6.14.13
RUN npm install -g @angular/cli@12.1.1

RUN npm install

# copy app
COPY . .

#serve locally (for development)
CMD ng serve --host 0.0.0.0
