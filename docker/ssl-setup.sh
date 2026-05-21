#!/bin/bash
# 生成自签名 SSL 证书（有效期 10 年）
# 用法：bash docker/ssl-setup.sh

SSL_DIR="$(cd "$(dirname "$0")" && pwd)/ssl"
mkdir -p "$SSL_DIR"

if [ -f "$SSL_DIR/cert.pem" ] && [ -f "$SSL_DIR/key.pem" ]; then
    echo "✓ SSL 证书已存在: $SSL_DIR/"
    echo "  如需重新生成，请先删除 docker/ssl/ 目录"
    exit 0
fi

echo "生成自签名 SSL 证书..."
openssl req -x509 -nodes -days 3650 \
    -newkey rsa:2048 \
    -keyout "$SSL_DIR/key.pem" \
    -out "$SSL_DIR/cert.pem" \
    -subj "/C=CN/ST=China/L=Beijing/O=AI-Coach/CN=ai-coach.local" \
    -addext "subjectAltName=IP:121.43.250.191,DNS:localhost"

if [ $? -eq 0 ]; then
    echo "✓ 证书生成完成"
    echo "  证书: $SSL_DIR/cert.pem"
    echo "  私钥: $SSL_DIR/key.pem"
    echo ""
    echo "⚠️  首次访问时浏览器会提示不安全，点击「高级」→「继续访问」即可"
else
    echo "❌ 证书生成失败，请确认已安装 openssl"
    exit 1
fi
