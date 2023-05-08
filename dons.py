import pandas as pd
import matplotlib.pyplot as plt
import os
import seaborn as sns

# Ler o arquivo CSV
df = pd.read_csv("dons.csv", index_col=0)

# Cria a pasta "figs" se não existir
if not os.path.exists("figs"):
    os.makedirs("figs")

# Loop para gerar um gráfico de barras para cada linha
for index, row in df.iterrows():
    # Ordenar os valores em ordem descendente
    values_sorted = row.sort_values(ascending=False)

    # Gerar o gráfico de barras
    fig, ax = plt.subplots()

    # Criar o mapa de cores
    palette = sns.color_palette("Greens_r", len(values_sorted))

    # Atribuir uma cor a cada barra com base no seu valor
    colors = [palette[i] for i in range(len(values_sorted))]
    ax.bar(values_sorted.index, values_sorted.values, color=colors)

    ax.set_ylim((0, 15))  # define o limite máximo de cada gráfico

    # Adicionar o valor no topo de cada barra
    for i, v in enumerate(values_sorted.values):
        ax.text(i, v, str(v), ha="center", va="bottom")

    # Definir título e rótulos dos eixos
    ax.set_title(f"Gráfico dos Dons Espirituais: {index}")
    # ax.set_xlabel('Domínios')
    # ax.set_ylabel('Quantidade')

    # Melhorar a legibilidade dos rótulos do eixo x
    labels = [label.replace(" ", "\n") for label in values_sorted.index]
    # ax.set_xticklabels(labels, rotation=90, fontsize=8, wrap=True)
    # labels = ['\n'.join(label.split()) for label in values_sorted.index]
    plt.xticks(range(len(values_sorted.index)), labels, rotation=90, fontsize=8)

    # Ajustar a posição dos rótulos do eixo x
    plt.subplots_adjust(bottom=0.2)

    # Mostrar o gráfico
    plt.show()

    # Salvar o gráfico
    fig.savefig(f"figs/{index}.png", dpi=300)

    # # Fechar a figura atual para liberar memória
    # plt.close(fig)
