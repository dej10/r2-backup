import { Elysia } from "elysia";
import dotenv from 'dotenv';
import { dbBackupController } from "./controllers/db";
import { dirBackupController } from "./controllers/directory";
import { cron } from '@elysiajs/cron'
dotenv.config();

const app = new Elysia();

app.use(
  cron({
    name : 'db-backup',
     pattern: String(process.env.CRON_FREQUENCY),
     run (){
       if (process.env.BACKUP_TYPE?.toLowerCase() === 'database'){
         console.log('database cron job starting')
         dbBackupController()
       }
       if (process.env.BACKUP_TYPE?.toLowerCase() === 'directory'){
          console.log('directory cron job starting')
         dirBackupController()
       }

     }
  })
)


//Listen for traffic
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
