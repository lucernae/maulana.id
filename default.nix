let
    pkgs = import (builtins.fetchTarball {
        name = "nixos-unstable-2021-05-17";
        url = "https://github.com/NixOS/nixpkgs/archive/3c6fcc907349c49c043a0517b1778c27cde310d7.tar.gz";
        sha256 = "11rf11bgly7a6f0q5zd29mgdgm52q2dbxaklyl5r3s782fs9sab9";
    }) {};
in
pkgs.stdenv.mkDerivation rec {
	pname = "maulana.id-devenv";
	version = "1.0";
	dontCheck = true;
	src = null;
	propagatedBuildInputs = [
        pkgs.nodejs-14_x
	];
	dontInstall = true;
	meta = {
		description = "Development environment for maulana.id";
		maintainers = [ "Rizky Maulana Nugraha <lana.pcfre@gmail.com>" ];
	};
}
