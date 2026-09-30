# Rpg completo

https://github.com/Ruanmestre12/herdeiros-despertar.git

Baixe todos os dados, códigos e prompts desse projeto e mantenha-o fiel, mantendo a identidade visual e aplicando as seguintes correções ao sistema existente:

ADICIONAR AS SEGUINTES CORREÇÕES AO SISTEMA EXISTENTE.
IMPORTANTE:
Não remover nenhuma funcionalidade que já esteja funcionando.
Não alterar as regras existentes fora dos pontos especificados abaixo.
Implementar exatamente os comportamentos descritos.
A Absorção de PF deve ser implementada com atenção especial à quantidade de dados e à soma final do Espírito.

1. AÇÕES RÁPIDAS — ABSORÇÃO DE PF
Na área de Ações Rápidas, já existe a ação Forçar o Fluxo, mas está faltando a ação:
ABSORVER PF
Criar um botão/ação chamado “Absorver PF”.
REGRA PRINCIPAL
O atributo Espírito possui DUAS funções diferentes nessa ação:
1ª função — determinar a quantidade de D20
A quantidade de D20 rolados é exatamente igual ao valor de Espírito do personagem.
Exemplos:
Espírito 1 → rola 1d20.
Espírito 2 → rola 2d20.
Espírito 3 → rola 3d20.
Espírito 4 → rola 4d20.
Portanto:
Quantidade de D20 = Espírito
2ª função — ser somado novamente ao resultado final
Depois de rolar todos os D20 e converter cada resultado em PF, o sistema deve somar novamente o valor de Espírito como um valor fixo ao total final.
Exemplo completo:
Personagem possui Espírito 2.
O sistema rola 2d20.
Cada um dos dois resultados é convertido individualmente em PF.
Soma os PF obtidos nos dois dados.
Depois disso, adiciona +2 PF, porque o personagem possui Espírito 2.
Ou seja:
PF final = PF obtido nos D20 + valor de Espírito
Isso é obrigatório.
TABELA DE CONVERSÃO DOS D20
Depois de rolar os D20, analisar cada resultado individualmente:
1 a 7: absorve 1/3 do valor obtido no dado.
8 a 14: absorve metade do valor obtido no dado.
15 a 19: absorve o valor completo do dado.
20: resultado crítico, absorve o dobro do valor obtido no dado.
Cada D20 deve ser calculado separadamente.
Exemplo
Personagem com Espírito 2:
Rola:
2d20 → 6 e 17
Resultado:
D20 = 6 → faixa 1–7 → gera 1/3 de 6.
D20 = 17 → faixa 15–19 → gera 17 PF.
Depois:
PF dos dados + Espírito 2 = PF final.
O sistema deve realizar esse cálculo automaticamente.
O QUE DEVE APARECER NA INTERFACE
Quando o jogador clicar em Absorver PF, mostrar:
Quantidade de D20 baseada no Espírito.
Resultado de cada D20.
Faixa em que cada resultado caiu.
Quanto de PF cada dado gerou.
Se houve um resultado 20/crítico.
Soma dos PF gerados pelos dados.
Valor de Espírito adicionado no final.
Total final de PF absorvido.
Depois do cálculo, atualizar automaticamente o PF atual do personagem.
NÃO confundir:
Espírito não serve apenas para determinar os dados.
Ele também deve ser adicionado novamente ao total final.
Exemplo:
Espírito 2 → 2d20 → calcula os dois resultados → soma os resultados convertidos → +2 PF de Espírito → total final.

2. ARMA DE VONTADE / HISTÓRIA / IDENTIDADE DO HUMANO
Na ficha do Humano existe uma arma formada pela:
Vontade + História + Identidade
Essa arma deve possuir um campo para definir o tipo/modelo da arma.
O tipo de arma determina o dano, utilizando exclusivamente os valores de dano de armas já estabelecidos nas regras.
ATAQUE DA ARMA
O ataque da arma utiliza Mente.
A quantidade de D20 do teste de acerto deve ser:
D20 de ataque = Mente + 2
Exemplos:
Mente 1 → 3d20.
Mente 2 → 4d20.
Mente 3 → 5d20.
Sempre que o valor de Mente aumentar, a quantidade de D20 do ataque deve aumentar automaticamente.
Não deixar o número de dados fixo.
DANO DA ARMA
O dano da arma é determinado pelo tipo/modelo da arma.
O valor de Mente NÃO deve aumentar diretamente o dano da arma.
Mente determina a quantidade de D20 utilizada para o acerto.
O dano vem da tabela de dano de armas já existente nas regras.
Não criar danos novos e não permitir que o dano ultrapasse os limites estabelecidos no sistema.

3. HISTÓRIA — ADICIONAR ANOTAÇÕES
Na área História da ficha do jogador, adicionar uma nova seção chamada:
ANOTAÇÕES
Essa área deve ser um campo de texto livre para o jogador escrever o que quiser.
Pode ser utilizada para:
Anotar acontecimentos da mesa.
Registrar informações importantes.
Fazer anotações pessoais sobre a campanha.
Registrar pistas.
Anotar objetivos.
Escrever qualquer informação que o jogador queira guardar.
As anotações devem ser salvas junto à ficha do personagem e permanecer disponíveis quando o jogador voltar à ficha.
Permitir editar e salvar as anotações livremente.

4. MANTER O QUE JÁ ESTÁ CORRETO
Não modificar as funcionalidades que já estão funcionando corretamente:
Nomenclaturas.
Sistema de combate do Mestre.
Ação de ataque.
Iniciativa.
Esquiva.
Acerto.
Dano.
Mitigação/Bloqueio.
Inventário.
História já existente.
Rolador.
Forçar o Fluxo.
Sincronia.
Habilidades.
Apenas acrescentar/corrigir:
Absorver PF nas Ações Rápidas.
Quantidade de D20 da Absorção = Espírito.
Conversão individual dos resultados dos D20.
Depois de calcular os D20, adicionar novamente o valor de Espírito ao total.
Arma de Vontade/História/Identidade com ataque baseado em Mente + 2 D20.
Atualização automática dos dados de ataque quando Mente aumentar.
Dano da arma baseado no tipo/modelo definido nas regras.
Seção “Anotações” dentro de História.
NÃO alterar nenhuma outra regra ou funcionalidade do RPG.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ad45918e-2bd4-4b75-a82b-78877e9d7235).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
