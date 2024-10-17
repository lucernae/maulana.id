#!/usr/bin/env bash

direnv allow .
direnv exec . bash -c "cd site && yarn install; yarn build; yarn develop"