{ pkgs, ... }:

{
  languages.javascript = {
    enable = true;
    package = pkgs.bun;
  };

  pre-commit.hooks = {
    eslint.enable = true;
  };
}
