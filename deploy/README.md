# Arquivos de deploy

## `r2-cors.json`

Regra de CORS do bucket no Cloudflare R2. **Sem ela nenhum upload funciona em
produção**, porque o celular envia a foto direto ao R2 pela URL assinada — o
Next nunca toca nos bytes. É o equivalente ao `MINIO_API_CORS_ALLOW_ORIGIN` que
o `docker-compose.yml` resolve no ambiente local.

Troque `AllowedOrigins` pelo domínio real do site (com `https://`, sem barra no
final) e aplique em **R2 → seu bucket → Settings → CORS Policy**.

`AllowedHeaders` precisa de `content-type`: a URL assinada é gerada com esse
cabeçalho e o navegador o envia no `PUT`. Sem ele o preflight falha e o upload
morre antes de começar.

Para conferir depois de aplicar, com o site já no ar:

```bash
curl -i -X OPTIONS "https://<endpoint-do-r2>/<bucket>/teste" \
  -H "Origin: https://<dominio-do-site>" \
  -H "Access-Control-Request-Method: PUT" \
  -H "Access-Control-Request-Headers: content-type"
```

A resposta precisa trazer `access-control-allow-origin` com o seu domínio. Se
vier vazia ou com erro, a regra não pegou.
