# Frontend AWS Auto Deploy

이 문서는 `Flowdeck-FE` 레포지토리를 GitHub Actions로 빌드한 뒤 EC2의 브랜치별 정적 파일 경로에 자동 배포하는 설정 절차입니다.

## 배포 방식

- `develop` 브랜치에 프론트 코드 변경이 push되면 `frontend-dev/app`으로 배포됩니다.
- `main` 브랜치에 프론트 코드 변경이 push되면 `frontend-prod/app`으로 배포됩니다.
- GitHub Actions가 `npm ci`와 `npm run build`를 실행합니다.
- 빌드 결과물인 `dist/`를 EC2의 배포 경로로 `rsync --delete` 동기화합니다.
- 프론트는 Nginx 같은 웹 서버가 각 배포 경로를 정적 루트로 서빙한다고 가정합니다.

## GitHub Secrets

`Flowdeck-FE` 레포지토리의 `Settings > Secrets and variables > Actions`에 아래 값을 등록합니다.

| Secret | 예시 | 설명 |
| --- | --- | --- |
| `FRONTEND_HOST` | `13.125.10.20` | EC2 퍼블릭 IP 또는 도메인 |
| `FRONTEND_USER` | `ubuntu` | SSH 접속 사용자 |
| `FRONTEND_PORT` | `22` | SSH 포트. 생략하면 `22` |
| `FRONTEND_SSH_KEY` | `-----BEGIN OPENSSH PRIVATE KEY-----...` | EC2에 접속 가능한 private key |
| `FRONTEND_BASE_PATH` | `/var/www` | 기본 배포 루트. 생략하면 `/var/www` |
| `FRONTEND_DEV_DEPLOY_PATH` | `/var/www/frontend-dev/app` | dev 배포 경로. 생략하면 `$FRONTEND_BASE_PATH/frontend-dev/app` |
| `FRONTEND_PROD_DEPLOY_PATH` | `/var/www/frontend-prod/app` | prod 배포 경로. 생략하면 `$FRONTEND_BASE_PATH/frontend-prod/app` |
| `VITE_API_BASE_URL_DEV` | `http://54.180.241.193:8081` | dev 백엔드 API base URL |
| `VITE_WS_URL_DEV` | `ws://54.180.241.193:8081/ws` | dev WebSocket URL |
| `VITE_API_BASE_URL_PROD` | `http://54.180.241.193:8080` | prod 백엔드 API base URL |
| `VITE_WS_URL_PROD` | `ws://54.180.241.193:8080/ws` | prod WebSocket URL |

정적 파일은 EC2에서 서빙되지만, JavaScript는 사용자의 브라우저에서 실행됩니다.
따라서 프론트 빌드에 `localhost`가 들어가면 EC2가 아니라 접속자 PC의 `localhost`로 요청합니다.
같은 origin의 `/api`, `/ws`를 쓰려면 Nginx에서 해당 경로를 백엔드 컨테이너로 proxy해야 합니다.

## EC2 사전 준비

EC2에 배포 디렉터리를 만들고 SSH 사용자가 쓸 수 있게 권한을 설정합니다.

```bash
sudo mkdir -p /var/www/frontend-dev/app /var/www/frontend-prod/app
sudo chown -R ubuntu:ubuntu /var/www/frontend-dev /var/www/frontend-prod
```

Nginx는 SPA 라우팅을 위해 `try_files`를 설정해야 합니다.

```nginx
server {
  listen 80;
  server_name dev.your-domain.example.com;

  root /var/www/frontend-dev/app;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }
}

server {
  listen 80;
  server_name your-domain.example.com;

  root /var/www/frontend-prod/app;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

설정 후 Nginx를 확인하고 reload합니다.

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 동작 확인

1. GitHub Actions의 `Deploy Frontend to EC2` 워크플로를 수동 실행하거나 `develop` 또는 `main` 브랜치에 push합니다.
2. Actions 로그에서 `Build`와 `Deploy dist to EC2` 단계가 통과했는지 확인합니다.
3. 브라우저에서 dev 또는 prod 프론트 도메인에 접속해 새 화면이 반영됐는지 확인합니다.
