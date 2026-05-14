# Notas de Implementação

O projeto foi estruturado para permitir evolução incremental sem overengineering. Os componentes UI base ficam em `src/components/ui`, os componentes específicos do produto ficam em `src/components/tms`, e as páginas consomem os contratos do backend através de `src/lib/api.ts`.

A aparência segue a referência visual dos anexos: paleta navy, branco, cinzento claro, cards arredondados, tabelas com cabeçalho cinzento, badges de estado e layout enterprise SaaS.

A aplicação ainda não possui backend. Todos os dados são estáticos e devem ser substituídos por serviços HTTP quando a API estiver disponível.
