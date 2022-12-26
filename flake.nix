{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    flake-compat = {
      url = "github:edolstra/flake-compat";
      flake = false;
    };
    devshell.url = "github:numtide/devshell";
  };

  outputs = { self, nixpkgs, flake-utils, devshell, ... }:
    flake-utils.lib.eachDefaultSystem (system: {
      devShell =
        let
          pkgs = import nixpkgs {
            inherit system;
            overlays = [ devshell.overlay ];
          };
          customNodejs = pkgs.nodejs-_x.override {
            openssl = pkgs.openssl_1_1;
          };
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
          ];
          packages = [  ];
          env = [];
        };
    });
}
