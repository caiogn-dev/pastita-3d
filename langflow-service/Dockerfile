# Langflow Service para Railway
FROM langflowai/langflow:1.7.2

# Copia entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Variáveis que o Langflow aceita
ENV LANGFLOW_HOST=0.0.0.0
ENV LANGFLOW_WORKERS=1
ENV LANGFLOW_AUTO_LOGIN=true
ENV PYTHONUNBUFFERED=1

# NÃO defina LANGFLOW_PORT aqui!
# O entrypoint.sh vai usar a variável PORT do Railway

ENTRYPOINT ["/entrypoint.sh"]
