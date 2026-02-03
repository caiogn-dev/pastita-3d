#!/usr/bin/env python3
"""
Script para criar o flow de atendimento no Langflow via API.
"""
import json
import requests
import sys
import os
import time
from pathlib import Path

# Configuração
LANGFLOW_URL = os.environ.get("LANGFLOW_URL", "http://localhost:7860")
SUPERUSER = os.environ.get("LANGFLOW_SUPERUSER", "admin")
SUPERUSER_PASSWORD = os.environ.get("LANGFLOW_SUPERUSER_PASSWORD", "admin123")

def wait_for_langflow(max_retries=30):
    """Espera o Langflow estar pronto."""
    print("Aguardando Langflow iniciar...")
    for i in range(max_retries):
        try:
            response = requests.get(f"{LANGFLOW_URL}/health", timeout=5)
            if response.status_code == 200:
                print("Langflow está pronto!\n")
                return True
        except:
            pass
        time.sleep(2)
        print(f"   Tentativa {i+1}/{max_retries}...")
    print("Timeout esperando Langflow")
    return False

def get_access_token():
    """Obtém token de acesso via login."""
    # Langflow 1.x usa /api/v1/login com form data
    login_data = {
        "username": SUPERUSER,
        "password": SUPERUSER_PASSWORD
    }
    
    # Tenta endpoint com form data (formato OAuth2)
    try:
        response = requests.post(
            f"{LANGFLOW_URL}/api/v1/login",
            data=login_data,  # form-data, não json
            timeout=10
        )
        if response.status_code == 200:
            data = response.json()
            token = data.get("access_token") or data.get("token")
            if token:
                print("Login realizado com sucesso!")
                return token
    except Exception as e:
        print(f"   Erro no login: {e}")
    
    # Tenta autenticação básica (fallback)
    try:
        response = requests.post(
            f"{LANGFLOW_URL}/api/v1/auth/token",
            data={
                "grant_type": "password",
                "username": SUPERUSER,
                "password": SUPERUSER_PASSWORD
            },
            timeout=10
        )
        if response.status_code == 200:
            data = response.json()
            return data.get("access_token")
    except Exception as e:
        print(f"   Erro no auth: {e}")
    
    return None

def create_flow_with_superuser():
    """Cria o flow usando superuser diretamente (bypass auth)."""
    
    flow_data = {
        "name": "Atendimento Pastita",
        "description": "Assistente virtual para atendimento da Pastita Massas Artesanais",
        "data": {
            "nodes": [
                {
                    "id": "input",
                    "type": "ChatInput",
                    "position": {"x": 100, "y": 200},
                    "data": {
                        "node": {
                            "template": {
                                "input_value": {
                                    "type": "str",
                                    "required": True,
                                    "name": "input_value"
                                }
                            }
                        }
                    }
                },
                {
                    "id": "prompt",
                    "type": "PromptComponent",
                    "position": {"x": 400, "y": 200},
                    "data": {
                        "node": {
                            "template": {
                                "template": {
                                    "type": "prompt",
                                    "required": True,
                                    "name": "template",
                                    "value": """Você é o assistente virtual da Pastita - Massas Artesanais, uma loja de massas frescas em Palmas/TO.

CARDÁPIO:
- Rondelli (vários sabores): R$ 39,99
- Molhos artesanais: R$ 15,00 a R$ 25,00  
- Combos promocionais disponíveis

HORÁRIO:
- Terça a Domingo: 11h às 21h
- Segunda: Fechado

PAGAMENTO: PIX, Cartão, Dinheiro
ENTREGA: iFood, WhatsApp ou retirada
SITE: https://pastita.com.br

Seja cordial, use emojis 😊 e direcione pedidos para o site ou WhatsApp.

Cliente: {input}
Assistente:"""
                                },
                                "input": {
                                    "type": "str",
                                    "required": True,
                                    "name": "input"
                                }
                            }
                        }
                    }
                },
                {
                    "id": "openai",
                    "type": "OpenAIModel",
                    "position": {"x": 700, "y": 200},
                    "data": {
                        "node": {
                            "template": {
                                "model": {
                                    "type": "str",
                                    "required": True,
                                    "name": "model",
                                    "value": "gpt-3.5-turbo"
                                },
                                "openai_api_key": {
                                    "type": "str",
                                    "required": True,
                                    "name": "openai_api_key"
                                },
                                "temperature": {
                                    "type": "float",
                                    "required": False,
                                    "name": "temperature",
                                    "value": 0.7
                                },
                                "max_tokens": {
                                    "type": "int",
                                    "required": False,
                                    "name": "max_tokens",
                                    "value": 500
                                }
                            }
                        }
                    }
                },
                {
                    "id": "output",
                    "type": "ChatOutput",
                    "position": {"x": 1000, "y": 200},
                    "data": {
                        "node": {
                            "template": {
                                "message": {
                                    "type": "str",
                                    "required": True,
                                    "name": "message"
                                }
                            }
                        }
                    }
                }
            ],
            "edges": [
                {"id": "e1", "source": "input", "target": "prompt"},
                {"id": "e2", "source": "prompt", "target": "openai"},
                {"id": "e3", "source": "openai", "target": "output"}
            ]
        }
    }
    
    token = get_access_token()
    headers = {"Content-Type": "application/json"}
    
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    # Tenta criar flow
    try:
        response = requests.post(
            f"{LANGFLOW_URL}/api/v1/flows/",
            headers=headers,
            json=flow_data,
            timeout=30
        )
        
        if response.status_code in [200, 201]:
            result = response.json()
            flow_id = result.get('id')
            print(f"Flow criado com sucesso!")
            print(f"   ID: {flow_id}")
            print(f"   Nome: {result.get('name')}")
            print(f"\nConfigure no Django Admin:")
            print(f"   Flow ID: {flow_id}")
            print(f"   Endpoint: api/v1/run/{flow_id}")
            return flow_id
        else:
            print(f"Erro ao criar flow: {response.status_code}")
            print(f"Resposta: {response.text[:500]}")
    except Exception as e:
        print(f"Erro na requisicao: {e}")
    
    return None

if __name__ == "__main__":
    print("Criando flow de atendimento no Langflow...")
    print(f"   URL: {LANGFLOW_URL}")
    print()
    
    if not wait_for_langflow():
        sys.exit(1)
    
    flow_id = create_flow_with_superuser()
    
    if flow_id:
        print("\nPronto! Agora configure no Django Admin.")
    else:
        print("\nNao foi possivel criar automaticamente.")
        print("\nImporte manualmente via interface web:")
        print(f"   1. Acesse: {LANGFLOW_URL}")
        print(f"   2. Login: {SUPERUSER} / {SUPERUSER_PASSWORD}")
        print(f"   3. Clique em 'Import' e selecione: flows/atendimento_pastita.json")
