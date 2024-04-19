import pandas as pd
import matplotlib.pyplot as plt
import os
import numpy as np

def generate_bar_chart(df):
    # Extract the person's name and gift values
    name = df.iloc[0, 0]
    gifts = df.iloc[0, 1:]

    # Sort the gift values in descending order
    gifts = gifts.sort_values(ascending=True)

    # Sort de gifts by name in ascending order
    # gifts = gifts.sort_index(ascending=False)

    # Create a color gradient (from light green to dark green)
    colors = plt.cm.Greens(np.linspace(0.2, 1, len(gifts)))

    # Use dark green color
    # colors = "darkgreen"

    # Create the bar chart
    plt.figure(figsize=(10, 6))
    plt.barh(gifts.index, gifts, color=colors)

    # Add title
    plt.title(f"Gráfico dos Dons Espirituais para {name}")

    # Display the value on each bar
    for i, v in enumerate(gifts):
        plt.text(v + 0.2, i, str(v), va="center")

    # Create the "figs" directory if it does not exist
    if not os.path.exists("figs"):
        os.makedirs("figs")

    # Save the chart as a PNG file
    plt.tight_layout()
    output_path = os.path.join("figs", f"{name}.png")
    plt.savefig(output_path, dpi=300)

if __name__ == "__main__":
    # Read the CSV file
    df = pd.read_csv("dons.csv")

    # Generate a bar chart for each row
    for line in df.iterrows():
        generate_bar_chart(pd.DataFrame([line[1]]))
