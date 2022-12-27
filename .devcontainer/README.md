# Devcontainer

This devcontainer is generated using my other tools: [devcontainer-nix](https://github.com/lucernae/devcontainer-nix)

Regenerator command (from repo's root directory):

```shell
devcontainer templates apply -t ghcr.io/lucernae/devcontainer-nix/nix:1 --workspace-folder . -a "$(cat .devcontainer/args.json)"
```