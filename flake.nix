{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    flake-compat = {
      url = "github:edolstra/flake-compat";
      flake = false;
    };
    devshell.url = "github:numtide/devshell";

    # flake location for the gatsby theme
    gatsby-theme.url = "github:lucernae/gatsby-starter-lucernae";
  };

  outputs = { self, nixpkgs, flake-utils, devshell, gatsby-theme, ... }:
    flake-utils.lib.eachDefaultSystem (system: {
      apps.devshell = self.outputs.devShell.${system}.flakeApp;
      formatter = nixpkgs.legacyPackages.${system}.nixpkgs-fmt;
      devShell =
        let
          pkgs = import nixpkgs {
            inherit system;
            overlays = [ devshell.overlays.default ];
          };
          customNodejs = pkgs.nodejs-_x.override {
            openssl = pkgs.openssl_1_1;
          };
          bunV1 = pkgs.bun.overrideAttrs (final: prev: with pkgs; prev // rec {
            version = "1.0.4";
            src = passthru.sources.${stdenvNoCC.hostPlatform.system} or (throw "Unsupported system: ${stdenvNoCC.hostPlatform.system}");
            passthru = prev.passthru // {
              sources = prev.passthru.sources // {
                "aarch64-darwin" = fetchurl {
                  url = "https://github.com/oven-sh/bun/releases/download/bun-v${version}/bun-darwin-aarch64.zip";
                  sha256 = "sha256-ko0DFCYUfuww3qrz4yUde6Mr4yPVcMJwwGdrG9Fiwhg=";
                };
                "x86_64-darwin" = fetchurl {
                  url = "https://github.com/oven-sh/bun/releases/download/bun-v${version}/bun-darwin-x64.zip";
                  sha256 = "sha256-YEIXthisgNx+99wZF8hZ1T3MU20Yeyms3/q1UGDAwso=";
                };
                "aarch64-linux" = fetchurl {
                  url = "https://github.com/oven-sh/bun/releases/download/bun-v${version}/bun-linux-aarch64.zip";
                  sha256 = "sha256-0KFAvfyTJU1z/KeKVbxFx6+Ijz4YzMsCMiytom730QI=";
                };
                "x86_64-linux" = fetchurl {
                  url = "https://github.com/oven-sh/bun/releases/download/bun-v${version}/bun-linux-x64.zip";
                  sha256 = "sha256-lEEIrmIEcIdE2SqnKlVxpiq9ae2wNRepHY61jWqk584=";
                };
              };
            };
          });
        in
        pkgs.devshell.mkShell {
          name = "maulana.id";
          commands = [
            {
              name = "yarn";
              package = pkgs.yarn.override {
                nodejs = pkgs.nodejs;
              };
            }
            {
              name = "yarn2nix";
              package = pkgs.yarn2nix;
            }
            {
              name = "node";
              package = pkgs.nodejs;
            }
            {
              name = "bun";
              package = bunV1;
            }
            {
              name = "theme-upgrade";
              command = ''
                echo "updating flake lock"
                nix flake lock --update-input gatsby-theme
              '';
            }
            {
              name = "theme-update";
              command = ''
                echo "copying gatsby-theme"
                cp -Hrf ${gatsby-theme.outPath}/gatsby-theme .
                chmod -R +w gatsby-theme
                yarn
                yarn --check-files
              '';
            }
          ];
          packages = [
            pkgs.getconf
          ];
          env = [
            {
              name = "NODE_OPTIONS";
              value = "--max-old-space-size=4096";
            }
          ];
        };
    });
}
