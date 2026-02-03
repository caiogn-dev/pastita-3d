#!/usr/bin/env python3
"""
Script para criar o flow de atendimento no Langflow via API.
"""
import json
import requests
import sys
import os
from pathlib import Path

# Configuração
LANGFLOW_URL = os.environ.get("LANGFLOW_URL", "http://localhost:7860")
SUPERUSER = os.environ.get("LANGFLOW_SUPERUSER", "admin")
SUPERUSER_PASSWORD = os.environ.get("LANGFLOW_SUPERUSER_PASSWORD", "admin123")

def get_access_token():
    """Obtém token de acesso via login."""
    response = requests.post(
        f"{LANGFLOW_URL}/api/v1/login",
        data={
            "username": SUPERUSER,
            "password": SUPERUSER_PASSWORD
        }
    )
    if response.status_code == 200:
        return response.json()["access_token"]
    else:
        print(f"Erro ao fazer login: {response.text}")
        sys.exit(1)

def create_flow(token: str):
    """Cria o flow de atendimento."""
    
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
                                    "placeholder": "Mensagem do cliente",
                                    "name": "input_value",
                                    "display_name": "Input"
                                }
                            },
                            "display_name": "Input do Cliente"
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
                                    "display_name": "Template",
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
                            },
                            "display_name": "Prompt"
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
                                }
                            },
                            "display_name": "OpenAI"
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
                            },
                            "display_name": "Output"
                        }
                    }
                }
            ],
            "edges": [
                {
                    "id": "input-to-prompt",
                    "source": "input",
                    "target": "prompt"
                },
                {
                    "id": "prompt-to-openai",
                    "source": "prompt",
                    "target": "openai"
                },
                {
                    "id": "openai-to-output",
                    "source": "openai",
                    "target": "output"
                }
            ]
        }
    }
    
    response = requests.post(
        f"{LANGFLOW_URL}/api/v1/flows/",
        headers={"Authorization": f"Bearer {token}"},
        json=flow_data
    )
    
    if response.status_code in [200, 201]:
        result = response.json()
        print(f"✅ Flow criado com sucesso!")
        print(f"   ID: {result['id']}")
        print(f"   Nome: {result['name']}")
        print(f"\nConfigure no Django Admin:")
        print(f"   Flow ID: {result['id']}")
        print(f"   Endpoint: api/v1/run/{result['id']}")
        return result['id']
    else:
        print(f"❌ Erro ao criar flow: {response.text}")
        sys.exit(1)

if __name__ == "__main__":
    print("🚀 Criando flow de atendimento no Langflow...")
    print(f"   URL: {LANGFLOW_URL}")
    print()
    
    token = get_access_token()
    flow_id = create_flow(token)
    
    print("\n✨ Pronto! Agora configure no Django Admin.")
