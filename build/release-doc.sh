#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

# 进入文档文件夹
cd docs/

# 生成静态文件
npm run build

# 发布到对应 git pages
gh-pages -d public

cd -
