#!/usr/bin/env python3
"""
Script de importação dos dados históricos do Google Forms → Supabase.

Lê a planilha XLSX legada (aba "Tabulados") e insere as respostas
na tabela `responses` do Supabase com user_id = NULL.

Uso:
  pip install supabase openpyxl pandas
  python import_to_supabase.py

Variáveis de ambiente obrigatórias:
  SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY
"""

import os
import sys
import pandas as pd
from supabase import create_client

XLSX_PATH = os.path.join(os.path.dirname(__file__), '../legacy/OFICIAL DESCUBRA SEUS DONS ESPIRITUAIS (respostas).xlsx')

GIFT_NAMES = [
    'Profecia', 'Pastor', 'Ensino', 'Sabedoria', 'Conhecimento', 'Exortação',
    'Discernimento Espíritos', 'Contribuição', 'Socorro', 'Misericórdia',
    'Missionário', 'Evangelista', 'Hospitalidade', 'Dom da Fé', 'Liderança',
    'Administração', 'Operação Milagres', 'Dons de Cura', 'Línguas',
    'Interpretação Línguas', 'Pobreza Voluntária', 'Celibato', 'Intercessão',
    'Libertação', 'Serviço', 'Apóstolo', 'Liderança Adoração',
]


def main():
    supabase_url = os.environ.get('SUPABASE_URL')
    service_key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

    if not supabase_url or not service_key:
        print('Erro: defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY como variáveis de ambiente.')
        sys.exit(1)

    client = create_client(supabase_url, service_key)

    # Ler aba "Tabulados"
    try:
        df = pd.read_excel(XLSX_PATH, sheet_name='Tabulados')
    except Exception as e:
        print(f'Erro ao ler XLSX: {e}')
        sys.exit(1)

    # Normalizar colunas: primeira coluna = nome, demais = scores dos 27 dons
    # Remover linhas sem nome
    df = df.dropna(subset=[df.columns[0]])

    inserted = 0
    errors = 0

    for _, row in df.iterrows():
        name = str(row.iloc[0]).strip()
        if not name or name.lower() == 'nan':
            continue

        scores = {}
        for i, gift_name in enumerate(GIFT_NAMES):
            try:
                score = int(row.iloc[i + 1])
                scores[i] = max(0, min(15, score))  # clamp 0–15
            except (ValueError, IndexError):
                scores[i] = 0

        payload = {
            'user_id': None,       # dados importados não têm usuário
            'name': name,
            'email': None,
            'gp': None,
            'age': None,
            'question_order': None,
            'answers': None,
            'scores': scores,
            'ai_analysis': None,
            'email_sent': False,
            'is_public': False,    # histórico legado não é público por padrão
        }

        result = client.table('responses').insert(payload).execute()
        if result.data:
            inserted += 1
            print(f'✓ {name}')
        else:
            errors += 1
            print(f'✗ {name} — {result}')

    print(f'\nImportação concluída: {inserted} registros inseridos, {errors} erros.')


if __name__ == '__main__':
    main()
