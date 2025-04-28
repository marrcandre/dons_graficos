import os
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np

# Create the "figs" directory once
os.makedirs("figs", exist_ok=True)

def generate_bar_chart(person_data):
    name = person_data.iloc[0]
    gifts = person_data.iloc[1:].sort_values(ascending=False)

    # Tema com grade branca
    sns.set_theme(style="whitegrid")  # Estilo que inclui as linhas de grade horizontais

    gifts_df = pd.DataFrame({
        'gift': gifts.index,
        'score': gifts.values
    })

    # Normalizar scores para 0.2 a 1.0
    min_score = gifts_df['score'].min()
    max_score = gifts_df['score'].max()
    norm_scores = (gifts_df['score'] - min_score) / (max_score - min_score)

    # Criar colormap manual
    cmap = sns.color_palette("Greens", as_cmap=True)
    colors = [cmap(0.2 + 0.8 * x) for x in norm_scores]

    fig, ax = plt.subplots(figsize=(10, 6))

    # Criar barras
    for i, (index, row) in enumerate(gifts_df.iterrows()):
        ax.barh(
            y=row['gift'],
            width=row['score'],
            color=colors[i]
        )
        ax.text(row['score'] + 0.3, i, str(row['score']), va='center', fontsize=9)

    ax.set_title(f"Dons Espirituais de {name}", fontsize=16)

    # Remover título dos eixos
    ax.set_xlabel("")
    ax.set_ylabel("")

    # Retirar linhas de grade
    ax.xaxis.grid(False)  # Linhas de grade verticais invisíveis
    ax.yaxis.grid(False)  # Linhas de grade horizontais visíveis

    # Remover eixo X (baixo)
    ax.get_xaxis().set_visible(False)

    # Inverter Y para maiores em cima
    ax.invert_yaxis()

    plt.tight_layout()

    output_path = os.path.join("figs", f"{name}.png")
    plt.savefig(output_path, dpi=300)
    plt.close(fig)

if __name__ == "__main__":
    df = pd.read_csv("dons.csv")

    for _, row in df.iterrows():
        generate_bar_chart(row)
