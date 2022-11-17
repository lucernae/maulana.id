#!/usr/bin/env bash

direnv allow /workspace
direnv exec /workspace bash -c "yarn install; yarn build; yarn develop"