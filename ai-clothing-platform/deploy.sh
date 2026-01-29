#!/bin/bash

# 部署到 Vercel 生产环境
cd "$(dirname "$0")"
vercel --prod --yes
