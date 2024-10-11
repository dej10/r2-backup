# Elysia with Bun runtime

## Getting Started
To get started with this template, simply paste this command into your terminal:
```bash
bun create elysia ./elysia-example
```

## Development
To start the development server run:
```bash
bun run dev
```


## Installation & Deployment
```bash  
cd /var/www/scripts/
git clone https://github.com/dej10/r2-backup.git
cd r2-backup 
pm2 start --interpreter ~/.bun/bin/bun index.ts --name db-backup-worker
```

Open http://localhost:3000/ with your browser to see the result.
