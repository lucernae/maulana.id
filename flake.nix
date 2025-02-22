{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    flake-compat = {
      url = "github:edolstra/flake-compat";
      flake = false;
    };
    devshell.url = "github:numtide/devshell";

    # flake location for the astro template
    astro-blog-template.url = "github:lucernae/astro-blog-template";
  };

  outputs = { self, nixpkgs, flake-utils, devshell, astro-blog-template, ... }:
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
            version = "1.0.20";
            src = passthru.sources.${stdenvNoCC.hostPlatform.system} or (throw "Unsupported system: ${stdenvNoCC.hostPlatform.system}");
            passthru = prev.passthru // {
              sources = prev.passthru.sources // {
                "aarch64-darwin" = fetchurl {
                  url = "https://github.com/oven-sh/bun/releases/download/bun-v${version}/bun-darwin-aarch64.zip";
                  sha256 = "sha256-rwBU4jdD4sTB3wTS3uh1Fq88IW+LB/S/srMAMPJsQ1M=";
                };
                "x86_64-darwin" = fetchurl {
                  url = "https://github.com/oven-sh/bun/releases/download/bun-v${version}/bun-darwin-x64.zip";
                  sha256 = "sha256-nIE5/h+9ShoOywA7isHW+X+J6rQF2oBgnNI7rh0ZNu0=";
                };
                "aarch64-linux" = fetchurl {
                  url = "https://github.com/oven-sh/bun/releases/download/bun-v${version}/bun-linux-aarch64.zip";
                  sha256 = "sha256-kzg4pT4e6evvyPhkC3wmwWsRvSpVCM45jgn+yvEvTaI=";
                };
                "x86_64-linux" = fetchurl {
                  url = "https://github.com/oven-sh/bun/releases/download/bun-v${version}/bun-linux-x64.zip";
                  sha256 = "sha256-NISClwFmDflxx09gWgo2Cpx/QXxoq4iDcYuXUT1FTn8=";
                };
              };
            };
          });
        in
        pkgs.devshell.mkShell {
          name = "maulana.id";
          commands = [
            {
              name = "python";
              package =
                let
                  python3Packages = pkgs.python3Packages;
                in
                with python3Packages;
                pkgs.python3.withPackages (ps: [
                  numpy
                  scipy
                  matplotlib
                ]);
            }
            {
              name = "yarn";
              package = pkgs.yarn.override {
                nodejs = pkgs.nodejs;
              };
            }
            {
              name = "pnpm";
              package = pkgs.pnpm.override {
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
                nix flake lock --update-input astro-blog-template
              '';
            }
            {
              name = "theme-update";
              command = ''
                echo "copying astro-blog-template"
                rsync -avP \
                    --exclude 'astro.config.mjs' \
                    --exclude 'src/content' \
                    --exclude 'public' \
                    --exclude 'src/assets' \
                    --exclude 'src/data' \
                    --exclude 'src/utils/post.ts' \
                    ${astro-blog-template.outPath}/ ./site
                chmod -R +w ./site
                cd ./site
                yarn
                yarn --check-files
              '';
            }
          ];
          packages = [
            pkgs.getconf
            pkgs.rsync
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
