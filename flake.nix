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
            version = "1.0.0";
            src = passthru.sources.${stdenvNoCC.hostPlatform.system} or (throw "Unsupported system: ${stdenvNoCC.hostPlatform.system}");
            passthru = prev.passthru // {
              sources =  prev.passthru.sources // {
                "aarch64-darwin" = fetchurl {
                  url = "https://github.com/oven-sh/bun/releases/download/bun-v${version}/bun-darwin-aarch64.zip";
                  sha256 = "sha256-Bd8KL1IbWBRiMZq4YPhNLdhBOqRReCFeUPAilLfk0TM=";
                };
                "x86_64-darwin" =  fetchurl {
                  url = "https://github.com/oven-sh/bun/releases/download/bun-v${version}/bun-darwin-x64.zip";
                  sha256 = "sha256-0AT58hjawS60q5YAQd/upVz0vOIs11JM+lc3c1mGyOE=";
                };
                "aarch64-linux" =  fetchurl {
                  url = "https://github.com/oven-sh/bun/releases/download/bun-v${version}/bun-linux-aarch64.zip";
                  sha256 = "sha256-CHOiQ47wXjkFyJG9ElE9gBpmWpylMEUf6c+Sm+YCpGc=";
                };
                "x86_64-linux" =  fetchurl {
                  url = "https://github.com/oven-sh/bun/releases/download/bun-v${version}/bun-linux-x64.zip";
                  sha256 = "sha256-1ju7ZuW82wRfXEiU24Lx9spCoIhhddJ2p4dTTQmsa7A=";
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
              name = "theme-update";
              command = ''
                echo "copying gatsby-theme"
                cp -Hrf ${gatsby-theme.outPath}/gatsby-theme .
                chmod -R +w gatsby-theme
                '';
            }
          ];
          packages = [  ];
          env = [];
        };
    });
}
