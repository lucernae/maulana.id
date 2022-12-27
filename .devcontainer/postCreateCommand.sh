#!/usr/bin/env bash

direnv allow .
direnv exec . bash -c "yarn install; yarn build; yarn develop"