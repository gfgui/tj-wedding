# Casamento Tailany & Jeffson

Galeria colaborativa de fotos para o dia do casamento (10 de outubro de 2026). Os
convidados informam o nome, escolhem um papel e um avatar, e a partir daí enviam
fotos, curtem e disputam o ranking de quem mais fotografou.

Next.js 16 (App Router) com o backend nas próprias route handlers — não existe
serviço separado. Postgres e MinIO sobem via Docker Compose.

## Subir o ambiente

```bash
pnpm install && docker compose up -d && pnpm db:migrate && pnpm dev
```

- App: http://localhost:3000
- Moderação: http://localhost:3000/admin (senha em `ADMIN_PASSWORD`)
- Console do MinIO: http://localhost:9001 (`minioadmin` / `minioadmin`)

Copie `.env.example` para `.env` antes do primeiro `pnpm dev`. O compose já cria o
bucket `casamento-fotos` com leitura anônima e libera CORS para `localhost:3000`.

## Enviando fotos

O convidado tem duas origens, e pode juntar ate 10 fotos num envio so:

- **Câmera do app** — previa ao vivo dentro de uma moldura polaroide, com filtro
  que pode ser ligado ou desligado e troca entre camera frontal e traseira. O
  filtro e gravado no pixel no momento da captura, e a foto sai no mesmo recorte
  quadrado que aparecia na previa.
- **Galeria do celular** — selecao multipla. Estas sobem como estao: alterar a
  foto que a pessoa ja tinha seria mexer no que nao e nosso.

A legenda digitada vale para todas as fotos do lote e aparece como placeholder
em cada cartao; quem quiser personalizar uma foto especifica so escrever nela. O
envio e sequencial, com barra de progresso por foto — se uma falhar, as que
subiram saem da fila e so a que falhou fica para tentar de novo.

### O filtro polaroide

A previa usa `filter` do CSS no video e o arquivo salvo usa uma matriz de cor
equivalente no canvas. As duas implementacoes sao conferidas uma contra a outra:
a matriz reproduz `sepia/saturate/contrast/brightness` como a spec de Filter
Effects define, com desvio maximo de 2/255 em relacao ao motor do navegador, e o
raio da vinheta segue o `farthest-corner` do `radial-gradient`. E isso que
sustenta a promessa de que a foto sai como a previa mostrou.

> A camera exige **contexto seguro**: funciona em `localhost` e em HTTPS. Aberto
> pelo IP da rede local via HTTP, o navegador bloqueia o acesso — o app avisa e
> oferece a galeria como alternativa.

## Como a foto viaja

1. `POST /api/photos/upload-url` grava uma linha `PENDING` amarrada ao convidado e
   devolve uma URL assinada.
2. O celular envia o arquivo **direto ao storage** — o Next não recebe os bytes,
   então não há limite de body nem consumo de memória no servidor.
3. `POST /api/photos` lê o original de volta, gera com `sharp` uma miniatura
   (~600px) e uma versão de exibição (~1600px) com a rotação EXIF já aplicada, e
   promove a linha para `READY`.

O original em alta resolução fica guardado para os noivos depois; o grid carrega
só a miniatura e o lightbox só a versão de exibição.

## Modelo de dados

| Modelo  | Papel |
|---------|-------|
| `Guest` | Convidado. `sessionToken` opaco em cookie `httpOnly`, válido por 3 dias. |
| `Photo` | Foto e suas três chaves no storage, mais `width`/`height` reais, `effect` (filtro usado na captura) e `likeCount` denormalizado. |
| `Like`  | Curtida, com chave composta `(photoId, guestId)` — uma por pessoa. |

Os 6 papéis e os 24 avatares são dados fixos de design e vivem em
`src/lib/wedding.ts`, não no banco.

## Sem autenticação

A festa dura um dia. Não há senha nem login: o nome digitado vira um `Guest` e o
cookie identifica a pessoa até o fim do evento. O `/admin` é a única área com
senha, lida de `ADMIN_PASSWORD` e comparada em tempo constante.

## Ir para produção (Cloudflare R2)

A camada de storage fala S3, então só mudam as variáveis de ambiente:

```
S3_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
S3_ACCESS_KEY_ID / S3_SECRET_ACCESS_KEY   # do token do R2
S3_FORCE_PATH_STYLE=false                 # R2 usa virtual-host
NEXT_PUBLIC_MEDIA_URL=https://fotos.seudominio.com
```

No R2, libere CORS para `PUT` a partir do domínio do site — é o mesmo requisito
que o `MINIO_API_CORS_ALLOW_ORIGIN` cobre localmente. Nenhuma linha de código
muda.

## Antes do dia

- [ ] Trocar `ADMIN_PASSWORD` por algo real.
- [ ] Apontar `DATABASE_URL` para um Postgres gerenciado.
- [ ] Migrar o storage para o R2 conforme acima.
- [ ] Fixar a tag do `minio/mc` no compose (o `minio` já está fixado).
- [ ] Servir o site por HTTPS — sem isso a câmera do app não abre no celular.

## Referência de design

`design-reference/` é o projeto original do Figma Make (Vite, tudo num
`App.tsx`). Fica fora do `tsconfig` e do Biome — serve só de consulta visual e
pode ser apagado quando não for mais útil.
