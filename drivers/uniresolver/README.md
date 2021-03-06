# SOLID DID Resolver 

A DID resolver driver for the [Universal Resolver](https://github.com/decentralized-identity/universal-resolver/),
that resolves [SOLID DIDs](https://github.com/identity-com/solid-did).

Documentation is published at https://app.swaggerhub.com/apis/identity.com/solid-resolver-driver/1.0.0

## Getting Started

```shell
docker-compose up -d
curl http://localhost:8080/1.0/identifiers/did:solid:DSLYfgMTJVMuUKcEge4yNCgAAgt5Xn5YU7wniPXh7BuH
```

## Running locally in dev mode

This project uses [nvm](https://github.com/nvm-sh/nvm) and [yarn](https://yarnpkg.com/)

```shell
nvm install
yarn
yarn dev
```
