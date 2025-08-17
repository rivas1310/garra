#!/bin/bash
echo "Iniciando Monitor de Seguridad..."
cd "$(dirname "$0")"
node scripts/security-monitor.js
