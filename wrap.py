import matplotlib.pyplot as plt
import textwrap

# dados de exemplo
x = ["Nome Muito Longo Aqui", "Nome Médio", "Nome Curto"]
y = [12, 8, 6]

# definindo o tamanho máximo do texto
max_chars = 12

# quebrando o texto em várias linhas
x_wrapped = ["\n".join(label.split()) for label in x]

# criando o gráfico
plt.bar(x_wrapped, y)

# configurando o rótulo do eixo x
plt.xticks(rotation=90, fontsize=8)

# exibindo o gráfico
plt.show()
