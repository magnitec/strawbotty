# Strawbotty

![Build Status](https://github.com/magnitec/strawbotty/actions/workflows/master.yml/badge.svg?branch=workflows)

A trading bot with strategy analysis built with node and python.
Please note that the bot is currently a work in progress and should not be used for actual trading.

## Overview

- Designed to run multiple strategies simultaneously.
- Use in-built strategies or integrate your own.
- Strategy ranking and analysis: strategies with the highest score take precedence when opening new trades. A strategy whose latest performance doesn't meet minimum criteria won't trigger trades.

## Requirements

- Node 16.14.0
- Python 3.x
- cTrader (with a supported broker account)
- MongoDB

## Installation

[Setup a MongoDB database](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/)

[Create a cTrader account](https://ctrader.com/featured-brokers/)

Strawbotty uses Mida ecosystem to communicate with cTrader. You will need to obtain `clientId`, `clientSecret`, `accessToken` and `cTraderBrokerAccountId` credentials from cTrader's Open API. Please follow [Mida's guidelines](https://www.mida.org/posts/how-to-use-mida-with-ctrader/) on how to do it.

## Planned features

- Broker synchronization
- Implement multiple strategies to make use of the ranking system
- Automate ranking
- Control bot state via API

## API Reference

#### Status

```http
  GET /bot/status
```

#### Pause opening new trades

```http
  PUT /bot/pause
```

#### Resume opening new trades

```http
  PUT /bot/start
```
