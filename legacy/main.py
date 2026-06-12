import os
import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns

# Criar a pasta de saída, se não existir
os.makedirs('figs', exist_ok=True)

# Lista dos dons, na mesma ordem do CSV (após a coluna do nome)
gifts_list = [
  "Profecia",
  "Pastoreio",
  "Ensino",
  "Sabedoria",
  "Conhecimento",
  "Exortação",
  "Discernimento de Espíritos",
  "Contribuição",
  "Socorro",
  "Misericórdia",
  "Evangelismo Transcultural",
  "Evangelista",
  "Hospitalidade",
  "Fé",
  "Liderança",
  "Administração",
  "Milagres",
  "Cura",
  "Línguas",
  "Interpretação de Línguas",
  "Simplicidade Voluntária",
  "Celibato",
  "Intercessão",
  "Libertação",
  "Serviço",
  "Apóstolo",
  "Liderança em Adoração"
,]

def generate_bar_chart(person_data):
    name = str(person_data.iloc[0]).strip()
    values = person_data.iloc[1:].astype(int).to_list()

    # Verificar se a quantidade de valores corresponde à lista de dons
    if len(values) != len(gifts_list):
        raise ValueError(f'Erro: {name} possui {len(values)} valores, mas são esperados {len(gifts_list)}.')

    # Criar DataFrame associando dons e valores
    gifts_df = pd.DataFrame({
        'gift': gifts_list,
        'score': values
    }).sort_values(by='score', ascending=False)

    # Configuração visual
    sns.set_theme(style='whitegrid')

    # Normalizar cores com base na pontuação
    min_score = gifts_df['score'].min()
    max_score = gifts_df['score'].max()
    norm_scores = (gifts_df['score'] - min_score) / (max_score - min_score + 0.001)  # evitar divisão por zero
    cmap = sns.color_palette('Greens', as_cmap=True)
    colors = [cmap(0.2 + 0.8 * x) for x in norm_scores]

    # Criar gráfico
    fig, ax = plt.subplots(figsize=(10, 6))

    for i, (index, row) in enumerate(gifts_df.iterrows()):
        ax.barh(y=row['gift'], width=row['score'], color=colors[i])
        ax.text(row['score'] + 0.3, i, str(row['score']), va='center', fontsize=9)

    ax.set_title(f'Dons Espirituais de {name}', fontsize=16)
    ax.set_xlabel('')
    ax.set_ylabel('')
    ax.xaxis.grid(False)
    ax.yaxis.grid(False)
    ax.get_xaxis().set_visible(False)
    ax.invert_yaxis()

    plt.tight_layout()
    output_path = os.path.join('figs', f'{name}.png')
    plt.savefig(output_path, dpi=300)
    plt.close(fig)

if __name__ == '__main__':
    # Ler o CSV com codificação UTF-8 e separador vírgula
    df = pd.read_csv('dons.csv', sep=',', encoding='utf-8')

    expected_cols = 1 + len(gifts_list)

    for i, row in df.iterrows():
        if len(row) != expected_cols:
            print(f'⚠️ Linha {i + 2} com número incorreto de colunas: {len(row)} (esperado: {expected_cols})')
        else:
            try:
                generate_bar_chart(row)
                print(f'✅ Gráfico gerado para: {row.iloc[0]}')
            except Exception as e:
                print(f'❌ Erro ao gerar gráfico para {row.iloc[0]}: {e}')
